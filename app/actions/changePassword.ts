'use server';

import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSession, createSession } from '@/lib/auth/session';

export interface ChangePasswordResult {
    success: boolean;
    error?: string;
    message?: string;
}

export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<ChangePasswordResult> {
    try {
        // Get current session
        const session = await getSession();
        if (!session) {
            return { success: false, error: 'Not authenticated' };
        }

        // Validate input
        if (!currentPassword || !newPassword) {
            return { success: false, error: 'All fields are required' };
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters' };
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isCurrentPasswordValid) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        await prisma.user.update({
            where: { id: session.userId },
            data: { password: hashedPassword },
        });

        return {
            success: true,
            message: 'Password changed successfully',
        };
    } catch (error) {
        console.error('Change password error:', error);
        return {
            success: false,
            error: 'An error occurred while changing password',
        };
    }
}
