'use server';

import { parse } from 'csv-parse/sync';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper function to calculate grade and GPA dynamically
type GradingScaleType = { grade: string; minMark: number; gpaPoint: number };

function calculateGrade(total: number, scales: GradingScaleType[]): { grade: string; gpaPoint: number } {
    if (!scales || scales.length === 0) {
        // Fallback if db is empty
        if (total >= 85) return { grade: 'A', gpaPoint: 4.0 };
        if (total >= 75) return { grade: 'B+', gpaPoint: 3.5 };
        if (total >= 70) return { grade: 'B', gpaPoint: 3.0 };
        if (total >= 65) return { grade: 'C+', gpaPoint: 2.5 };
        if (total >= 60) return { grade: 'C', gpaPoint: 2.0 };
        if (total >= 55) return { grade: 'D+', gpaPoint: 1.5 };
        if (total >= 50) return { grade: 'D', gpaPoint: 1.0 };
        return { grade: 'F', gpaPoint: 0.0 };
    }

    const sortedScales = [...scales].sort((a, b) => b.minMark - a.minMark);
    for (const scale of sortedScales) {
        if (total >= scale.minMark) {
            return { grade: scale.grade, gpaPoint: scale.gpaPoint };
        }
    }
    return { grade: 'F', gpaPoint: 0.0 };
}

export async function uploadGrades(formData: FormData) {
    const file = formData.get('file') as File;
    const semesterId = formData.get('semesterId') as string;

    if (!file || !semesterId) {
        return { error: 'File and semester are required' };
    }

    try {
        const text = await file.text();
        const records = parse(text, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as Array<{
            studentId: string;
            courseCode: string;
            attendance?: string;
            assessment?: string;
            midExam?: string;
            finalExam?: string
        }>;

        // Expected columns: studentId, courseCode, attendance, assessment, midExam, finalExam
        let count = 0;
        let errors: string[] = [];
        
        // Fetch scales once for all records
        const scales = await prisma.gradingScale.findMany();

        for (const record of records) {
            if (!record.studentId || !record.courseCode) continue;

            const student = await prisma.student.findUnique({
                where: { studentId: record.studentId },
            });

            const course = await prisma.course.findUnique({
                where: { code: record.courseCode },
            });

            if (!student || !course) {
                errors.push(`Student ${record.studentId} or Course ${record.courseCode} not found`);
                continue;
            }

            const attendance = parseFloat(record.attendance || '0');
            const assessment = parseFloat(record.assessment || '0');
            const midExam = parseFloat(record.midExam || '0');
            const finalExam = parseFloat(record.finalExam || '0');

            const total = attendance + assessment + midExam + finalExam;
            const { grade, gpaPoint } = calculateGrade(total, scales);
            const status = grade === 'F' ? 'FAILED' : 'PASSED';

            await prisma.enrollment.upsert({
                where: {
                    studentId_courseId_semesterId: {
                        studentId: student.id,
                        courseId: course.id,
                        semesterId: semesterId,
                    },
                },
                update: {
                    attendance,
                    assessment,
                    midExam,
                    finalExam,
                    total,
                    grade,
                    gpaPoint,
                    status,
                },
                create: {
                    studentId: student.id,
                    courseId: course.id,
                    semesterId: semesterId,
                    attendance,
                    assessment,
                    midExam,
                    finalExam,
                    total,
                    grade,
                    gpaPoint,
                    status,
                },
            });
            count++;
        }

        revalidatePath('/admin/grades');
        return { success: true, count, errors: errors.length > 0 ? errors : undefined };
    } catch (error) {
        console.error('CSV Upload Error:', error);
        return { error: 'Failed to process CSV file. Please check the format.' };
    }
}

export async function updateGrade(enrollmentId: string, data: {
    attendance: number;
    assessment: number;
    midExam: number;
    finalExam: number;
}) {
    try {
        const { attendance, assessment, midExam, finalExam } = data;
        const total = attendance + assessment + midExam + finalExam;
        const scales = await prisma.gradingScale.findMany();
        const { grade, gpaPoint } = calculateGrade(total, scales);
        const status = grade === 'F' ? 'FAILED' : 'PASSED';

        await prisma.enrollment.update({
            where: { id: enrollmentId },
            data: {
                attendance,
                assessment,
                midExam,
                finalExam,
                total,
                grade,
                gpaPoint,
                status,
            },
        });

        revalidatePath('/admin/grades');
        return { success: true };
    } catch (error) {
        console.error('Update Grade Error:', error);
        return { error: 'Failed to update grade' };
    }
}

export async function bulkUnenrollByBatch(
    batchId: string,
    courseId: string,
    semesterId: string
) {
    try {
        // Get all students in the batch
        const students = await prisma.student.findMany({
            where: { batchId },
            select: { id: true }
        });

        const studentIds = students.map(s => s.id);

        if (studentIds.length === 0) {
            return { success: true, count: 0 };
        }

        // Delete enrollments for these students in this course/semester
        const result = await prisma.enrollment.deleteMany({
            where: {
                studentId: { in: studentIds },
                courseId: courseId,
                semesterId: semesterId
            }
        });

        revalidatePath('/admin/grades');
        return { success: true, count: result.count };
    } catch (error) {
        console.error('Bulk Unenroll Error:', error);
        return { error: 'Failed to unenroll students' };
    }
}
