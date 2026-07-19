'use server';

import { parse } from 'csv-parse/sync';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function uploadCourses(formData: FormData) {
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
        }) as Array<{ code: string; name: string; credits?: string }>;

        // Expected columns: code, name, credits
        let count = 0;
        for (const record of records) {
            if (!record.code || !record.name) continue;

            await prisma.course.upsert({
                where: { code: record.code },
                update: {
                    name: record.name,
                    credits: record.credits ? parseInt(record.credits) : 3,
                },
                create: {
                    code: record.code,
                    name: record.name,
                    credits: record.credits ? parseInt(record.credits) : 3,
                },
            });
            count++;
        }

        revalidatePath('/admin/courses');
        return { success: true, count };
    } catch (error) {
        console.error('CSV Upload Error:', error);
        return { error: 'Failed to process CSV file. Please check the format.' };
    }
}

export async function getCourses() {
    return await prisma.course.findMany({
        orderBy: { code: 'asc' }
    });
}
