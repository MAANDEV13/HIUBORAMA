'use client'

import { useState, useEffect } from 'react'
import { getBatches } from '@/app/actions/batches'
import { getTeachers } from '@/app/actions/teachers'
import { getBatchSemesters, assignBatchToSemester, assignCourseToBatchSemester, updateCourseAssignment, removeCourseAssignment, registerBatchCourses, removeBatchSemester } from '@/app/actions/scheduling'
import { getCourses } from '@/app/actions/courses'
import { getSemesters, createSemester } from '@/app/actions/semesters'

export default function SchedulingPage() {
    const [semesters, setSemesters] = useState<any[]>([])
    const [selectedSemester, setSelectedSemester] = useState<string>('')
    const [batches, setBatches] = useState<any[]>([])
    const [teachers, setTeachers] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])

    const [batchSemesters, setBatchSemesters] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // New Semester Form State
    const [newSemName, setNewSemName] = useState('')
    const [newSemStart, setNewSemStart] = useState('')
    const [newSemEnd, setNewSemEnd] = useState('')

    // Load initial data
    useEffect(() => {
        loadInitialData()
    }, [])

    useEffect(() => {
        if (selectedSemester) {
            loadBatchSemesters(selectedSemester)
        } else {
            setBatchSemesters([])
        }
    }, [selectedSemester])

    async function loadInitialData() {
        const [bData, tData, sData, cData] = await Promise.all([
            getBatches(),
            getTeachers(),
            getSemesters(),
            getCourses()
        ])
        setBatches(bData)
        setTeachers(tData)
        setSemesters(sData)
        setCourses(cData)
    }

    async function loadBatchSemesters(semesterId: string) {
        setLoading(true)
        const data = await getBatchSemesters(semesterId)
        setBatchSemesters(data)
        setLoading(false)
    }

    async function handleCreateSemester(e: React.FormEvent) {
        e.preventDefault()
        if (!newSemName || !newSemStart || !newSemEnd) return

        await createSemester({
            name: newSemName,
            startDate: new Date(newSemStart),
            endDate: new Date(newSemEnd)
        })

        // Reset form and reload semesters
        setNewSemName('')
        setNewSemStart('')
        setNewSemEnd('')
        const sData = await getSemesters()
        setSemesters(sData)
    }

    async function handleAssignBatch() {
        const bId = (document.getElementById('newBatchSelect') as HTMLSelectElement).value
        const sem = (document.getElementById('newAcademicSem') as HTMLInputElement).value

        if (bId && sem && selectedSemester) {
            await assignBatchToSemester(bId, selectedSemester, parseInt(sem))
            await loadBatchSemesters(selectedSemester)
                // Clear inputs
                ; (document.getElementById('newBatchSelect') as HTMLSelectElement).value = ''
                ; (document.getElementById('newAcademicSem') as HTMLInputElement).value = ''
        }
    }

    async function handleAssignCourse(batchSemesterId: string, courseId: string) {
        if (courseId) {
            await assignCourseToBatchSemester(batchSemesterId, courseId)
            await loadBatchSemesters(selectedSemester)
        }
    }

    async function handleUpdateTeacher(assignmentId: string, teacherId: string) {
        await updateCourseAssignment(assignmentId, teacherId)
        await loadBatchSemesters(selectedSemester)
    }

    async function handleRemoveCourse(assignmentId: string) {
        if (confirm('Are you sure you want to remove this course?')) {
            await removeCourseAssignment(assignmentId)
            await loadBatchSemesters(selectedSemester)
        }
    }

    async function handleRegisterAll(batchSemesterId: string) {
        if (confirm('Register all students in this batch to these courses?')) {
            await registerBatchCourses(batchSemesterId)
            alert('Students registered successfully!')
        }
    }

    async function handleRemoveBatchSemester(batchSemesterId: string, batchName: string, academicSemester: number) {
        if (confirm(`Are you sure you want to remove "${batchName} - Academic Semester ${academicSemester}"?\n\nThis will:\n- Delete all course assignments\n- Unregister all students from these courses\n- Remove this batch semester completely`)) {
            await removeBatchSemester(batchSemesterId)
            await loadBatchSemesters(selectedSemester)
            alert('Batch semester removed successfully!')
        }
    }

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold dark:text-white">Semester Planning & Scheduling</h1>

            {/* Create New Semester Section */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Create New Semester</h3>
                <form onSubmit={handleCreateSemester} className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Semester Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Summer 2025"
                            value={newSemName}
                            onChange={e => setNewSemName(e.target.value)}
                            className="border p-2 rounded w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Start Date</label>
                        <input
                            type="date"
                            value={newSemStart}
                            onChange={e => setNewSemStart(e.target.value)}
                            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">End Date</label>
                        <input
                            type="date"
                            value={newSemEnd}
                            onChange={e => setNewSemEnd(e.target.value)}
                            className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Create
                    </button>
                </form>
            </div>

            {/* Semester Selector */}
            <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Select Semester (Time)</label>
                <select
                    value={selectedSemester}
                    onChange={e => setSelectedSemester(e.target.value)}
                    className="border p-2 rounded w-full max-w-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="">-- Select Semester --</option>
                    {semesters.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {selectedSemester && (
                <div className="space-y-8">
                    {/* Batch Planning Section */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Batch Assignments</h2>

                        {loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}

                        {/* List existing batch assignments */}
                        {!loading && batchSemesters.map(bs => (
                            <div key={bs.id} className="border-b dark:border-gray-700 py-4 last:border-0">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-lg dark:text-white">{bs.batch.name} - Academic Semester {bs.academicSemester}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRegisterAll(bs.id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                        >
                                            Register All Students
                                        </button>
                                        <button
                                            onClick={() => handleRemoveBatchSemester(bs.id, bs.batch.name, bs.academicSemester)}
                                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Course Assignments */}
                                <div className="ml-4 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">Scheduled Courses</h4>
                                    {bs.courseAssignments.map((ca: any) => (
                                        <div key={ca.id} className="flex items-center gap-4 mb-2 text-sm">
                                            <span className="font-medium w-24 dark:text-white">{ca.course.code}</span>
                                            <span className="flex-1 dark:text-gray-200">{ca.course.name}</span>
                                            <select
                                                value={ca.teacherId || ''}
                                                onChange={(e) => handleUpdateTeacher(ca.id, e.target.value)}
                                                className="border rounded p-1 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                            >
                                                <option value="">Select Teacher</option>
                                                {teachers.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                            <button onClick={() => handleRemoveCourse(ca.id)} className="text-red-500 hover:text-red-700">×</button>
                                        </div>
                                    ))}

                                    {/* Add Course Button */}
                                    <div className="mt-2">
                                        <select
                                            className="border rounded p-1 text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                            onChange={(e) => handleAssignCourse(bs.id, e.target.value)}
                                        >
                                            <option value="">+ Add Course</option>
                                            {courses
                                                .filter(c => !bs.courseAssignments.some((ca: any) => ca.courseId === c.id))
                                                .map(c => (
                                                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Batch to Semester */}
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                            <h3 className="text-sm font-medium mb-2 dark:text-gray-200">Add Batch to this Semester</h3>
                            <div className="flex gap-2">
                                <select id="newBatchSelect" className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="">Select Batch</option>
                                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                <input type="number" id="newAcademicSem" placeholder="Sem (1-9)" className="border p-2 rounded w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                <button
                                    onClick={handleAssignBatch}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
