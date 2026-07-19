'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { login } from '../actions/auth';

export default function LoginPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none text-gray-900 bg-gray-50 focus:bg-white"
                                    placeholder="Enter your username"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    required
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none text-gray-900 bg-gray-50 focus:bg-white"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-gray-500 max-w-sm mx-auto">
                        <p className="mb-3">
                            Haddii aad la kulanto dhibaato dhinaca isticmaalka, fadlan la xidhiidh maamulaha nidaamka.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 bg-gray-50/50 backdrop-blur-sm p-3 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <a href="tel:634561128">63 4561128</a>
                            </div>
                            <div className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <a href="tel:638881313">63 8881313</a>
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
}

