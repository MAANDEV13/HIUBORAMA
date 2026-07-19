'use client';

import { useState } from 'react';
import { resetStudentPassword, searchStudents } from '@/app/actions/resetPassword';

interface Student {
    id: string;
    studentId: string;
    name: string;
}

export default function ResetPasswordPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length >= 2) {
            const students = await searchStudents(val);
            setResults(students);
        } else {
            setResults([]);
        }
    };

    const handleSelect = (student: Student) => {
        setSelectedStudent(student);
        setQuery('');
        setResults([]);
        setMessage(null);
        setNewPassword('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !newPassword) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('studentId', selectedStudent.studentId);
        formData.append('newPassword', newPassword);

        const res = await resetStudentPassword(formData);
        setIsLoading(false);

        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: res.message || 'Success!' });
            setSelectedStudent(null);
            setNewPassword('');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
                Reset Student Password
            </h1>

            {/* Search Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Student
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder="Search by Name or Student ID..."
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {results.length > 0 && (
                        <div className="absolute top-100 left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-md shadow-lg z-10 max-h-60 overflow-y-auto">
                            {results.map((student) => (
                                <div
                                    key={student.id}
                                    onClick={() => handleSelect(student)}
                                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                    <p className="font-semibold text-gray-800 dark:text-white">{student.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{student.studentId}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reset Form Section */}
            {selectedStudent && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Reset Password for: <span className="text-blue-600">{selectedStudent.name}</span>
                        <span className="text-gray-500 text-sm ml-2">({selectedStudent.studentId})</span>
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                New Password
                            </label>
                            <input
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setSelectedStudent(null)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Message Alert */}
            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                        : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                    }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
