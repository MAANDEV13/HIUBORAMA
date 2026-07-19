import prisma from '@/lib/prisma';
import Link from 'next/link';
import SemesterCard from './SemesterCard';

export default async function GradesPage() {
    // Fetch all batches with their batch semesters, including department info
    const batches = await prisma.batch.findMany({
        orderBy: { startYear: 'desc' },
        include: {
            department: true,
            batchSemesters: {
                orderBy: { academicSemester: 'asc' },
                include: {
                    semester: true,
                },
            },
        },
    });

    // Also fetch any semesters that aren't linked to any batch (orphan semesters)
    const allSemesters = await prisma.semester.findMany({
        orderBy: { startDate: 'desc' },
    });
    const linkedSemesterIds = new Set(
        batches.flatMap(b => b.batchSemesters.map(bs => bs.semesterId))
    );
    const orphanSemesters = allSemesters.filter(s => !linkedSemesterIds.has(s.id));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grades & Enrollments</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Manage student enrollments and grades — grouped by batch</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/grades/upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-all"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Grades CSV
                    </Link>
                </div>
            </div>

            {/* Grouped by Batch */}
            {batches.map((batch: any) => {
                if (batch.batchSemesters.length === 0) return null;

                const deptCode = batch.department?.code;

                return (
                    <div key={batch.id} className="space-y-4">
                        {/* Batch Header */}
                        <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">📅</span>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                    Batch: {batch.name}
                                </h2>
                            </div>
                            {deptCode && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                    {batch.department?.name} ({deptCode})
                                </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                {batch.batchSemesters.length} semester(s)
                            </span>
                        </div>

                        {/* Semester Cards */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {batch.batchSemesters.map((bs: any) => {
                                // Build label: {DeptCode}-{BatchName}-SEM{n}
                                const label = deptCode
                                    ? `${deptCode}-${batch.name}-SEM${bs.academicSemester}`
                                    : `${batch.name}-SEM${bs.academicSemester}`;

                                return (
                                    <SemesterCard
                                        key={bs.id}
                                        semester={bs.semester}
                                        label={label}
                                        batchSemesterStatus={bs.status}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Orphan semesters (not linked to any batch) */}
            {orphanSemesters.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 pt-2">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            Unlinked Semesters
                        </h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Not assigned to any batch
                        </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {orphanSemesters.map((semester: any) => (
                            <SemesterCard key={semester.id} semester={semester} />
                        ))}
                    </div>
                </div>
            )}

            {batches.every((b: any) => b.batchSemesters.length === 0) && orphanSemesters.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No semesters found. Go to <Link href="/admin/scheduling" className="text-blue-600 hover:underline">Scheduling</Link> to create them.
                </div>
            )}
        </div>
    );
}
