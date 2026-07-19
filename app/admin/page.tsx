import prisma from '@/lib/prisma';
import Link from 'next/link';
import PrintButton from '@/app/components/PrintButton';
import { getAdminPreferences } from '@/app/actions/adminPreferences';

export default async function AdminDashboard() {
    // Get admin preferences
    const preferencesResult = await getAdminPreferences();
    const preferences = preferencesResult.preferences || {
        showFailedStudentsReport: true,
        showRecentEnrollments: true,
    };

    const [studentCount, courseCount, semesterCount] = await Promise.all([
        prisma.student.count(),
        prisma.course.count(),
        prisma.semester.count(),
    ]);

    const recentEnrollments = await prisma.enrollment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            student: { include: { user: true } },
            course: true,
            semester: true,
        },
    });

    const failedEnrollments = await prisma.enrollment.findMany({
        where: { grade: 'F' },
        include: {
            student: { include: { user: true } },
            course: true,
            semester: true,
        },
        orderBy: { semester: { startDate: 'desc' } },
    });

    // Count unique students with at least one F
    const failedStudentIds = new Set(failedEnrollments.map((e: any) => e.studentId));
    const failedStudentCount = failedStudentIds.size;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to HIUBORAMA EXAMS</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-[var(--color-primary)] rounded-lg p-3">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Students</dt>
                                    <dd className="text-3xl font-bold text-gray-900 dark:text-white">{studentCount}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
                        <Link href="/admin/students" className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)]">
                            View all →
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-[var(--color-secondary)] rounded-lg p-3">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Courses</dt>
                                    <dd className="text-3xl font-bold text-gray-900 dark:text-white">{courseCount}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
                        <Link href="/admin/courses" className="text-sm font-medium text-[var(--color-secondary)] hover:text-green-800">
                            View all →
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-[var(--color-tertiary)] rounded-lg p-3">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Semesters</dt>
                                    <dd className="text-3xl font-bold text-gray-900 dark:text-white">{semesterCount}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
                        <Link href="/admin/grades" className="text-sm font-medium text-[var(--color-tertiary)] hover:text-yellow-800">
                            Manage grades →
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-500 rounded-lg p-3">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Failed Students</dt>
                                    <dd className="text-3xl font-bold text-red-600 dark:text-red-400">{failedStudentCount}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
                        <span className="text-sm text-gray-500">
                            Unique students with 'F' grades
                        </span>
                    </div>
                </div>
            </div>

            {/* Failed Students Report - Conditional */}
            {preferences.showFailedStudentsReport && (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:shadow-none print:border-none">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center print:hidden">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed Students Report</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Students with 'F' grades in any course</p>
                        </div>
                        <PrintButton />
                    </div>

                    {/* Print Header (Hidden on screen) */}
                    <div className="hidden print:block p-8 text-center border-b border-gray-200 mb-6">
                        <div className="flex justify-center mb-4">
                            <img src="/logo-header.png" alt="HIUBORAMA EXAMS Logo" className="h-24 w-auto" />
                        </div>
                        <h1 className="text-3xl font-bold uppercase tracking-wider text-[var(--color-primary)]">Failed Students Report</h1>
                        <p className="mt-2 text-gray-600">HIUBORAMA EXAMS</p>
                        <p className="text-sm text-gray-400 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semester</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Score</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {failedEnrollments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No failed students found.
                                        </td>
                                    </tr>
                                ) : (
                                    failedEnrollments.map((enrollment: any) => (
                                        <tr key={enrollment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white font-mono">
                                                {enrollment.student.studentId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {enrollment.student.user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {enrollment.course.code} - {enrollment.course.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {enrollment.semester.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-red-600">
                                                {enrollment.grade}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                {enrollment.total}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Activity - Conditional */}
            {preferences.showRecentEnrollments && (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 print:hidden">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Enrollments</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semester</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {recentEnrollments.map((enrollment: any) => (
                                    <tr key={enrollment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {enrollment.student.user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {enrollment.course.code} - {enrollment.course.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {enrollment.semester.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                                            {enrollment.grade || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${enrollment.status === 'PASSED' ? 'bg-green-100 text-green-800' :
                                                enrollment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {enrollment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
