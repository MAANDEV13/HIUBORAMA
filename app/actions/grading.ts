'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// GradingScale Actions
export async function getGradingScales() {
    return prisma.gradingScale.findMany({
        orderBy: {
            minMark: 'desc'
        }
    })
}

export async function createGradingScale(data: { grade: string; minMark: number; gpaPoint: number }) {
    try {
        const result = await prisma.gradingScale.create({
            data
        })
        revalidatePath('/admin/settings')
        return { success: true, data: result }
    } catch (e: any) {
        console.error('Failed to create grading scale:', e)
        return { error: 'Failed to create grading scale. Grade might already exist.' }
    }
}

export async function updateGradingScale(id: string, data: { grade: string; minMark: number; gpaPoint: number }) {
    try {
        const result = await prisma.gradingScale.update({
            where: { id },
            data
        })
        revalidatePath('/admin/settings')
        return { success: true, data: result }
    } catch (e: any) {
        console.error('Failed to update grading scale:', e)
        return { error: 'Failed to update grading scale.' }
    }
}

export async function deleteGradingScale(id: string) {
    try {
        await prisma.gradingScale.delete({
            where: { id }
        })
        revalidatePath('/admin/settings')
        return { success: true }
    } catch (e: any) {
        console.error('Failed to delete grading scale:', e)
        return { error: 'Failed to delete grading scale.' }
    }
}
