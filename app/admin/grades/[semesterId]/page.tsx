import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CoursesList from './CoursesList';
import DownloadSemesterResultButton from './DownloadSemesterResultButton';

export default async function SemesterGradesPage({ params }: { params: Promise<{ semesterId: string }> }) {
    const { semesterId } = await params;

    const semester = await prisma.semester.findUnique({
        where: { id: semesterId },
    });

    if (!semester) {
        notFound();
    }

    // Find courses that have enrollments in this semester
    // We can get this by grouping enrollments by courseId
    const courseEnrollments = await prisma.enrollment.groupBy({
        by: ['courseId'],
        where: { semesterId: semesterId },
        _count: {
            studentId: true,
        },
    });

    // Get course details for these courses
    const courseIds = courseEnrollments.map((e: any) => e.courseId);
    const courses = await prisma.course.findMany({
        where: {
            id: { in: courseIds },
        },
    });

    // Combine data
    const coursesWithStats = courses.map((course: any) => {
        const stats = courseEnrollments.find((e: any) => e.courseId === course.id);
        return {
            ...course,
            studentCount: stats?._count.studentId || 0,
        };
    });

    // Get all batches for the unenroll dialog
    const batches = await prisma.batch.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Link href="/admin/grades" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block">
                        ← Back to Semesters
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{semester.name} - Courses</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Select a course to manage grades and re-exams</p>
                </div>
                <div>
                    <DownloadSemesterResultButton
                        semesterId={semesterId}
                        semesterName={semester.name}
                    />
                </div>
            </div>

            <CoursesList
                courses={coursesWithStats}
                semesterId={semesterId}
                batches={batches}
            />
        </div>
    );
}
