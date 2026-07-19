'use client';

import { useState } from 'react';
import { updateGrade } from '@/app/actions/grades';

interface GradeRowProps {
    enrollment: any;
}

export default function GradeRow({ enrollment }: GradeRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        attendance: enrollment.attendance || 0,
        assessment: enrollment.assessment || 0,
        midExam: enrollment.midExam || 0,
        finalExam: enrollment.finalExam || 0,
    });

    async function handleSave() {
        setLoading(true);
        const result = await updateGrade(enrollment.id, formData);
        setLoading(false);
        if (result.success) {
            setIsEditing(false);
        } else {
            alert('Failed to update grade');
        }
    }

    if (isEditing) {
        return (
            <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {enrollment.student.studentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {enrollment.student.user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <input
                        type="number"
                        value={formData.attendance}
                        onChange={(e) => setFormData({ ...formData, attendance: Number(e.target.value) })}
                        className="w-16 p-1 border rounded text-center"
                        min="0"
                        max="10"
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <input
                        type="number"
                        value={formData.assessment}
                        onChange={(e) => setFormData({ ...formData, assessment: Number(e.target.value) })}
                        className="w-16 p-1 border rounded text-center"
                        min="0"
                        max="20"
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <input
                        type="number"
                        value={formData.midExam}
                        onChange={(e) => setFormData({ ...formData, midExam: Number(e.target.value) })}
                        className="w-16 p-1 border rounded text-center"
                        min="0"
                        max="30"
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <input
                        type="number"
                        value={formData.finalExam}
                        onChange={(e) => setFormData({ ...formData, finalExam: Number(e.target.value) })}
                        className="w-16 p-1 border rounded text-center"
                        min="0"
                        max="40"
                    />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900">
                    {formData.attendance + formData.assessment + formData.midExam + formData.finalExam}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">
                    -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="text-green-600 hover:text-green-900 font-bold"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {enrollment.student.studentId}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {enrollment.student.user.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                {enrollment.attendance ?? '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                {enrollment.assessment ?? '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                {enrollment.midExam ?? '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                {enrollment.finalExam ?? '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900">
                {enrollment.total ?? '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">
                {enrollment.grade || '-'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${enrollment.status === 'PASSED' ? 'bg-green-100 text-green-800' :
                    enrollment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {enrollment.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-900"
                >
                    Edit
                </button>
            </td>
        </tr>
    );
}
