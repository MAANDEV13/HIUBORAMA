'use client'

import { useState } from 'react'

type Enrollment = {
    id: string
    attendance: number
    assessment: number
    midExam: number
    finalExam: number
    total: number
    grade: string
    status: string
    student: {
        studentId: string
        user: {
            name: string
        }
    }
}

export default function DownloadGradesButton({
    enrollments,
    courseCode,
    courseName,
    semesterName
}: {
    enrollments: any[],
    courseCode: string,
    courseName: string,
    semesterName: string
}) {
    const [downloading, setDownloading] = useState(false)

    const handleDownload = () => {
        setDownloading(true)
        try {
            // Define CSV headers
            const headers = [
                'Student ID',
                'Name',
                'Attendance',
                'Assessment',
                'Mid Exam',
                'Final Exam',
                'Total',
                'Grade',
                'Status'
            ]

            // Convert data to CSV format
            const csvRows = [
                headers.join(','), // Header row
                ...enrollments.map(e => {
                    const row = [
                        e.student.studentId,
                        `"${e.student.user.name}"`, // Quote name to handle commas
                        e.attendance,
                        e.assessment,
                        e.midExam,
                        e.finalExam,
                        e.total,
                        e.grade,
                        e.status
                    ]
                    return row.join(',')
                })
            ]

            const csvContent = csvRows.join('\n')

            // Create blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')

            // Set filename
            const filename = `${courseCode}_${semesterName}_Grades.csv`.replace(/\s+/g, '_')

            link.setAttribute('href', url)
            link.setAttribute('download', filename)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Download failed:', error)
            alert('Failed to download CSV')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all disabled:opacity-50"
        >
            <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {downloading ? 'Downloading...' : 'Download CSV'}
        </button>
    )
}
