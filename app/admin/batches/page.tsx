'use client'

import { useState, useEffect } from 'react'
import { getFullHierarchy } from '@/app/actions/classes'
import { getBatches, createBatch, deleteBatch } from '@/app/actions/batches'
import Link from 'next/link'
import { ExportCSVButton } from '@/app/components/ExportCSVButton'

export default function BatchesPage() {
    const [hierarchy, setHierarchy] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newBatch, setNewBatch] = useState({ name: '', startYear: new Date().getFullYear() })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Collapse state keyed by id
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

    useEffect(() => { load() }, [])

    async function load() {
        const data = await getFullHierarchy()
        setHierarchy(data)
        // Default: all collapsed
        const initial: Record<string, boolean> = {}
        data.forEach((f: any) => {
            initial[`fac-${f.id}`] = true
            f.departments?.forEach((d: any) => {
                initial[`dept-${d.id}`] = true
                d.batches?.forEach((b: any) => {
                    initial[`batch-${b.id}`] = true
                    b.batchSemesters?.forEach((bs: any) => {
                        initial[`bs-${bs.id}`] = true
                    })
                })
            })
        })
        setCollapsed(initial)
        setLoading(false)
    }

    function toggle(key: string) {
        setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
    }

    function expandAll() {
        const all: Record<string, boolean> = {}
        Object.keys(collapsed).forEach(k => all[k] = false)
        setCollapsed(all)
    }

    function collapseAll() {
        const all: Record<string, boolean> = {}
        Object.keys(collapsed).forEach(k => all[k] = true)
        setCollapsed(all)
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newBatch.name) return
        setIsSubmitting(true)
        await createBatch(newBatch)
        setNewBatch({ name: '', startYear: new Date().getFullYear() })
        setIsSubmitting(false)
        load()
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Academic Hierarchy</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Faculty → Department → Batch → Semester → Class</p>
                </div>
                <div className="flex gap-2">
                    <ExportCSVButton 
                        data={hierarchy.flatMap(f => 
                            f.departments.flatMap((d: any) => 
                                d.batches.map((b: any) => ({
                                    faculty: f.name,
                                    department: d.code,
                                    batch: b.name,
                                    startYear: b.startYear,
                                    semesters: b.batchSemesters?.length || 0,
                                    students: b._count?.students || 0
                                }))
                            )
                        )}
                        headers={[
                            { key: 'faculty', label: 'Faculty' },
                            { key: 'department', label: 'Department' },
                            { key: 'batch', label: 'Batch Name' },
                            { key: 'startYear', label: 'Start Year' },
                            { key: 'semesters', label: 'Semesters Count' },
                            { key: 'students', label: 'Students Count' }
                        ]}
                        filename="batches-hierarchy"
                    />
                    <button onClick={expandAll} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Expand All
                    </button>
                    <button onClick={collapseAll} className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Collapse All
                    </button>
                </div>
            </div>

            {/* Create Batch Form */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-3 dark:text-white">Quick Create Batch</h2>
                <form onSubmit={handleCreate} className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-200">Batch Name</label>
                        <input
                            type="text"
                            value={newBatch.name}
                            onChange={e => setNewBatch({ ...newBatch, name: e.target.value })}
                            placeholder="e.g. SH-2025"
                            className="border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-200">Start Year</label>
                        <input
                            type="number"
                            value={newBatch.startYear}
                            onChange={e => setNewBatch({ ...newBatch, startYear: parseInt(e.target.value) })}
                            className="border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50">
                        {isSubmitting ? 'Creating...' : 'Create Batch'}
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="py-12 text-center text-gray-500">Loading hierarchy...</div>
            ) : hierarchy.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No hierarchy data. Create a <Link href="/admin/faculties" className="text-blue-600 hover:underline">Faculty</Link> first.
                </div>
            ) : (
                <div className="space-y-3">
                    {hierarchy.map((faculty: any) => {
                        const facKey = `fac-${faculty.id}`
                        const totalDepts = faculty.departments?.length || 0
                        return (
                            <div key={faculty.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                                {/* Faculty Header */}
                                <button
                                    onClick={() => toggle(facKey)}
                                    className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-gray-750 dark:hover:to-gray-750 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🏛️</span>
                                        <div className="text-left">
                                            <div className="font-bold text-gray-900 dark:text-white">{faculty.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Faculty · {faculty.code}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                            {totalDepts} Department{totalDepts !== 1 ? 's' : ''}
                                        </span>
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${collapsed[facKey] ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Faculty Content */}
                                {!collapsed[facKey] && (
                                    <div className="px-3 pb-3 space-y-2">
                                        {faculty.departments?.map((dept: any) => {
                                            const deptKey = `dept-${dept.id}`
                                            const totalBatches = dept.batches?.length || 0
                                            return (
                                                <div key={dept.id} className="ml-4 border-l-2 border-indigo-200 dark:border-indigo-800 pl-3">
                                                    {/* Department Header */}
                                                    <button
                                                        onClick={() => toggle(deptKey)}
                                                        className="w-full px-4 py-3 flex items-center justify-between rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg">🏢</span>
                                                            <div className="text-left">
                                                                <div className="font-semibold text-gray-800 dark:text-gray-200">{dept.name}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">Department · {dept.code}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                                {totalBatches} Batch{totalBatches !== 1 ? 'es' : ''}
                                                            </span>
                                                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${collapsed[deptKey] ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </button>

                                                    {/* Department Content */}
                                                    {!collapsed[deptKey] && (
                                                        <div className="space-y-2 mt-1">
                                                            {dept.batches?.map((batch: any) => {
                                                                const batchKey = `batch-${batch.id}`
                                                                const totalSemesters = batch.batchSemesters?.length || 0
                                                                const totalStudents = batch._count?.students || 0
                                                                return (
                                                                    <div key={batch.id} className="ml-4 border-l-2 border-purple-200 dark:border-purple-800 pl-3">
                                                                        {/* Batch Header */}
                                                                        <button
                                                                            onClick={() => toggle(batchKey)}
                                                                            className="w-full px-4 py-2.5 flex items-center justify-between rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <span>📅</span>
                                                                                <div className="text-left">
                                                                                    <div className="font-medium text-gray-700 dark:text-gray-300">{batch.name}</div>
                                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Start: {batch.startYear}</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                                                                    {totalSemesters} Sem
                                                                                </span>
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                                    {totalStudents} Student{totalStudents !== 1 ? 's' : ''}
                                                                                </span>
                                                                                <svg className={`w-4 h-4 text-gray-400 transition-transform ${collapsed[batchKey] ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                </svg>
                                                                            </div>
                                                                        </button>

                                                                        {/* Batch Content - Semesters */}
                                                                        {!collapsed[batchKey] && (
                                                                            <div className="space-y-1 mt-1">
                                                                                {batch.batchSemesters?.length === 0 && (
                                                                                    <div className="ml-4 px-4 py-2 text-xs text-gray-400">No semesters scheduled</div>
                                                                                )}
                                                                                {batch.batchSemesters?.map((bs: any) => {
                                                                                    const bsKey = `bs-${bs.id}`
                                                                                    const totalClasses = bs.classes?.length || 0
                                                                                    const totalClassStudents = bs.classes?.reduce((sum: number, c: any) => sum + (c._count?.studentClasses || 0), 0) || 0
                                                                                    return (
                                                                                        <div key={bs.id} className="ml-4 border-l-2 border-amber-200 dark:border-amber-800 pl-3">
                                                                                            {/* BatchSemester Header */}
                                                                                            <button
                                                                                                onClick={() => toggle(bsKey)}
                                                                                                className="w-full px-4 py-2 flex items-center justify-between rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                                                            >
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span>🗓️</span>
                                                                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                                                                        Semester {bs.academicSemester}
                                                                                                    </span>
                                                                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                                                                        bs.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                                                                        bs.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' :
                                                                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                                                                    }`}>
                                                                                                        {bs.status}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                                                                                                        {totalClasses} Class{totalClasses !== 1 ? 'es' : ''}
                                                                                                    </span>
                                                                                                    <svg className={`w-3 h-3 text-gray-400 transition-transform ${collapsed[bsKey] ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                                    </svg>
                                                                                                </div>
                                                                                            </button>

                                                                                            {/* Classes */}
                                                                                            {!collapsed[bsKey] && (
                                                                                                <div className="ml-4 mt-1 space-y-1">
                                                                                                    {bs.classes?.length === 0 && (
                                                                                                        <div className="px-4 py-2 text-xs text-gray-400">No classes</div>
                                                                                                    )}
                                                                                                    {bs.classes?.map((cls: any) => (
                                                                                                        <div key={cls.id} className="flex items-center gap-2 px-4 py-1.5 ml-2 border-l-2 border-teal-200 dark:border-teal-800 pl-3">
                                                                                                            <span className="text-sm">🎓</span>
                                                                                                            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                                                                                                Class {cls.name}
                                                                                                            </span>
                                                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                                                                                {cls._count?.studentClasses || 0} student{(cls._count?.studentClasses || 0) !== 1 ? 's' : ''}
                                                                                                            </span>
                                                                                                            <Link href={`/admin/classes/assign?classId=${cls.id}&bsId=${bs.id}`} className="text-xs text-blue-500 hover:text-blue-700 ml-auto">
                                                                                                                Manage →
                                                                                                            </Link>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
