'use client'

import Link from 'next/link'
import { useState } from 'react'
import { updateSemester } from '@/app/actions/semesters'
import { useRouter } from 'next/navigation'

type Semester = {
    id: string
    name: string
    startDate: Date
    endDate: Date
    active: boolean
}

interface SemesterCardProps {
    semester: Semester
    label?: string              // e.g. "CS-SH-2023-SEM3"
    batchSemesterStatus?: string // "UPCOMING" | "ACTIVE" | "COMPLETED"
}

export default function SemesterCard({ semester, label, batchSemesterStatus }: SemesterCardProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [newName, setNewName] = useState(semester.name)
    const [saving, setSaving] = useState(false)

    const getStatus = () => {
        const now = new Date()
        const start = new Date(semester.startDate)
        const end = new Date(semester.endDate)

        if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' }
        if (now > end) return { label: 'Archived', color: 'bg-gray-100 text-gray-800' }
        return { label: 'Active', color: 'bg-green-100 text-green-800' }
    }

    const handleSave = async () => {
        if (!newName.trim() || newName === semester.name) {
            setIsEditing(false)
            return
        }

        setSaving(true)
        try {
            await updateSemester(semester.id, { name: newName.trim() })
            setIsEditing(false)
            router.refresh()
        } catch (error) {
            alert('Failed to update semester name')
            setNewName(semester.name)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setNewName(semester.name)
        setIsEditing(false)
    }

    const status = getStatus()

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="p-6">
                {/* Label badge at the top */}
                {label && (
                    <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-indigo-300 font-mono tracking-wide">
                            {label}
                        </span>
                    </div>
                )}

                {isEditing ? (
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full text-lg font-bold text-gray-900 dark:text-white bg-transparent border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave()
                                if (e.key === 'Escape') handleCancel()
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{semester.name}</h3>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 ml-2"
                            title="Edit name"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.label}
                        </span>
                        {batchSemesterStatus && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                batchSemesterStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                batchSemesterStatus === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                                {batchSemesterStatus}
                            </span>
                        )}
                    </div>
                    <Link href={`/admin/grades/${semester.id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                        View Grades →
                    </Link>
                </div>
            </div>
        </div>
    )
}
