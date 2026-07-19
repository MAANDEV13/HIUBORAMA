'use client';

import { useState } from 'react';
import { uploadStudents } from '@/app/actions/students';
import { useRouter } from 'next/navigation';

export default function UploadStudentsPage() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError('');
        setSuccess('');

        const result = await uploadStudents(formData);

        if (result?.error) {
            setError(result.error);
        } else if (result?.success) {
            setSuccess(`Successfully uploaded ${result.count} students!`);
            setTimeout(() => {
                router.push('/admin/students');
            }, 2000);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Students CSV</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Upload a CSV file with columns: <code>studentId</code>, <code>name</code>, <code>program</code>, <code>batch</code>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        The <code>batch</code> value links the student to the academic hierarchy (e.g. SH-2023). Class assignments are done per-semester on the Assign Classes page.<br/>
                        Default password will be set to Student ID
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                        <input
                            type="file"
                            name="file"
                            accept=".csv"
                            required
                            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:text-gray-300
                dark:file:bg-blue-900 dark:file:text-blue-200
                cursor-pointer"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Supported format: .csv</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Uploading...' : 'Upload Students'}
                        </button>
                    </div>
                </form>

                <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Example CSV Format:</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                        studentId,name,program,batch<br />
                        2024004,Sarah Johnson,Bachelor,2024<br />
                        2024005,Michael Brown,Diploma,2024
                    </div>
                </div>
            </div>
        </div>
    );
}
