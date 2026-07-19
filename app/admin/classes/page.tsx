'use client'

import { useState, useEffect } from 'react'
import { getClasses, createClass, deleteClass } from '@/app/actions/classes'
import { getDepartments } from '@/app/actions/departments'
import { getBatches } from '@/app/actions/batches'
import { getBatchSemesters } from '@/app/actions/scheduling'
import { getSemesters } from '@/app/actions/semesters'
import Link from 'next/link'
import { ExportCSVButton } from '@/app/components/ExportCSVButton'

export default function ClassesPage() {
    const [classes, setClasses] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [batches, setBatches] = useState<any[]>([])
    const [semesters, setSemesters] = useState<any[]>([])
    const [batchSemesters, setBatchSemesters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Form state
    const [newName, setNewName] = useState('')
    const [selectedDeptId, setSelectedDeptId] = useState('')
    const [selectedSemesterId, setSelectedSemesterId] = useState('')
    const [selectedBatchSemId, setSelectedBatchSemId] = useState('')

    // Filter state
    const [filterSemesterId, setFilterSemesterId] = useState('')

    useEffect(() => { load() }, [])

    useEffect(() => {
        if (selectedSemesterId) {
            loadBatchSemesters(selectedSemesterId)
        } else {
            setBatchSemesters([])
            setSelectedBatchSemId('')
        }
    }, [selectedSemesterId])

    async function load() {
        const [clsData, deptData, batchData, semData] = await Promise.all([
            getClasses(),
            getDepartments(),
            getBatches(),
            getSemesters()
        ])
        setClasses(clsData)
        setDepartments(deptData)
        setBatches(batchData)
        setSemesters(semData)
        setLoading(false)
    }

    async function loadBatchSemesters(semesterId: string) {
        const data = await getBatchSemesters(semesterId)
        setBatchSemesters(data)
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newName.trim() || !selectedDeptId || !selectedBatchSemId) return
        try {
            await createClass({
                name: newName.trim(),
                departmentId: selectedDeptId,
                batchSemesterId: selectedBatchSemId
            })
            setNewName('')
            load()
        } catch (err: any) {
            alert('Error creating class. It may already exist for this semester/department.')
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this class?')) return
        const result = await deleteClass(id)
        if (result?.error) {
            alert(result.error)
        } else {
            load()
        }
    }

    // Apply filter
    const filteredClasses = filterSemesterId
        ? classes.filter(c => c.batchSemester?.semesterId === filterSemesterId)
        : classes

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Class Management</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Create classes scoped to a specific Batch-Semester + Department</p>
                </div>
                <ExportCSVButton 
                    data={filteredClasses.map(c => ({
                        className: c.name,
                        department: c.department?.name || 'Unknown',
                        faculty: c.department?.faculty?.name || 'Unknown',
                        batchName: c.batchSemester?.batch?.name || 'Unknown',
                        academicSemester: c.batchSemester?.academicSemester || 'Unknown',
                        timeSemester: c.batchSemester?.semester?.name || 'Unknown',
                        students: c._count?.studentClasses || 0
                    }))}
                    headers={[
                        { key: 'className', label: 'Class Name' },
                        { key: 'department', label: 'Department' },
                        { key: 'faculty', label: 'Faculty' },
                        { key: 'batchName', label: 'Batch' },
                        { key: 'academicSemester', label: 'Academic Sem' },
                        { key: 'timeSemester', label: 'Time Semester' },
                        { key: 'students', label: 'Students Count' }
                    ]}
                    filename="classes"
                />
            </div>

            {/* Create Form */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Create New Class</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Department *</label>
                            <select
                                value={selectedDeptId}
                                onChange={e => setSelectedDeptId(e.target.value)}
                                className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            >
                                <option value="">-- Select --</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} ({d.code}) — {d.faculty?.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Semester (Time) *</label>
                            <select
                                value={selectedSemesterId}
                                onChange={e => setSelectedSemesterId(e.target.value)}
                                className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            >
                                <option value="">-- Select --</option>
                                {semesters.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Batch + Semester *</label>
                            <select
                                value={selectedBatchSemId}
                                onChange={e => setSelectedBatchSemId(e.target.value)}
                                className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                disabled={!selectedSemesterId}
                            >
                                <option value="">-- {selectedSemesterId ? 'Select Batch-Semester' : 'Select a Semester first'} --</option>
                                {batchSemesters.map(bs => (
                                    <option key={bs.id} value={bs.id}>{bs.batch.name} — Sem {bs.academicSemester}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Class Name *</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder='e.g. "A", "B"'
                                    className="flex-1 border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm whitespace-nowrap">
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium dark:text-gray-200">Filter by Semester:</label>
                <select
                    value={filterSemesterId}
                    onChange={e => setFilterSemesterId(e.target.value)}
                    className="border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="">All Semesters</option>
                    {semesters.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {filteredClasses.length} class(es)
                </span>
            </div>

            {/* Class List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Batch / Semester</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredClasses.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-semibold dark:text-white">Class {c.name}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm dark:text-gray-200">{c.department?.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{c.department?.faculty?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm dark:text-gray-200">
                                        {c.batchSemester?.batch?.name} — Sem {c.batchSemester?.academicSemester}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {c.batchSemester?.semester?.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        {c._count?.studentClasses || 0} student(s)
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    <Link
                                        href={`/admin/classes/assign?classId=${c.id}&bsId=${c.batchSemesterId}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Assign Students
                                    </Link>
                                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredClasses.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No classes found. Create one above by selecting a department and batch-semester.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
