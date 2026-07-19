'use client'

import { useState, useEffect } from 'react'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/app/actions/departments'
import { getFaculties } from '@/app/actions/faculties'

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<any[]>([])
    const [faculties, setFaculties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState('')
    const [newCode, setNewCode] = useState('')
    const [newFacultyId, setNewFacultyId] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editCode, setEditCode] = useState('')

    useEffect(() => { load() }, [])

    async function load() {
        const [depts, facs] = await Promise.all([getDepartments(), getFaculties()])
        setDepartments(depts)
        setFaculties(facs)
        setLoading(false)
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newName.trim() || !newCode.trim() || !newFacultyId) return
        await createDepartment({
            name: newName.trim(),
            code: newCode.trim().toUpperCase(),
            facultyId: newFacultyId
        })
        setNewName('')
        setNewCode('')
        setNewFacultyId('')
        load()
    }

    async function handleUpdate(id: string) {
        if (!editName.trim() || !editCode.trim()) return
        await updateDepartment(id, { name: editName.trim(), code: editCode.trim().toUpperCase() })
        setEditingId(null)
        load()
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this department?')) return
        const result = await deleteDepartment(id)
        if (result?.error) {
            alert(result.error)
        } else {
            load()
        }
    }

    // Group departments by faculty
    const grouped = faculties.map(f => ({
        faculty: f,
        departments: departments.filter(d => d.facultyId === f.id)
    })).filter(g => g.departments.length > 0)

    // Departments with no matching faculty (shouldn't happen, but safeguard)
    const ungrouped = departments.filter(d => !faculties.some(f => f.id === d.facultyId))

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold dark:text-white">Department Management</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Manage departments — each belongs to a Faculty</p>
            </div>

            {/* Create Form */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Create New Department</h2>
                <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                    <div className="w-56">
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Faculty *</label>
                        <select
                            value={newFacultyId}
                            onChange={e => setNewFacultyId(e.target.value)}
                            className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                        >
                            <option value="">-- Select Faculty --</option>
                            {faculties.map(f => (
                                <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Department Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. Computer Science"
                            className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Code</label>
                        <input
                            type="text"
                            value={newCode}
                            onChange={e => setNewCode(e.target.value)}
                            placeholder="e.g. CS"
                            className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                            maxLength={10}
                        />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm">
                        Create Department
                    </button>
                </form>
            </div>

            {/* Department List grouped by Faculty */}
            {grouped.map(({ faculty, departments: depts }) => (
                <div key={faculty.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            🏛️ {faculty.name}
                            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{faculty.code}</span>
                        </h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Batches</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Classes</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {depts.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === d.id ? (
                                            <input value={editName} onChange={e => setEditName(e.target.value)}
                                                className="border p-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full" autoFocus
                                                onKeyDown={e => { if (e.key === 'Enter') handleUpdate(d.id); if (e.key === 'Escape') setEditingId(null) }}
                                            />
                                        ) : (
                                            <span className="font-medium dark:text-gray-200">{d.name}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === d.id ? (
                                            <input value={editCode} onChange={e => setEditCode(e.target.value)}
                                                className="border p-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white w-20 uppercase"
                                                onKeyDown={e => { if (e.key === 'Enter') handleUpdate(d.id); if (e.key === 'Escape') setEditingId(null) }}
                                            />
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">{d.code}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{d._count?.batches || 0}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{d._count?.classes || 0}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                        {editingId === d.id ? (
                                            <>
                                                <button onClick={() => handleUpdate(d.id)} className="text-green-600 hover:text-green-800 text-sm font-medium">Save</button>
                                                <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => { setEditingId(d.id); setEditName(d.name); setEditCode(d.code) }}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                                <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}

            {ungrouped.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-600 bg-yellow-50 dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">⚠️ Unlinked Departments</h3>
                    </div>
                    <div className="p-4 text-sm text-gray-500">{ungrouped.length} department(s) without valid faculty reference</div>
                </div>
            )}

            {departments.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No departments found. Create a Faculty first, then add departments.
                </div>
            )}
        </div>
    )
}
