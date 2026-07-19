import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import PrintButton from '@/app/components/PrintButton';

export default async function TranscriptPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const student = await prisma.student.findFirst({
        where: { user: { username: session.username } },
        include: {
            user: true,
            batchRel: {
                include: {
                    department: {
                        include: { faculty: true }
                    }
                }
            },
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
                                include: { faculty: true }
                            },
                            batchSemester: {
                                include: {
                                    batch: true,
                                    semester: true,
                                }
                            }
                        }
                    }
                }
            },
        },
    });

    if (!student) {
        if (session.role === 'ADMIN') {
            return <div className="p-8 text-center">Admin View: No transcript available for admin account.</div>;
        }
        return <div>Student profile not found</div>;
    }

    // Calculate stats
    const enrollmentsWithGrades = student.enrollments.filter(e => e.gpaPoint !== null);
    const totalCredits = enrollmentsWithGrades.reduce((sum, e) => sum + e.course.credits, 0);
    const totalPoints = enrollmentsWithGrades.reduce((sum, e) => sum + (e.gpaPoint || 0) * e.course.credits, 0);
    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    // Group by semester
    const semesters = student.enrollments.reduce((acc, enrollment) => {
        const semesterName = enrollment.semester.name;
        if (!acc[semesterName]) {
            acc[semesterName] = { enrollments: [], semesterId: enrollment.semesterId };
        }
        acc[semesterName].enrollments.push(enrollment);
        return acc;
    }, {} as Record<string, { enrollments: typeof student.enrollments; semesterId: string }>);

    // Build a map: semesterId → StudentClass info for this student
    const classInfoBySemester = new Map<string, {
        className: string;
        departmentName: string;
        departmentCode: string;
        facultyName: string;
        facultyCode: string;
        batchName: string;
        academicSemester: number;
    }>();

    for (const sc of student.studentClasses) {
        const cls = sc.class;
        const bs = cls.batchSemester;
        const dept = cls.department;
        const fac = dept.faculty;

        classInfoBySemester.set(bs.semesterId, {
            className: cls.name,
            departmentName: dept.name,
            departmentCode: dept.code,
            facultyName: fac.name,
            facultyCode: fac.code,
            batchName: bs.batch.name,
            academicSemester: bs.academicSemester,
        });
    }

    // Get the batch-level department/faculty for the header (from batch → department → faculty)
    const batchDept = student.batchRel?.department;
    const batchFac = batchDept?.faculty;

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none">
            {/* Header */}
            <div className="bg-[var(--color-primary)] text-white p-8 print:bg-white print:text-black print:border-b-2 print:border-[var(--color-primary)]">
                {/* Logo Section */}
                <div className="flex justify-center mb-8 border-b border-white/20 pb-8 print:border-gray-300">
                    <img src="/logo-header.png" alt="HIUBORAMA EXAMS Logo" className="h-28 w-auto bg-white rounded-lg p-2 object-contain print:bg-transparent print:p-0" />
                </div>

                {/* Title and Date Section */}
                <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-wider leading-none">Official Transcript</h1>
                        <p className="mt-2 text-lg text-green-100 font-medium print:text-gray-600">HIUBORAMA EXAMS</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-sm text-green-200 uppercase tracking-wider font-semibold print:text-gray-600">Date Issued</p>
                        <p className="font-mono text-xl font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Student Info */}
            <div className="p-8 border-b border-gray-200 bg-gray-50 print:bg-white">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Student Name</p>
                        <p className="text-lg font-bold text-gray-900">{student.user.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Student ID</p>
                        <p className="text-lg font-bold text-gray-900 font-mono">{student.studentId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Program</p>
                        <p className="text-lg font-medium text-gray-900">{student.program}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cumulative GPA</p>
                        <p className="text-2xl font-bold text-blue-600 print:text-black">{cgpa}</p>
                    </div>
                </div>

                {/* Faculty / Department / Batch Info */}
                {(batchFac || batchDept) && (
                    <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {batchFac && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Faculty</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {batchFac.name} <span className="text-gray-500">({batchFac.code})</span>
                                </p>
                            </div>
                        )}
                        {batchDept && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Department</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {batchDept.name} <span className="text-gray-500">({batchDept.code})</span>
                                </p>
                            </div>
                        )}
                        {student.batchRel && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Batch</p>
                                <p className="text-sm font-medium text-gray-900">{student.batchRel.name}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Grades */}
            <div className="p-8 space-y-8">
                {Object.entries(semesters).map(([semesterName, { enrollments, semesterId }]) => {
                    const semCredits = enrollments.reduce((sum, e) => sum + e.course.credits, 0);
                    const semPoints = enrollments.reduce((sum, e) => sum + (e.gpaPoint || 0) * e.course.credits, 0);
                    const semGPA = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';

                    // Per-semester class info from StudentClass
                    const semClassInfo = classInfoBySemester.get(semesterId);

                    return (
                        <div key={semesterName}>
                            <div className="flex justify-between items-end mb-2 border-b border-gray-200 pb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{semesterName}</h3>
                                    {semClassInfo && (
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                                            <span>
                                                <span className="font-semibold">Faculty:</span> {semClassInfo.facultyName} ({semClassInfo.facultyCode})
                                            </span>
                                            <span>
                                                <span className="font-semibold">Dept:</span> {semClassInfo.departmentName} ({semClassInfo.departmentCode})
                                            </span>
                                            <span>
                                                <span className="font-semibold">Class:</span> {semClassInfo.className} (Semester {semClassInfo.academicSemester}, {semClassInfo.batchName})
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-gray-600">Semester GPA: {semGPA}</p>
                            </div>
                            <table className="min-w-full">
                                <thead>
                                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <th className="pb-2">Course Code</th>
                                        <th className="pb-2">Course Title</th>
                                        <th className="pb-2 text-center">Credits</th>
                                        <th className="pb-2 text-center">Grade</th>
                                        <th className="pb-2 text-center">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-900">
                                    {enrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="border-b border-gray-100 last:border-0">
                                            <td className="py-2 font-mono">{enrollment.course.code}</td>
                                            <td className="py-2">{enrollment.course.name}</td>
                                            <td className="py-2 text-center">{enrollment.course.credits}</td>
                                            <td className="py-2 text-center font-bold">{enrollment.grade}</td>
                                            <td className="py-2 text-center">{enrollment.gpaPoint?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-8 border-t border-gray-200 print:bg-white print:mt-8">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">This is a computer generated document.</p>
                    <PrintButton />
                </div>
            </div>
        </div>
    );
}
