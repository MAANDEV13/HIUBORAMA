'use client'

import { useState, useEffect } from 'react'
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from '@/app/actions/faculties'
import { ExportCSVButton } from '@/app/components/ExportCSVButton'

export default function FacultiesPage() {
    const [faculties, setFaculties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState('')
    const [newCode, setNewCode] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editCode, setEditCode] = useState('')

    useEffect(() => { load() }, [])

    async function load() {
        const data = await getFaculties()
        setFaculties(data)
        setLoading(false)
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newName.trim() || !newCode.trim()) return
        await createFaculty({ name: newName.trim(), code: newCode.trim().toUpperCase() })
        setNewName('')
        setNewCode('')
        load()
    }

    async function handleUpdate(id: string) {
        if (!editName.trim() || !editCode.trim()) return
        await updateFaculty(id, { name: editName.trim(), code: editCode.trim().toUpperCase() })
        setEditingId(null)
        load()
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this faculty?')) return
        const result = await deleteFaculty(id)
        if (result?.error) {
            alert(result.error)
        } else {
            load()
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Faculty Management</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Manage faculties — the top level of the academic hierarchy</p>
                </div>
                <ExportCSVButton 
                    data={faculties.map(f => ({
                        name: f.name,
                        code: f.code,
                        departments: f._count?.departments || 0
                    }))}
                    headers={[
                        { key: 'name', label: 'Name' },
                        { key: 'code', label: 'Code' },
                        { key: 'departments', label: 'Departments Count' }
                    ]}
                    filename="faculties"
                />
            </div>

            {/* Create Form */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Create New Faculty</h2>
                <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Faculty Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. Faculty of Engineering"
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
                            placeholder="e.g. ENG"
                            className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                            maxLength={10}
                        />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm">
                        Create Faculty
                    </button>
                </form>
            </div>

            {/* Faculty List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Departments</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {faculties.map(f => (
                            <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === f.id ? (
                                        <input
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="border p-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                                            autoFocus
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleUpdate(f.id)
                                                if (e.key === 'Escape') setEditingId(null)
                                            }}
                                        />
                                    ) : (
                                        <span className="font-medium dark:text-gray-200">{f.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === f.id ? (
                                        <input
                                            value={editCode}
                                            onChange={e => setEditCode(e.target.value)}
                                            className="border p-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white w-20 uppercase"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleUpdate(f.id)
                                                if (e.key === 'Escape') setEditingId(null)
                                            }}
                                        />
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{f.code}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {f._count?.departments || 0} dept(s)
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                    {editingId === f.id ? (
                                        <>
                                            <button onClick={() => handleUpdate(f.id)} className="text-green-600 hover:text-green-800 text-sm font-medium">Save</button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setEditingId(f.id); setEditName(f.name); setEditCode(f.code) }}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {faculties.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No faculties found. Create one above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
