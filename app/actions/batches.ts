'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getBatches() {
    return await prisma.batch.findMany({
        orderBy: { startYear: 'desc' },
        include: {
            _count: {
                select: { students: true }
            }
        }
    })
}

export async function createBatch(data: { name: string, startYear: number }) {
    const batch = await prisma.batch.create({
        data
    })
    revalidatePath('/admin/batches')
    return batch
}

export async function assignStudentToBatch(studentId: string, batchId: string) {
    await prisma.student.update({
        where: { id: studentId },
        data: { batchId }
    })
    revalidatePath('/admin/students')
    revalidatePath('/admin/students')
}

export async function deleteBatch(id: string) {
    try {
        await prisma.batch.delete({
            where: { id }
        })
        revalidatePath('/admin/batches')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete batch' }
    }
}
