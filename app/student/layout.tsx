import { ReactNode } from 'react';
import { getSession } from '@/lib/auth/session';
import { Sidebar } from '../components/Sidebar';
import { redirect } from 'next/navigation';

export default async function StudentLayout({ children }: { children: ReactNode }) {
    const session = await getSession();

    if (!session || (session.role !== 'STUDENT' && session.role !== 'ADMIN')) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar userName={session.name} role={session.role} />
            <main className="md:ml-64 p-6 sm:px-6 lg:px-8 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
