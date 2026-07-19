'use client'

import { Download } from 'lucide-react'

interface ExportCSVButtonProps {
    data: any[]
    headers: { key: string; label: string }[]
    filename: string
}

export function ExportCSVButton({ data, headers, filename }: ExportCSVButtonProps) {
    const handleDownload = () => {
        if (!data || data.length === 0) return

        const csvContent = [
            headers.map(h => h.label).join(','),
            ...data.map(row => 
                headers.map(h => {
                    let value = row[h.key]
                    // Handle nested objects if necessary, e.g. key: "user.name"
                    if (h.key.includes('.')) {
                        value = h.key.split('.').reduce((acc, part) => acc && acc[part], row)
                    }
                    if (value === null || value === undefined) value = ''
                    // Escape quotes and commas
                    return `"${String(value).replace(/"/g, '""')}"`
                }).join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            title="Download table data as CSV"
        >
            <Download className="mr-2 -ml-1 h-4 w-4" />
            Download CSV
        </button>
    )
}
