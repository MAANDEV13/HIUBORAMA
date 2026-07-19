import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GradeRow from './GradeRow';
import DownloadGradesButton from './DownloadGradesButton';

export default async function CourseGradesPage({ params }: { params: Promise<{ semesterId: string; courseId: string }> }) {
    const { semesterId, courseId } = await params;

    const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!semester || !course) {
        notFound();
    }

    const enrollments = await prisma.enrollment.findMany({
        where: {
            semesterId: semesterId,
            courseId: courseId,
        },
        include: {
            student: {
                include: {
                    user: true,
                },
            },
        },
        orderBy: {
            student: {
                studentId: 'asc',
            },
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Link href={`/admin/grades/${semesterId}`} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                        ← Back to Courses
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{course.code}: {course.name}</h1>
                    <p className="mt-2 text-gray-600">{semester.name} - Grade Management</p>
                </div>
                <div className="flex gap-3">
                    <DownloadGradesButton
                        enrollments={enrollments}
                        courseCode={course.code}
                        courseName={course.name}
                        semesterName={semester.name}
                    />
                    <Link
                        href="/admin/grades/upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-all"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Bulk Upload CSV
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mid Exam</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Final Exam</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                                        No students enrolled in this course for this semester.
                                    </td>
                                </tr>
                            ) : (
                                enrollments.map((enrollment: any) => (
                                    <GradeRow key={enrollment.id} enrollment={enrollment} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
