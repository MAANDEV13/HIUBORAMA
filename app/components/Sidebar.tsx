'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../actions/auth';
import { useState } from 'react';
import { 
    LayoutDashboard, Users, BookOpen, GraduationCap, 
    Building2, Building, School, CalendarDays, 
    Calendar, Settings, Lock, FileText, FileBarChart2 
} from 'lucide-react';

interface SidebarProps {
    userName: string;
    role: string;
}

export function Sidebar({ userName, role }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const adminSections = [
        {
            title: 'Overview',
            items: [
                { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            ]
        },
        {
            title: 'Hierarchy & Structure',
            items: [
                { href: '/admin/faculties', label: 'Faculties', icon: <Building2 size={20} /> },
                { href: '/admin/departments', label: 'Departments', icon: <Building size={20} /> },
                { href: '/admin/batches', label: 'Batches', icon: <CalendarDays size={20} /> },
                { href: '/admin/scheduling', label: 'Scheduling', icon: <Calendar size={20} /> },
                { href: '/admin/classes', label: 'Classes', icon: <School size={20} /> },
            ]
        },
        {
            title: 'Academics & People',
            items: [
                { href: '/admin/courses', label: 'Courses', icon: <BookOpen size={20} /> },
                { href: '/admin/teachers', label: 'Teachers', icon: <GraduationCap size={20} /> },
                { href: '/admin/students', label: 'Students', icon: <Users size={20} /> },
                { href: '/admin/grades', label: 'Grades', icon: <FileText size={20} /> },
            ]
        },
        {
            title: 'System',
            items: [
                { href: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
                { href: '/admin/reset-password', label: 'Reset Pwd', icon: <Lock size={20} /> },
            ]
        }
    ];

    const studentLinks = [
        { href: '/student', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/student/transcript', label: 'Transcript', icon: <FileBarChart2 size={20} /> },
        { href: '/student/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    const isStudent = role === 'STUDENT';

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
                            {isStudent ? (
                                studentLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${pathname === link.href
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <span className="mr-3">{link.icon}</span>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                adminSections.map((section, idx) => (
                                    <div key={idx} className="mb-4">
                                        {section.title !== 'Overview' && (
                                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {section.title}
                                            </div>
                                        )}
                                        {section.items.map((link) => (
                                            <li key={link.href} className="mt-1">
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${pathname === link.href
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                        }`}
                                                >
                                                    <span className="mr-3">{link.icon}</span>
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </div>
                                ))
                            )}
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
