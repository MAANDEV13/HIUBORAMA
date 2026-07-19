'use client';

import { useState } from 'react';
import { uploadGrades } from '@/app/actions/grades';
import { useRouter } from 'next/navigation';

export default function UploadGradesPage({ semesters }: { semesters: any[] }) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError('');
        setSuccess('');

        const result = await uploadGrades(formData);

        if (result?.error) {
            setError(result.error);
        } else if (result?.success) {
            setSuccess(`Successfully uploaded ${result.count} grades!`);
            if (result.errors) {
                setError(`Uploaded with warnings: ${result.errors.join(', ')}`);
            } else {
                setTimeout(() => {
                    router.push('/admin/grades');
                }, 2000);
            }
        }
        setLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Grades CSV</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Upload a CSV file with columns: <code>studentId</code>, <code>courseCode</code>, <code>attendance</code>, <code>assessment</code>, <code>midExam</code>, <code>finalExam</code>
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

                    <div>
                        <label htmlFor="semesterId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Semester
                        </label>
                        <select
                            name="semesterId"
                            id="semesterId"
                            required
                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select a semester...</option>
                            {semesters.map((sem) => (
                                <option key={sem.id} value={sem.id}>
                                    {sem.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                        <input
                            type="file"
                            name="file"
                            accept=".csv"
                            required
                            className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100
                dark:text-gray-400
                dark:file:bg-purple-900 dark:file:text-purple-200
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
                            className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Uploading...' : 'Upload Grades'}
                        </button>
                    </div>
                </form>

                <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Example CSV Format:</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                        studentId,courseCode,attendance,assessment,midExam,finalExam<br />
                        2024001,CS101,10,15,20,45<br />
                        2024002,MATH101,9,14,18,40
                    </div>
                </div>
            </div>
        </div>
    );
}
