'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getStudentsForBatchSemester, getStudentsInClass, assignStudentsToClass, removeStudentFromClass, getClassesByBatchSemester } from '@/app/actions/classes'
import Link from 'next/link'

export default function AssignStudentsPage() {
    const searchParams = useSearchParams()
    const classId = searchParams.get('classId') || ''
    const bsId = searchParams.get('bsId') || ''

    const [classInfo, setClassInfo] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [assignedStudents, setAssignedStudents] = useState<any[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [assigning, setAssigning] = useState(false)

    useEffect(() => {
        if (classId && bsId) load()
    }, [classId, bsId])

    async function load() {
        setLoading(true)
        const [allStudents, assigned, classes] = await Promise.all([
            getStudentsForBatchSemester(bsId),
            getStudentsInClass(classId),
            getClassesByBatchSemester(bsId)
        ])

        const cls = classes.find((c: any) => c.id === classId)
        setClassInfo(cls)
        setStudents(allStudents)
        setAssignedStudents(assigned)
        setSelectedIds(new Set())
        setLoading(false)
    }

    async function handleAssign() {
        if (selectedIds.size === 0) return
        setAssigning(true)
        const result = await assignStudentsToClass(classId, Array.from(selectedIds))
        alert(`Assigned ${result.created} student(s), ${result.skipped} already assigned.`)
        setAssigning(false)
        load()
    }

    async function handleRemove(studentId: string) {
        if (!confirm('Remove this student from the class?')) return
        await removeStudentFromClass(studentId, classId)
        load()
    }

    function toggleSelect(id: string) {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)
    }

    function selectAll() {
        const assignedIds = new Set(assignedStudents.map((sc: any) => sc.studentId))
        const unassigned = students.filter(s => !assignedIds.has(s.id))
        setSelectedIds(new Set(unassigned.map(s => s.id)))
    }

    function selectNone() {
        setSelectedIds(new Set())
    }

    const assignedIds = new Set(assignedStudents.map((sc: any) => sc.studentId))
    const unassignedStudents = students.filter(s => !assignedIds.has(s.id))

    if (!classId || !bsId) {
        return (
            <div className="p-6">
                <p className="text-gray-500 dark:text-gray-400">Missing classId or bsId parameter. Go back to <Link href="/admin/classes" className="text-blue-600 hover:underline">Classes</Link>.</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/classes" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    ← Back to Classes
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold dark:text-white">
                    Assign Students to Class {classInfo?.name || ''}
                </h1>
                {classInfo && (
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {classInfo.department?.name} ({classInfo.department?.code}) — {classInfo.batchSemester?.batch?.name} Sem {classInfo.batchSemester?.academicSemester}
                    </p>
                )}
            </div>

            {loading ? (
                <div className="text-gray-500 dark:text-gray-400 py-8 text-center">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Currently Assigned */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-green-50 dark:bg-green-900/20 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-semibold text-green-800 dark:text-green-300">
                                ✅ Currently Assigned ({assignedStudents.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
                            {assignedStudents.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No students assigned yet</div>
                            ) : (
                                assignedStudents.map((sc: any) => (
                                    <div key={sc.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <div>
                                            <div className="font-medium text-sm dark:text-gray-200">{sc.student.user.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{sc.student.studentId}</div>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(sc.studentId)}
                                            className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Available to Assign */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="font-semibold text-blue-800 dark:text-blue-300">
                                📋 Available Students ({unassignedStudents.length})
                            </h2>
                            <div className="space-x-2">
                                <button onClick={selectAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Select All</button>
                                <button onClick={selectNone} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Clear</button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                            {unassignedStudents.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    All students in this batch are assigned to this class
                                </div>
                            ) : (
                                unassignedStudents.map(s => (
                                    <label
                                        key={s.id}
                                        className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(s.id)}
                                            onChange={() => toggleSelect(s.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm dark:text-gray-200">{s.user.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{s.studentId}</div>
                                        </div>
                                        {s.studentClasses?.length > 0 && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                Already in Class {s.studentClasses[0].class.name}
                                            </span>
                                        )}
                                    </label>
                                ))
                            )}
                        </div>
                        {unassignedStudents.length > 0 && (
                            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                <button
                                    onClick={handleAssign}
                                    disabled={selectedIds.size === 0 || assigning}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {assigning ? 'Assigning...' : `Assign ${selectedIds.size} Selected Student(s)`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
