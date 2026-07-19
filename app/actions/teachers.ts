'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTeachers() {
    return await prisma.teacher.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function createTeacher(data: { name: string, phone?: string, email?: string }) {
    const teacher = await prisma.teacher.create({
        data
    })
    revalidatePath('/admin/teachers')
    return teacher
}

export async function updateTeacher(id: string, data: { name?: string, phone?: string, email?: string }) {
    const teacher = await prisma.teacher.update({
        where: { id },
        data
    })
    revalidatePath('/admin/teachers')
    return teacher
}

export async function deleteTeacher(id: string) {
    await prisma.teacher.delete({
        where: { id }
    })
    revalidatePath('/admin/teachers')
}
