'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateStudent, deleteStudent } from '@/app/actions/students'
import { useRouter } from 'next/navigation'
import { ExportCSVButton } from '@/app/components/ExportCSVButton'

interface Student {
    id: string
    studentId: string
    program: string
    batch: string | null
    user: {
        name: string
    }
    _count: {
        enrollments: number
    }
    studentClasses?: {
        class: {
            name: string
            department: {
                code: string
                faculty: {
                    code: string
                }
            }
        }
    }[]
}

export default function StudentsClient({ students }: { students: Student[] }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ name: '', program: '', batch: '' })
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()

    const filteredStudents = students.filter(student => {
        const query = searchQuery.toLowerCase()
        return (
            student.user.name.toLowerCase().includes(query) ||
            student.studentId.toLowerCase().includes(query) ||
            student.program.toLowerCase().includes(query) ||
            (student.batch && student.batch.toLowerCase().includes(query)) ||
            (student.studentClasses?.[0]?.class.name.toLowerCase().includes(query)) ||
            (student.studentClasses?.[0]?.class.department.code.toLowerCase().includes(query)) ||
            (student.studentClasses?.[0]?.class.department.faculty.code.toLowerCase().includes(query))
        )
    })

    function handleEdit(student: Student) {
        setEditingId(student.id)
        setEditForm({
            name: student.user.name,
            program: student.program,
            batch: student.batch || ''
        })
    }

    async function handleSave(id: string) {
        const result = await updateStudent(id, editForm)
        if (result?.error) {
            alert(result.error)
        } else {
            setEditingId(null)
            router.refresh()
        }
    }

    async function handleDelete(id: string, studentId: string) {
        if (confirm(`Delete student ${studentId}? This will also delete all their enrollments.`)) {
            const result = await deleteStudent(id)
            if (result?.error) {
                alert(result.error)
            } else {
                router.refresh()
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <ExportCSVButton 
                    data={filteredStudents.map(s => ({
                        studentId: s.studentId,
                        name: s.user.name,
                        program: s.program,
                        batch: s.batch,
                        facultyCode: s.studentClasses?.[0]?.class.department.faculty.code || 'Unassigned',
                        departmentCode: s.studentClasses?.[0]?.class.department.code || 'Unassigned',
                        className: s.studentClasses?.[0]?.class.name || 'Unassigned',
                        enrollmentsCount: s._count.enrollments
                    }))}
                    headers={[
                        { key: 'studentId', label: 'Student ID' },
                        { key: 'name', label: 'Name' },
                        { key: 'program', label: 'Program' },
                        { key: 'batch', label: 'Legacy Batch' },
                        { key: 'facultyCode', label: 'Faculty' },
                        { key: 'departmentCode', label: 'Department' },
                        { key: 'className', label: 'Class' },
                        { key: 'enrollmentsCount', label: 'Enrollments' }
                    ]}
                    filename="students"
                />
                
                <div className="relative w-full max-w-md ml-4">
                    <input
                        type="text"
                        placeholder="Search by name, ID, program, or batch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faculty/Dept</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Courses</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {student.studentId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                        {editingId === student.id ? (
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        ) : (
                                            student.user.name
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {editingId === student.id ? (
                                            <select
                                                value={editForm.program}
                                                onChange={e => setEditForm({ ...editForm, program: e.target.value })}
                                                className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            >
                                                <option value="Bachelor">Bachelor</option>
                                                <option value="Diploma">Diploma</option>
                                            </select>
                                        ) : (
                                            student.program
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                                        {student.studentClasses?.[0] ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                {student.studentClasses[0].class.department.faculty.code} / {student.studentClasses[0].class.department.code}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                                        {student.studentClasses?.[0] ? (
                                            <span className="font-medium text-gray-900 dark:text-gray-200">
                                                {student.studentClasses[0].class.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {student._count.enrollments}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editingId === student.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleSave(student.id)}
                                                    className="text-green-600 hover:text-green-900 mr-4"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href={`/admin/students/${student.id}`}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id, student.studentId)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
