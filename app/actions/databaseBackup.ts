'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export interface BackupResult {
    success: boolean;
    error?: string;
    data?: string; // JSON string
    message?: string;
}

/**
 * Export the database data as JSON
 */
export async function exportDatabase(): Promise<BackupResult> {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }

        // Fetch all data from all models
        const [
            users,
            students,
            semesters,
            courses,
            enrollments,
            teachers,
            batches,
            batchSemesters,
            courseAssignments,
            adminPreferences
        ] = await prisma.$transaction([
            prisma.user.findMany(),
            prisma.student.findMany(),
            prisma.semester.findMany(),
            prisma.course.findMany(),
            prisma.enrollment.findMany(),
            prisma.teacher.findMany(),
            prisma.batch.findMany(),
            prisma.batchSemester.findMany(),
            prisma.courseAssignment.findMany(),
            prisma.adminPreferences.findMany()
        ]);

        const backupData = {
            version: 1,
            timestamp: new Date().toISOString(),
            data: {
                users,
                students,
                semesters,
                courses,
                enrollments,
                teachers,
                batches,
                batchSemesters,
                courseAssignments,
                adminPreferences
            }
        };

        return {
            success: true,
            data: JSON.stringify(backupData, null, 2),
            message: 'Database exported successfully',
        };
    } catch (error) {
        console.error('Export database error:', error);
        return {
            success: false,
            error: 'Failed to export database',
        };
    }
}

/**
 * Import/restore a database from JSON
 * CAUTION: This will overwrite the current database!
 */
export async function importDatabase(jsonString: string): Promise<BackupResult> {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }

        if (!jsonString) {
            return { success: false, error: 'No data provided' };
        }

        let backup;
        try {
            backup = JSON.parse(jsonString, (key, value) => {
                // Convert ISO date strings to Date objects
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
                    return new Date(value);
                }
                return value;
            });
        } catch (e) {
            return { success: false, error: 'Invalid JSON file' };
        }

        if (!backup.data) {
            return { success: false, error: 'Invalid backup format' };
        }

        const {
            users,
            students,
            semesters,
            courses,
            enrollments,
            teachers,
            batches,
            batchSemesters,
            courseAssignments,
            adminPreferences
        } = backup.data;

        // Execute restore in a transaction
        await prisma.$transaction(async (tx) => {
            // 1. Delete all existing data in correct order (child -> parent)
            await tx.enrollment.deleteMany();
            await tx.courseAssignment.deleteMany();
            await tx.adminPreferences.deleteMany();
            await tx.student.deleteMany();
            await tx.batchSemester.deleteMany();
            await tx.teacher.deleteMany();
            await tx.course.deleteMany();
            await tx.semester.deleteMany();
            await tx.batch.deleteMany();
            await tx.user.deleteMany();

            // 2. Insert new data in correct order (parent -> child)
            // Using createMany for better performance where supported, or loop create
            // SQLite/Turso via Prisma supports createMany

            if (users?.length) await tx.user.createMany({ data: users });
            if (batches?.length) await tx.batch.createMany({ data: batches });
            if (semesters?.length) await tx.semester.createMany({ data: semesters });
            if (courses?.length) await tx.course.createMany({ data: courses });
            if (teachers?.length) await tx.teacher.createMany({ data: teachers });

            if (students?.length) await tx.student.createMany({ data: students });
            if (batchSemesters?.length) await tx.batchSemester.createMany({ data: batchSemesters });

            if (adminPreferences?.length) await tx.adminPreferences.createMany({ data: adminPreferences });
            if (courseAssignments?.length) await tx.courseAssignment.createMany({ data: courseAssignments });
            if (enrollments?.length) await tx.enrollment.createMany({ data: enrollments });
        });

        return {
            success: true,
            message: 'Database imported successfully.',
        };
    } catch (error) {
        console.error('Import database error:', error);
        return {
            success: false,
            // @ts-ignore
            error: `Failed to import database: ${error.message || error}`,
        };
    }
}
