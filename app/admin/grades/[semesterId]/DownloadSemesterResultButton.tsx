'use client'

import { useState } from 'react'
import { getSemesterResults, SemesterResultData } from '@/app/actions/reports'

export default function DownloadSemesterResultButton({
    semesterId,
    semesterName
}: {
    semesterId: string,
    semesterName: string
}) {
    const [downloading, setDownloading] = useState(false)

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const data: SemesterResultData = await getSemesterResults(semesterId)

            if (data.results.length === 0) {
                alert('No data found for this semester')
                return
            }

            // Define CSV headers
            const courseHeaders = data.courses.map(c => `${c.code} (${c.credits})`)
            const headers = [
                'SN',
                'Student ID',
                'Name',
                'Batch',
                ...courseHeaders,
                'Total Marks',
                'GPA',
                'Rank'
            ]

            // Convert data to CSV format
            const csvRows = [
                headers.join(','), // Header row
                ...data.results.map(row => {
                    const courseValues = data.courses.map(c => row.courseGrades[c.code] || '-')
                    const csvRow = [
                        row.sn,
                        row.studentId,
                        `"${row.name}"`, // Quote name
                        row.batch,
                        ...courseValues,
                        row.totalMarks,
                        row.gpa,
                        row.rank
                    ]
                    return csvRow.join(',')
                })
            ]

            const csvContent = csvRows.join('\n')

            // Create blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')

            // Set filename
            const filename = `${semesterName}_Full_Result.csv`.replace(/\s+/g, '_')

            link.setAttribute('href', url)
            link.setAttribute('download', filename)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Download failed:', error)
            alert('Failed to download result')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm transition-all disabled:opacity-50"
        >
            <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {downloading ? 'Generating...' : 'Download Full Result'}
        </button>
    )
}
