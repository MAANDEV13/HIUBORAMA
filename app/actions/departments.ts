'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/session"

export async function getDepartments() {
    return await prisma.department.findMany({
        orderBy: { name: 'asc' },
        include: {
            faculty: true,
            _count: {
                select: { batches: true, classes: true }
            }
        }
    })
}

export async function getDepartmentsByFaculty(facultyId: string) {
    return await prisma.department.findMany({
        where: { facultyId },
        orderBy: { name: 'asc' },
        include: {
            faculty: true,
            _count: {
                select: { batches: true, classes: true }
            }
        }
    })
}

export async function createDepartment(data: { name: string, code: string, facultyId: string }) {
    await requireAdmin();
    const department = await prisma.department.create({ data })
    revalidatePath('/admin/departments')
    revalidatePath('/admin/classes')
    revalidatePath('/admin/batches')
    return department
}

export async function updateDepartment(id: string, data: { name?: string, code?: string, facultyId?: string }) {
    await requireAdmin();
    const department = await prisma.department.update({
        where: { id },
        data
    })
    revalidatePath('/admin/departments')
    revalidatePath('/admin/batches')
    return department
}

export async function deleteDepartment(id: string) {
    await requireAdmin();
    try {
        const batchCount = await prisma.batch.count({ where: { departmentId: id } })
        const classCount = await prisma.class.count({ where: { departmentId: id } })
        if (batchCount > 0 || classCount > 0) {
            return { error: `Cannot delete: this department has ${batchCount} batch(es) and ${classCount} class(es). Reassign them first.` }
        }
        await prisma.department.delete({ where: { id } })
        revalidatePath('/admin/departments')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete department' }
    }
}
