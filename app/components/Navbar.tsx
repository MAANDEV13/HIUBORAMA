'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../actions/auth';

interface NavbarProps {
    userName: string;
    role: string;
}

export function Navbar({ userName, role }: NavbarProps) {
    const pathname = usePathname();

    const adminLinks = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/students', label: 'Students', icon: '👥' },
        { href: '/admin/courses', label: 'Courses', icon: '📚' },
        { href: '/admin/grades', label: 'Grades', icon: '📝' },
        { href: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
        { href: '/admin/batches', label: 'Batches', icon: '📅' },
        { href: '/admin/scheduling', label: 'Scheduling', icon: '🗓️' },
    ];

    const studentLinks = [
        { href: '/student', label: 'Dashboard', icon: '📊' },
        { href: '/student/transcript', label: 'Transcript', icon: '📄' },
    ];

    const links = role === 'ADMIN' ? adminLinks : studentLinks;

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <img src="/logo-circle.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">HIUBORAMA EXAMS</span>
                            </div>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === link.href
                                        ? 'bg-green-50 text-[var(--color-primary)]'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="mr-2">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{userName}</p>
                            <p className="text-xs text-gray-500">{role}</p>
                        </div>
                        <form action={logout}>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
    );
}
