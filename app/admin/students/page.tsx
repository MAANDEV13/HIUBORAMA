import prisma from '@/lib/prisma';
import Link from 'next/link';
import StudentsClient from './StudentsClient';

export default async function StudentsPage() {
    const students = await prisma.student.findMany({
        include: {
            user: true,
            _count: {
                select: { enrollments: true },
            },
            studentClasses: {
                include: {
                    class: {
                        include: {
                            department: {
                                include: {
                                    faculty: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            }
        },
        orderBy: { studentId: 'asc' },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Students</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Manage student records</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/students/upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-all"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload CSV
                    </Link>
                    <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Student
                    </button>
                </div>
            </div>

            <StudentsClient students={students} />
        </div>
    );
}
