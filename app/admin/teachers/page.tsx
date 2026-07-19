'use client'

import { useState, useEffect } from 'react'
import { getTeachers, createTeacher, deleteTeacher } from '@/app/actions/teachers'
import { ExportCSVButton } from '@/app/components/ExportCSVButton'

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<any[]>([])
    const [newTeacher, setNewTeacher] = useState({ name: '', phone: '', email: '' })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTeachers()
    }, [])

    async function loadTeachers() {
        const data = await getTeachers()
        setTeachers(data)
        setLoading(false)
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newTeacher.name) return
        await createTeacher(newTeacher)
        setNewTeacher({ name: '', phone: '', email: '' })
        loadTeachers()
    }

    async function handleDelete(id: string) {
        if (confirm('Are you sure?')) {
            await deleteTeacher(id)
            loadTeachers()
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Teacher Management</h1>
                <ExportCSVButton 
                    data={teachers}
                    headers={[
                        { key: 'name', label: 'Name' },
                        { key: 'phone', label: 'Phone' },
                        { key: 'email', label: 'Email' }
                    ]}
                    filename="teachers"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-8">
                <h2 className="text-xl mb-4 dark:text-white">Add New Teacher</h2>
                <form onSubmit={handleCreate} className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-200">Name</label>
                        <input
                            type="text"
                            value={newTeacher.name}
                            onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-200">Phone</label>
                        <input
                            type="text"
                            value={newTeacher.phone}
                            onChange={e => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-200">Email</label>
                        <input
                            type="email"
                            value={newTeacher.email}
                            onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Add Teacher
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {teachers.map(teacher => (
                            <tr key={teacher.id}>
                                <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">{teacher.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">{teacher.phone || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap dark:text-gray-200">{teacher.email || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleDelete(teacher.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {teachers.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No teachers found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
