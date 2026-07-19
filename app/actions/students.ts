'use server';

import { parse } from 'csv-parse/sync';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';

export async function uploadStudents(formData: FormData) {
    await requireAdmin();
    const file = formData.get('file') as File;

    if (!file) {
        return { error: 'No file uploaded' };
    }

    try {
        const text = await file.text();
        const records = parse(text, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as Array<{ studentId: string; name: string; program?: string; batch?: string }>;

        // Expected columns: studentId, name, program, batch
        let count = 0;

        // Fetch all batches for lookup
        const batches = await prisma.batch.findMany();

        for (const record of records) {
            if (!record.studentId || !record.name) continue;

            // Find matching batch
            const batchObj = batches.find(b => b.name === record.batch);

            // Create or update User first
            const hashedPassword = await bcrypt.hash(record.studentId, 10); // Default password is studentId

            const user = await prisma.user.upsert({
                where: { username: record.studentId },
                update: {
                    name: record.name,
                },
                create: {
                    username: record.studentId,
                    password: hashedPassword,
                    role: 'STUDENT',
                    name: record.name,
                },
            });

            // Create or update Student profile
            await prisma.student.upsert({
                where: { studentId: record.studentId },
                update: {
                    program: record.program || 'Bachelor',
                    batch: record.batch || new Date().getFullYear().toString(),
                    batchId: batchObj?.id, // Link to Batch model
                },
                create: {
                    studentId: record.studentId,
                    userId: user.id,
                    program: record.program || 'Bachelor',
                    batch: record.batch || new Date().getFullYear().toString(),
                    batchId: batchObj?.id, // Link to Batch model
                },
            });

            count++;
        }

        revalidatePath('/admin/students');
        return { success: true, count };
    } catch (error) {
        console.error('CSV Upload Error:', error);
        return { error: 'Failed to process CSV file. Please check the format.' };
    }
}

export async function createStudent(data: {
    studentId: string;
    name: string;
    email?: string;
    phone?: string;
    batchId?: string;
    batch?: string;
}) {
    await requireAdmin();
    try {
        // Find matching batch
        const batchObj = await prisma.batch.findUnique({
            where: { name: data.batch || "" }
        });
        
        const hashedPassword = await bcrypt.hash(data.studentId, 10);
        const user = await prisma.user.create({
            data: {
                username: data.studentId,
                password: hashedPassword,
                role: 'STUDENT',
                name: data.name
            }
        });

        await prisma.student.create({
            data: {
                studentId: data.studentId,
                userId: user.id,
                batch: data.batch,
                batchId: batchObj?.id
            }
        });

        revalidatePath('/admin/students');
        return { success: true };
    } catch (error) {
        console.error('Create Student Error:', error);
        return { error: 'Failed to create student' };
    }
}

export async function updateStudent(id: string, data: { name: string; program: string; batch: string }) {
    await requireAdmin();
    try {
        // Find matching batch
        const batchObj = await prisma.batch.findUnique({
            where: { name: data.batch }
        });

        // Update student
        const student = await prisma.student.update({
            where: { id },
            data: {
                program: data.program,
                batch: data.batch,
                batchId: batchObj?.id,
            },
            include: { user: true }
        });

        // Update user name
        await prisma.user.update({
            where: { id: student.userId },
            data: { name: data.name }
        });

        revalidatePath('/admin/students');
        return { success: true };
    } catch (error) {
        console.error('Update Student Error:', error);
        return { error: 'Failed to update student' };
    }
}

export async function deleteStudent(id: string) {
    await requireAdmin();
    try {
        const student = await prisma.student.findUnique({
            where: { id },
            select: { userId: true }
        });

        if (!student) {
            return { error: 'Student not found' };
        }

        // Delete enrollments first
        await prisma.enrollment.deleteMany({
            where: { studentId: id }
        });

        // Delete student
        await prisma.student.delete({
            where: { id }
        });

        // Delete user
        await prisma.user.delete({
            where: { id: student.userId }
        });

        revalidatePath('/admin/students');
        return { success: true };
    } catch (error) {
        console.error('Delete Student Error:', error);
        return { error: 'Failed to delete student' };
    }
}
