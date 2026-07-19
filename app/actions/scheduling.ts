'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- Semester Planning ---

export async function getBatchSemesters(semesterId: string) {
    return await prisma.batchSemester.findMany({
        where: { semesterId },
        include: {
            batch: true,
            courseAssignments: {
                include: {
                    course: true,
                    teacher: true
                }
            }
        }
    })
}

export async function assignBatchToSemester(batchId: string, semesterId: string, academicSemester: number) {
    const batchSemester = await prisma.batchSemester.create({
        data: {
            batchId,
            semesterId,
            academicSemester
        }
    })
    revalidatePath('/admin/scheduling')
    return batchSemester
}

// --- Course Scheduling ---

export async function assignCourseToBatchSemester(batchSemesterId: string, courseId: string, teacherId?: string) {
    const assignment = await prisma.courseAssignment.create({
        data: {
            batchSemesterId,
            courseId,
            teacherId
        }
    })
    revalidatePath('/admin/scheduling')
    return assignment
}

export async function updateCourseAssignment(assignmentId: string, teacherId: string) {
    const assignment = await prisma.courseAssignment.update({
        where: { id: assignmentId },
        data: { teacherId }
    })
    revalidatePath('/admin/scheduling')
    return assignment
}

export async function removeCourseAssignment(assignmentId: string) {
    await prisma.courseAssignment.delete({
        where: { id: assignmentId }
    })
    revalidatePath('/admin/scheduling')
}

// --- Bulk Registration ---

export async function registerBatchCourses(batchSemesterId: string) {
    // 1. Get the BatchSemester with all assignments
    const batchSemester = await prisma.batchSemester.findUnique({
        where: { id: batchSemesterId },
        include: {
            batch: {
                include: {
                    students: true
                }
            },
            courseAssignments: true
        }
    })

    if (!batchSemester) throw new Error("Batch Semester not found")

    const { students } = batchSemester.batch
    const { courseAssignments } = batchSemester
    const { semesterId } = batchSemester

    let enrollmentsCreated = 0

    // 2. Loop through students and courses to create enrollments
    for (const student of students) {
        for (const assignment of courseAssignments) {
            // Check if already enrolled
            const existing = await prisma.enrollment.findUnique({
                where: {
                    studentId_courseId_semesterId: {
                        studentId: student.id,
                        courseId: assignment.courseId,
                        semesterId: semesterId
                    }
                }
            })

            if (!existing) {
                await prisma.enrollment.create({
                    data: {
                        studentId: student.id,
                        courseId: assignment.courseId,
                        semesterId: semesterId,
                        status: "ENROLLED"
                    }
                })
                enrollmentsCreated++
            }
        }
    }

    return { success: true, enrollmentsCreated }
}

// --- Batch Semester Removal ---

export async function removeBatchSemester(batchSemesterId: string) {
    // 1. Get the batch semester with students and course assignments
    const batchSemester = await prisma.batchSemester.findUnique({
        where: { id: batchSemesterId },
        include: {
            batch: {
                include: {
                    students: true
                }
            },
            courseAssignments: true
        }
    })

    if (!batchSemester) throw new Error("Batch Semester not found")

    const { students } = batchSemester.batch
    const { courseAssignments } = batchSemester
    const { semesterId } = batchSemester

    // 2. Delete all enrollments for students in this batch for this semester
    const studentIds = students.map(s => s.id)
    const courseIds = courseAssignments.map(ca => ca.courseId)

    if (studentIds.length > 0 && courseIds.length > 0) {
        await prisma.enrollment.deleteMany({
            where: {
                studentId: { in: studentIds },
                courseId: { in: courseIds },
                semesterId: semesterId
            }
        })
    }

    // 3. Delete all course assignments
    await prisma.courseAssignment.deleteMany({
        where: { batchSemesterId }
    })

    // 4. Delete the batch semester itself
    await prisma.batchSemester.delete({
        where: { id: batchSemesterId }
    })

    revalidatePath('/admin/scheduling')
    return { success: true }
}
