'use client';

import { useState, FormEvent, useEffect } from 'react';
import { changePassword } from '@/app/actions/changePassword';
import {
    getAdminPreferences,
    updateAdminPreferences,
    AdminPreferences,
} from '@/app/actions/adminPreferences';
import { exportDatabase, importDatabase } from '@/app/actions/databaseBackup';
import Link from 'next/link';

export default function AdminSettings() {
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    // Preferences state
    const [preferences, setPreferences] = useState<AdminPreferences>({
        showFailedStudentsReport: true,
        showRecentEnrollments: true,
    });
    const [preferencesMessage, setPreferencesMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isPreferencesLoading, setIsPreferencesLoading] = useState(false);

    // Backup state
    const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isBackupLoading, setIsBackupLoading] = useState(false);

    // Load preferences on mount
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        const result = await getAdminPreferences();
        if (result.success && result.preferences) {
            setPreferences(result.preferences);
        }
    };

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'All fields are required' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setIsPasswordLoading(true);

        try {
            const result = await changePassword(currentPassword, newPassword);

            if (result.success) {
                setPasswordMessage({ type: 'success', text: result.message || 'Password changed successfully' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMessage({ type: 'error', text: result.error || 'Failed to change password' });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handlePreferenceToggle = async (key: keyof AdminPreferences) => {
        setPreferencesMessage(null);
        setIsPreferencesLoading(true);

        const newValue = !preferences[key];
        const updatedPreferences = { ...preferences, [key]: newValue };

        try {
            const result = await updateAdminPreferences({ [key]: newValue });

            if (result.success && result.preferences) {
                setPreferences(result.preferences);
                setPreferencesMessage({ type: 'success', text: 'Preferences updated successfully' });
            } else {
                setPreferencesMessage({ type: 'error', text: result.error || 'Failed to update preferences' });
            }
        } catch (error) {
            setPreferencesMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsPreferencesLoading(false);
        }
    };

    const handleExportDatabase = async () => {
        setBackupMessage(null);
        setIsBackupLoading(true);

        try {
            const result = await exportDatabase();

            if (result.success && result.data) {
                // Create a blob and download
                const blob = new Blob([result.data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hiuborama-backup-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                setBackupMessage({ type: 'success', text: 'Database exported successfully' });
            } else {
                setBackupMessage({ type: 'error', text: result.error || 'Failed to export database' });
            }
        } catch (error) {
            setBackupMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsBackupLoading(false);
        }
    };

    const handleImportDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('WARNING: This will replace your current database! Please ensure you have exported a backup first.\n\nAre you sure you want to proceed?')) {
            e.target.value = '';
            return;
        }

        setBackupMessage(null);
        setIsBackupLoading(true);

        try {
            const jsonString = await file.text();

            const result = await importDatabase(jsonString);

            if (result.success) {
                setBackupMessage({ type: 'success', text: result.message || 'Database imported successfully' });
            } else {
                setBackupMessage({ type: 'error', text: result.error || 'Failed to import database' });
            }
        } catch (error) {
            setBackupMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsBackupLoading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
                <p className="mt-2 text-gray-600">Manage your account and system settings</p>
            </div>

            {/* Grading System Link */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Grading System Configuration</h2>
                    <p className="text-sm text-gray-600 mt-1">Configure minimum marks, letter grades, and GPA points.</p>
                </div>
                <Link href="/admin/settings/grading" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                    Configure Grading &rarr;
                </Link>
            </div>

            {/* Password Change Section */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                    {passwordMessage && (
                        <div
                            className={`p-4 rounded-lg ${passwordMessage.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                        >
                            {passwordMessage.text}
                        </div>
                    )}

                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isPasswordLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isPasswordLoading}
                        />
                        <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters</p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isPasswordLoading}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isPasswordLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isPasswordLoading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Dashboard Preferences Section */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Dashboard Preferences</h2>
                    <p className="text-sm text-gray-600 mt-1">Control which sections appear on your dashboard</p>
                </div>

                <div className="p-6 space-y-4">
                    {preferencesMessage && (
                        <div
                            className={`p-4 rounded-lg ${preferencesMessage.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                        >
                            {preferencesMessage.text}
                        </div>
                    )}

                    {/* Toggle: Failed Students Report */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="font-medium text-gray-900">Show Failed Students Report</h3>
                            <p className="text-sm text-gray-600">Display students with F grades on dashboard</p>
                        </div>
                        <button
                            onClick={() => handlePreferenceToggle('showFailedStudentsReport')}
                            disabled={isPreferencesLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.showFailedStudentsReport ? 'bg-blue-600' : 'bg-gray-300'
                                } disabled:opacity-50`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.showFailedStudentsReport ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Toggle: Recent Enrollments */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="font-medium text-gray-900">Show Recent Enrollments</h3>
                            <p className="text-sm text-gray-600">Display recent enrollment activity on dashboard</p>
                        </div>
                        <button
                            onClick={() => handlePreferenceToggle('showRecentEnrollments')}
                            disabled={isPreferencesLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.showRecentEnrollments ? 'bg-blue-600' : 'bg-gray-300'
                                } disabled:opacity-50`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.showRecentEnrollments ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Database Backup Section */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Database Backup</h2>
                    <p className="text-sm text-gray-600 mt-1">Export or import your database</p>
                </div>

                <div className="p-6 space-y-4">
                    {backupMessage && (
                        <div
                            className={`p-4 rounded-lg ${backupMessage.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                        >
                            {backupMessage.text}
                        </div>
                    )}

                    {/* Export Database */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Export Database</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Download a backup of your current database
                        </p>
                        <button
                            onClick={handleExportDatabase}
                            disabled={isBackupLoading}
                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {isBackupLoading ? 'Exporting...' : 'Export Database'}
                        </button>
                    </div>

                    {/* Import Database */}
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h3 className="font-medium text-red-900 mb-2">Import Database</h3>
                        <p className="text-sm text-red-700 mb-4">
                            ⚠️ WARNING: This will replace your current database! Please ensure you have a backup first.
                        </p>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportDatabase}
                            disabled={isBackupLoading}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-600 file:text-white hover:file:bg-red-700"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
