'use client';

import Image from 'next/image';
import { useState } from 'react';
import { login } from '../actions/auth';

export default function LoginPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError('');

        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
            <div className="w-full max-w-md">
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <div className="relative inline-flex items-center justify-center w-28 h-28 mb-6 bg-white rounded-full shadow-lg border-4 border-[var(--color-primary)] overflow-hidden">
                            <img
                                src="/logo-circle.png"
                                alt="HIUBORAMA EXAMS Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">HIUBORAMA EXAMS</h1>
                        <p className="text-gray-600">Sign in to access your account</p>
                    </div >

                    <form action={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username / Student ID
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none text-gray-900"
                                placeholder="Enter your username"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none text-gray-900"
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p className="mb-2">
                            Haddii aad la kulanto dhibaato dhinaca isticmaalka, fadlan la xidhiidh maamulaha nidaamka ama xafiiska diiwaangelinta.:
                        </p>
                        <div className="space-y-1 text-xs bg-gray-50 p-3 rounded-lg">
                            <p>
                                <strong>Tel:</strong> <a href="Tel:613004" className="text-[var(--color-primary)] hover:underline">613004</a>
                            </p>
                            <p>
                                <strong>WhatsApp:</strong> <a href="https://wa.me/252638325804" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">+252638325804</a>
                            </p>
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
}

