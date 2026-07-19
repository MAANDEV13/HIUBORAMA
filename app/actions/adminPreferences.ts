'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export interface AdminPreferences {
    showFailedStudentsReport: boolean;
    showRecentEnrollments: boolean;
}

export interface PreferencesResult {
    success: boolean;
    error?: string;
    preferences?: AdminPreferences;
}

/**
 * Get admin preferences, creating default ones if they don't exist
 */
export async function getAdminPreferences(): Promise<PreferencesResult> {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }

        let preferences = await prisma.adminPreferences.findUnique({
            where: { userId: session.userId },
        });

        // Create default preferences if they don't exist
        if (!preferences) {
            preferences = await prisma.adminPreferences.create({
                data: {
                    userId: session.userId,
                    showFailedStudentsReport: true,
                    showRecentEnrollments: true,
                },
            });
        }

        return {
            success: true,
            preferences: {
                showFailedStudentsReport: preferences.showFailedStudentsReport,
                showRecentEnrollments: preferences.showRecentEnrollments,
            },
        };
    } catch (error) {
        console.error('Get admin preferences error:', error);
        return { success: false, error: 'Failed to load preferences' };
    }
}

/**
 * Update admin preferences
 */
export async function updateAdminPreferences(
    preferences: Partial<AdminPreferences>
): Promise<PreferencesResult> {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }

        // Ensure preferences exist first
        let existing = await prisma.adminPreferences.findUnique({
            where: { userId: session.userId },
        });

        if (!existing) {
            existing = await prisma.adminPreferences.create({
                data: {
                    userId: session.userId,
                    showFailedStudentsReport: true,
                    showRecentEnrollments: true,
                },
            });
        }

        // Update preferences
        const updated = await prisma.adminPreferences.update({
            where: { userId: session.userId },
            data: preferences,
        });

        return {
            success: true,
            preferences: {
                showFailedStudentsReport: updated.showFailedStudentsReport,
                showRecentEnrollments: updated.showRecentEnrollments,
            },
        };
    } catch (error) {
        console.error('Update admin preferences error:', error);
        return { success: false, error: 'Failed to update preferences' };
    }
}
