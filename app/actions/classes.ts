'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/session"

export async function getClasses() {
    return await prisma.class.findMany({
        orderBy: { name: 'asc' },
        include: {
            department: { include: { faculty: true } },
            batchSemester: {
                include: {
                    batch: true,
                    semester: true
                }
            },
            _count: {
                select: { studentClasses: true }
            }
        }
    })
}

export async function getClassesByBatchSemester(batchSemesterId: string) {
    return await prisma.class.findMany({
        where: { batchSemesterId },
        orderBy: { name: 'asc' },
        include: {
            department: { include: { faculty: true } },
            batchSemester: {
                include: { batch: true, semester: true }
            },
            _count: {
                select: { studentClasses: true }
            }
        }
    })
}

export async function createClass(data: { name: string, departmentId: string, batchSemesterId: string }) {
    await requireAdmin();
    const cls = await prisma.class.create({ data })
    revalidatePath('/admin/classes')
    revalidatePath('/admin/batches')
    return cls
}

export async function updateClass(id: string, data: { name?: string }) {
    await requireAdmin();
    const cls = await prisma.class.update({
        where: { id },
        data
    })
    revalidatePath('/admin/classes')
    return cls
}

export async function deleteClass(id: string) {
    await requireAdmin();
    try {
        const scCount = await prisma.studentClass.count({ where: { classId: id } })
        if (scCount > 0) {
            return { error: `Cannot delete: ${scCount} student(s) are assigned to this class. Remove them first.` }
        }
        await prisma.class.delete({ where: { id } })
        revalidatePath('/admin/classes')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete class' }
    }
}

// ── Student ↔ Class Assignment ──────────────────────────

export async function getStudentsInClass(classId: string) {
    return await prisma.studentClass.findMany({
        where: { classId },
        include: {
            student: {
                include: { user: true, batchRel: true }
            }
        }
    })
}

export async function getStudentsForBatchSemester(batchSemesterId: string) {
    // Get the batchSemester to know which batch/semester
    const bs = await prisma.batchSemester.findUnique({
        where: { id: batchSemesterId },
        include: { batch: true }
    })
    if (!bs) return []

    // Return all students in this batch
    return await prisma.student.findMany({
        where: { batchId: bs.batchId },
        include: {
            user: true,
            studentClasses: {
                where: {
                    class: { batchSemesterId }
                },
                include: { class: true }
            }
        },
        orderBy: { studentId: 'asc' }
    })
}

export async function assignStudentsToClass(classId: string, studentIds: string[]) {
    await requireAdmin();
    let created = 0
    let skipped = 0

    for (const studentId of studentIds) {
        const existing = await prisma.studentClass.findUnique({
            where: { studentId_classId: { studentId, classId } }
        })
        if (!existing) {
            await prisma.studentClass.create({
                data: { studentId, classId }
            })
            created++
        } else {
            skipped++
        }
    }

    revalidatePath('/admin/classes')
    return { created, skipped }
}

export async function removeStudentFromClass(studentId: string, classId: string) {
    await prisma.studentClass.delete({
        where: { studentId_classId: { studentId, classId } }
    })
    revalidatePath('/admin/classes')
}

export async function bulkReassignStudents(
    fromClassId: string | null,
    toClassId: string,
    studentIds: string[]
) {
    let moved = 0

    for (const studentId of studentIds) {
        // Remove from old class if specified
        if (fromClassId) {
            try {
                await prisma.studentClass.delete({
                    where: { studentId_classId: { studentId, classId: fromClassId } }
                })
            } catch { /* may not exist */ }
        }

        // Add to new class
        const existing = await prisma.studentClass.findUnique({
            where: { studentId_classId: { studentId, classId: toClassId } }
        })
        if (!existing) {
            await prisma.studentClass.create({
                data: { studentId, classId: toClassId }
            })
            moved++
        }
    }

    revalidatePath('/admin/classes')
    return { moved }
}

// ── Carry forward classes from previous semester ────────

export async function carryForwardClasses(fromBatchSemesterId: string, toBatchSemesterId: string) {
    // Get all classes from the source semester
    const sourceClasses = await prisma.class.findMany({
        where: { batchSemesterId: fromBatchSemesterId },
        include: {
            studentClasses: true
        }
    })

    let classesCreated = 0
    let studentsAssigned = 0

    for (const srcClass of sourceClasses) {
        // Create the same class in the new semester
        let newClass
        try {
            newClass = await prisma.class.create({
                data: {
                    name: srcClass.name,
                    departmentId: srcClass.departmentId,
                    batchSemesterId: toBatchSemesterId,
                }
            })
            classesCreated++
        } catch {
            // Class may already exist (unique constraint)
            newClass = await prisma.class.findUnique({
                where: {
                    batchSemesterId_name_departmentId: {
                        batchSemesterId: toBatchSemesterId,
                        name: srcClass.name,
                        departmentId: srcClass.departmentId,
                    }
                }
            })
        }

        if (!newClass) continue

        // Copy student assignments
        for (const sc of srcClass.studentClasses) {
            const existing = await prisma.studentClass.findUnique({
                where: { studentId_classId: { studentId: sc.studentId, classId: newClass.id } }
            })
            if (!existing) {
                await prisma.studentClass.create({
                    data: { studentId: sc.studentId, classId: newClass.id }
                })
                studentsAssigned++
            }
        }
    }

    revalidatePath('/admin/classes')
    return { classesCreated, studentsAssigned }
}

// ── Hierarchy data for views ────────────────────────────

export async function getFullHierarchy() {
    return await prisma.faculty.findMany({
        orderBy: { name: 'asc' },
        include: {
            departments: {
                orderBy: { name: 'asc' },
                include: {
                    batches: {
                        orderBy: { startYear: 'desc' },
                        include: {
                            _count: { select: { students: true } },
                            batchSemesters: {
                                orderBy: { academicSemester: 'asc' },
                                include: {
                                    semester: true,
                                    classes: {
                                        orderBy: { name: 'asc' },
                                        include: {
                                            _count: { select: { studentClasses: true } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}
