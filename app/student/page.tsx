import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function StudentDashboard() {
    const session = await getSession();
    if (!session) redirect('/login');

    const student = await prisma.student.findFirst({
        where: { user: { username: session.username } },
        include: {
            user: true,
            enrollments: {
                include: {
                    course: true,
                    semester: true,
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!student) {
        if (session.role === 'ADMIN') {
            return (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Admin View</h2>
                    <p className="text-gray-600 mb-6">
                        You are viewing the Student Portal as an Administrator.<br />
                        Since you don't have a student profile, no grades are displayed.
                    </p>
                    <a href="/admin" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                        Return to Admin Dashboard
                    </a>
                </div>
            );
        }
        return <div>Student profile not found</div>;
    }

    // Calculate overall GPA and Total Marks
    const enrollmentsWithGrades = student.enrollments.filter((e: any) => e.gpaPoint !== null);
    const totalGPA = enrollmentsWithGrades.reduce((sum: number, e: any) => sum + (e.gpaPoint || 0), 0);
    const overallGPA = enrollmentsWithGrades.length > 0 ? (totalGPA / enrollmentsWithGrades.length).toFixed(2) : '0.00';
    const overallTotalMarks = enrollmentsWithGrades.reduce((sum: number, e: any) => sum + (e.total || 0), 0);

    // Group enrollments by semester
    const enrollmentsBySemester = student.enrollments.reduce((acc: any, enrollment: any) => {
        const semesterName = enrollment.semester.name;
        if (!acc[semesterName]) {
            acc[semesterName] = [];
        }
        acc[semesterName].push(enrollment);
        return acc;
    }, {} as Record<string, typeof student.enrollments>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl shadow-lg p-6 md:p-8 text-white">
                <h1 className="text-2xl md:text-3xl font-bold">{student.user.name}</h1>
                <p className="mt-2 text-green-50">Student ID: {student.studentId}</p>
                <p className="text-green-50">Program: {student.program}</p>
                <div className="mt-6 grid grid-cols-2 md:flex md:flex-wrap items-center gap-6 md:gap-8">
                    <div>
                        <p className="text-sm text-green-100">Cumulative GPA</p>
                        <p className="text-3xl md:text-4xl font-bold">{overallGPA}</p>
                    </div>
                    <div>
                        <p className="text-sm text-green-100">Total Marks</p>
                        <p className="text-3xl md:text-4xl font-bold">{overallTotalMarks}</p>
                    </div>
                    <div>
                        <p className="text-sm text-green-100">Total Courses</p>
                        <p className="text-3xl md:text-4xl font-bold">{student.enrollments.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-green-100">Failed Courses</p>
                        <p className="text-3xl md:text-4xl font-bold">
                            {student.enrollments.filter((e: any) => e.status === 'FAILED').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Grades by Semester */}
            {Object.entries(enrollmentsBySemester).map(([semesterName, enrollments]: [string, any]) => {
                const semesterGPAPoints = enrollments.filter((e: any) => e.gpaPoint !== null);
                const semesterGPA = semesterGPAPoints.length > 0
                    ? (semesterGPAPoints.reduce((sum: number, e: any) => sum + (e.gpaPoint || 0), 0) / semesterGPAPoints.length).toFixed(2)
                    : '0.00';
                const semesterTotalMarks = enrollments.reduce((sum: number, e: any) => sum + (e.total || 0), 0);

                return (
                    <div key={semesterName} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{semesterName}</h2>
                            <div className="flex gap-6 text-sm md:text-base">
                                <div className="text-right">
                                    <p className="text-gray-500 dark:text-gray-300">Semester GPA</p>
                                    <p className="text-xl font-bold text-[var(--color-primary)]">{semesterGPA}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 dark:text-gray-300">Total Marks</p>
                                    <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{semesterTotalMarks}</p>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course Name</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attendance</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessment</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mid Exam</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Final Exam</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GPA</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {enrollments.map((enrollment: any) => (
                                        <tr key={enrollment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {enrollment.course.code}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                {enrollment.course.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                                                {enrollment.attendance ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                                                {enrollment.assessment ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                                                {enrollment.midExam ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                                                {enrollment.finalExam ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900 dark:text-white">
                                                {enrollment.total ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-[var(--color-primary)]">
                                                {enrollment.grade || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900 dark:text-white">
                                                {enrollment.gpaPoint?.toFixed(2) || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
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

                        {/* Mobile Card View */}
                        <div className="md:hidden p-4 space-y-4 bg-gray-50 dark:bg-gray-700">
                            {enrollments.map((enrollment: any) => (
                                <div key={enrollment.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">{enrollment.course.code}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">{enrollment.course.name}</div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${enrollment.status === 'PASSED' ? 'bg-green-100 text-green-800' :
                                            enrollment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {enrollment.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-100 dark:border-gray-700 pt-3">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Grade</p>
                                            <p className="font-bold text-[var(--color-primary)]">{enrollment.grade || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{enrollment.total ?? '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">GPA</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{enrollment.gpaPoint?.toFixed(2) || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-4 gap-2 text-center text-xs">
                                        <div>
                                            <p className="text-gray-400">Att.</p>
                                            <p>{enrollment.attendance ?? '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Ass.</p>
                                            <p>{enrollment.assessment ?? '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Mid</p>
                                            <p>{enrollment.midExam ?? '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Final</p>
                                            <p>{enrollment.finalExam ?? '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
