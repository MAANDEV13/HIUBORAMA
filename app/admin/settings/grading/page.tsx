'use client';

import { useState, useEffect } from 'react';
import { getGradingScales, createGradingScale, updateGradingScale, deleteGradingScale } from '@/app/actions/grading';
import Link from 'next/link';

export default function GradingSettings() {
    const [scales, setScales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newScale, setNewScale] = useState({ grade: '', minMark: 0, gpaPoint: 0 });
    const [editMode, setEditMode] = useState<string | null>(null);
    const [editData, setEditData] = useState({ grade: '', minMark: 0, gpaPoint: 0 });

    useEffect(() => {
        loadScales();
    }, []);

    async function loadScales() {
        setLoading(true);
        const data = await getGradingScales();
        setScales(data);
        setLoading(false);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newScale.grade) return;
        const result = await createGradingScale(newScale);
        if (result.error) alert(result.error);
        else {
            setNewScale({ grade: '', minMark: 0, gpaPoint: 0 });
            loadScales();
        }
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!editMode || !editData.grade) return;
        const result = await updateGradingScale(editMode, editData);
        if (result.error) alert(result.error);
        else {
            setEditMode(null);
            loadScales();
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this grading scale?')) return;
        const result = await deleteGradingScale(id);
        if (result.error) alert(result.error);
        else loadScales();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10 pt-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/settings" className="text-blue-600 hover:text-blue-800">
                    &larr; Back to Settings
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grading System</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Configure how student marks translate to letter grades and GPA points.</p>
                </div>
            </div>

            {/* Create Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Add New Grade Threshold</h2>
                <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Grade Letter</label>
                        <input
                            type="text"
                            value={newScale.grade}
                            onChange={e => setNewScale({ ...newScale, grade: e.target.value })}
                            placeholder="e.g. A+"
                            className="border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-32"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Minimum Mark</label>
                        <input
                            type="number"
                            step="0.01"
                            value={newScale.minMark}
                            onChange={e => setNewScale({ ...newScale, minMark: parseFloat(e.target.value) })}
                            className="border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-32"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-200">GPA Points</label>
                        <input
                            type="number"
                            step="0.01"
                            value={newScale.gpaPoint}
                            onChange={e => setNewScale({ ...newScale, gpaPoint: parseFloat(e.target.value) })}
                            className="border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-32"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Add Grade
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Minimum Mark</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GPA Points</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Loading grading scales...</td>
                            </tr>
                        )}
                        {!loading && scales.map((scale) => (
                            <tr key={scale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                {editMode === scale.id ? (
                                    <>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={editData.grade}
                                                onChange={e => setEditData({ ...editData, grade: e.target.value })}
                                                className="border p-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white w-20"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editData.minMark}
                                                onChange={e => setEditData({ ...editData, minMark: parseFloat(e.target.value) })}
                                                className="border p-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white w-24"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editData.gpaPoint}
                                                onChange={e => setEditData({ ...editData, gpaPoint: parseFloat(e.target.value) })}
                                                className="border p-1 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white w-24"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={handleUpdate} className="text-green-600 hover:text-green-800 font-medium">Save</button>
                                            <button onClick={() => setEditMode(null)} className="text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                            {scale.grade}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {scale.minMark} and above
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {scale.gpaPoint}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            <button 
                                                onClick={() => {
                                                    setEditMode(scale.id);
                                                    setEditData({ grade: scale.grade, minMark: scale.minMark, gpaPoint: scale.gpaPoint });
                                                }} 
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(scale.id)} 
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
