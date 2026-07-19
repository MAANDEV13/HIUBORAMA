'use client'

import Link from 'next/link'
import { useState } from 'react'
import { bulkUnenrollByBatch } from '@/app/actions/grades'
import { useRouter } from 'next/navigation'

type Course = {
    id: string
    code: string
    name: string
    credits: number
    studentCount: number
}

type Batch = {
    id: string
    name: string
}

export default function CoursesList({
    courses,
    semesterId,
    batches
}: {
    courses: Course[]
    semesterId: string
    batches: Batch[]
}) {
    const router = useRouter()
    const [unenrolling, setUnenrolling] = useState<string | null>(null)

    async function handleUnenroll(courseId: string, courseName: string) {
        const batchId = prompt(`Enter batch ID to unenroll from "${courseName}":\n\nAvailable batches:\n${batches.map(b => `${b.name} (ID: ${b.id})`).join('\n')}\n\nEnter batch ID:`)

        if (!batchId) return

        const batch = batches.find(b => b.id === batchId || b.name === batchId)
        if (!batch) {
            alert('Batch not found!')
            return
        }

        if (!confirm(`Unenroll ALL students from batch "${batch.name}" from course "${courseName}"?`)) {
            return
        }

        setUnenrolling(courseId)
        try {
            const result = await bulkUnenrollByBatch(batch.id, courseId, semesterId)
            if (result.error) {
                alert(`Error: ${result.error}`)
            } else {
                alert(`Successfully unenrolled ${result.count} students from ${batch.name}`)
                router.refresh()
            }
        } catch (error) {
            alert('Failed to unenroll students')
        } finally {
            setUnenrolling(null)
        }
    }

    return (
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Students</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No courses found for this semester.
                                </td>
                            </tr>
                        ) : (
                            courses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {course.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {course.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                        {course.credits}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {course.studentCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex gap-2 justify-end">
                                            <Link
                                                href={`/admin/grades/${semesterId}/${course.id}`}
                                                className="text-blue-600 hover:text-blue-900 font-semibold"
                                            >
                                                Manage Grades →
                                            </Link>
                                            <button
                                                onClick={() => handleUnenroll(course.id, course.name)}
                                                disabled={unenrolling === course.id}
                                                className="text-red-600 hover:text-red-900 font-semibold disabled:opacity-50"
                                            >
                                                {unenrolling === course.id ? 'Unenrolling...' : 'Unenroll Batch'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
