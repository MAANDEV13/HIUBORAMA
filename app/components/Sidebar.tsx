'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../actions/auth';
import { useState } from 'react';

interface SidebarProps {
    userName: string;
    role: string;
}

export function Sidebar({ userName, role }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const adminLinks = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/students', label: 'Students', icon: '👥' },
        { href: '/admin/courses', label: 'Courses', icon: '📚' },
        { href: '/admin/grades', label: 'Grades', icon: '📝' },
        { href: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
        { href: '/admin/faculties', label: 'Faculties', icon: '🏛️' },
        { href: '/admin/departments', label: 'Departments', icon: '🏢' },
        { href: '/admin/classes', label: 'Classes', icon: '🎓' },
        { href: '/admin/batches', label: 'Batches', icon: '📅' },
        { href: '/admin/scheduling', label: 'Scheduling', icon: '🗓️' },
        { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
        { href: '/admin/reset-password', label: 'Reset Pwd', icon: '🔒' },
    ];


    const studentLinks = [
        { href: '/student', label: 'Dashboard', icon: '📊' },
        { href: '/student/transcript', label: 'Transcript', icon: '📄' },
        { href: '/student/settings', label: 'Settings', icon: '⚙️' },
    ];

    const links = role === 'ADMIN' ? adminLinks : studentLinks;

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
            >
                {isOpen ? '✕' : '☰'}
            </button>

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 h-full bg-gray-900 text-white w-64 transition-transform duration-300 ease-in-out z-40
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="p-6 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                                <img src="/logo-circle.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-bold">HIUBORAMA EXAMS</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-3">
                            {links.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${pathname === link.href
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                    >
                                        <span className="mr-3 text-lg">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-gray-800 bg-gray-900">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{userName}</p>
                                <p className="text-xs text-gray-500 truncate">{role}</p>
                            </div>
                        </div>
                        <form action={logout}>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
