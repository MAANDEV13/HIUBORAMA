'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/session"

export async function getSemesters() {
    return await prisma.semester.findMany({
        orderBy: { startDate: 'desc' }
    })
}

export async function createSemester(data: { name: string, startDate: Date, endDate: Date }) {
    await requireAdmin();
    const semester = await prisma.semester.create({
        data
    })
    revalidatePath('/admin/scheduling')
    return semester
}

export async function updateSemester(id: string, data: { name: string }) {
    await requireAdmin();
    const semester = await prisma.semester.update({
        where: { id },
        data
    })
    revalidatePath('/admin/grades')
    revalidatePath('/admin/scheduling')
    return semester
}
