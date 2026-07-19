'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function resetStudentPassword(formData: FormData) {
    const studentId = formData.get('studentId') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!studentId || !newPassword) {
        return { error: 'Student ID and New Password are required' };
    }

    try {
        // Find user by username (which is the studentId)
        const user = await prisma.user.findUnique({
            where: { username: studentId },
        });

        if (!user) {
            return { error: 'User not found' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
            },
        });

        return { success: true, message: `Password for ${studentId} has been reset successfully.` };
    } catch (error) {
        console.error('Reset Password Error:', error);
        return { error: 'Failed to reset password. Please try again.' };
    }
}

export async function searchStudents(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const students = await prisma.student.findMany({
            where: {
                OR: [
                    { studentId: { contains: query } },
                    { user: { name: { contains: query } } },
                ],
            },
            include: {
                user: true,
            },
            take: 10,
        });

        return students.map(s => ({
            id: s.id,
            studentId: s.studentId,
            name: s.user.name,
        }));
    } catch (error) {
        console.error('Search Student Error:', error);
        return [];
    }
}
