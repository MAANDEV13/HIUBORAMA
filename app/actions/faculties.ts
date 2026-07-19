'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/session"

export async function getFaculties() {
    return await prisma.faculty.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { departments: true }
            }
        }
    })
}

export async function createFaculty(data: { name: string, code: string }) {
    await requireAdmin();
    const faculty = await prisma.faculty.create({ data })
    revalidatePath('/admin/faculties')
    revalidatePath('/admin/departments')
    revalidatePath('/admin/classes')
    revalidatePath('/admin/batches')
    return faculty
}

export async function updateFaculty(id: string, data: { name?: string, code?: string }) {
    await requireAdmin();
    const faculty = await prisma.faculty.update({
        where: { id },
        data
    })
    revalidatePath('/admin/faculties')
    revalidatePath('/admin/departments')
    revalidatePath('/admin/batches')
    return faculty
}

export async function deleteFaculty(id: string) {
    await requireAdmin();
    try {
        // Check if faculty has departments
        const deptCount = await prisma.department.count({ where: { facultyId: id } })
        if (deptCount > 0) {
            return { error: `Cannot delete: this faculty has ${deptCount} department(s). Remove them first.` }
        }
        await prisma.faculty.delete({ where: { id } })
        revalidatePath('/admin/faculties')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete faculty' }
    }
}
