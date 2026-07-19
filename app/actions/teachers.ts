'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/session"

export async function getTeachers() {
    return await prisma.teacher.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function createTeacher(data: { name: string, phone?: string, email?: string }) {
    await requireAdmin();
    const teacher = await prisma.teacher.create({
        data
    })
    revalidatePath('/admin/teachers')
    return teacher
}

export async function updateTeacher(id: string, data: { name?: string, phone?: string, email?: string }) {
    await requireAdmin();
    const teacher = await prisma.teacher.update({
        where: { id },
        data
    })
    revalidatePath('/admin/teachers')
    return teacher
}

export async function deleteTeacher(id: string) {
    await requireAdmin();
    await prisma.teacher.delete({
        where: { id }
    })
    revalidatePath('/admin/teachers')
}
