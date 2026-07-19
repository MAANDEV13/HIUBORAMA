import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ studentId: string }>;
}

export default async function AdminStudentView({ params }: Props) {
    const { studentId } = await params;

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            user: true,
            enrollments: {
                include: {
                    course: true,
                    semester: true,
                },
                orderBy: { semester: { startDate: 'asc' } },
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
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
    });

    if (!student) {
        notFound();
    }

    // Calculate stats
    const enrollmentsWithGrades = student.enrollments.filter((e: any) => e.gpaPoint !== null);
    const totalCredits = enrollmentsWithGrades.reduce((sum: number, e: any) => sum + e.course.credits, 0);
    const totalPoints = enrollmentsWithGrades.reduce((sum: number, e: any) => sum + (e.gpaPoint || 0) * e.course.credits, 0);
    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    // Group by semester
    const semesters = student.enrollments.reduce((acc: any, enrollment: any) => {
        const semesterName = enrollment.semester.name;
        if (!acc[semesterName]) {
            acc[semesterName] = [];
        }
        acc[semesterName].push(enrollment);
        return acc;
    }, {});

    const currentClass = student.studentClasses?.[0]?.class;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Link
                        href="/admin/students"
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block"
                    >
                        ← Back to Students
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Details</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">View academic record and exam data</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Header */}
                <div className="bg-[var(--color-primary)] text-white p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                        <div>
                            <h2 className="text-3xl font-bold uppercase tracking-wider leading-none">Academic Record</h2>
                            <p className="mt-2 text-lg text-green-100 font-medium">{student.program}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-sm text-green-200 uppercase tracking-wider font-semibold">Student ID</p>
                            <p className="font-mono text-xl font-bold">{student.studentId}</p>
                        </div>
                    </div>
                </div>

                {/* Student Info */}
                <div className="p-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Student Name</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{student.user.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Batch</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">{student.batch || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Total Credits</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">{totalCredits}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Cumulative GPA</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cgpa}</p>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Faculty</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{currentClass?.department?.faculty?.name || 'Unassigned'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Department</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{currentClass?.department?.name || 'Unassigned'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Current Class</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{currentClass?.name || 'Unassigned'}</p>
                        </div>
                    </div>
                </div>

                {/* Grades */}
                <div className="p-8 space-y-8">
                    {Object.entries(semesters).map(([semesterName, enrollments]: [string, any]) => {
                        const semCredits = enrollments.reduce((sum: number, e: any) => sum + e.course.credits, 0);
                        const semPoints = enrollments.reduce((sum: number, e: any) => sum + (e.gpaPoint || 0) * e.course.credits, 0);
                        const semGPA = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';

                        return (
                            <div key={semesterName}>
                                <div className="flex justify-between items-end mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{semesterName}</h3>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Semester GPA: {semGPA}</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <th className="pb-2">Course Code</th>
                                                <th className="pb-2">Course Title</th>
                                                <th className="pb-2 text-center">Credits</th>
                                                <th className="pb-2 text-center">Score</th>
                                                <th className="pb-2 text-center">Grade</th>
                                                <th className="pb-2 text-center">Points</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-gray-900 dark:text-gray-300">
                                            {enrollments.map((enrollment: any) => (
                                                <tr key={enrollment.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="py-2 font-mono">{enrollment.course.code}</td>
                                                    <td className="py-2">{enrollment.course.name}</td>
                                                    <td className="py-2 text-center">{enrollment.course.credits}</td>
                                                    <td className="py-2 text-center">{enrollment.total ?? '-'}</td>
                                                    <td className="py-2 text-center font-bold px-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs ${enrollment.status === 'PASSED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                enrollment.status === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                            {enrollment.grade || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 text-center">{enrollment.gpaPoint?.toFixed(2) || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
