'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/auth/session';

export async function login(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    console.log('Login attempt:', { username, passwordLength: password?.length });

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    let redirectPath = null;

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                student: true,
            },
        });

        console.log('User found:', user ? user.username : 'null');

        if (!user) {
            return { error: 'Invalid username or password' };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', passwordMatch);

        if (!passwordMatch) {
            return { error: 'Invalid username or password' };
        }

        await createSession({
            userId: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
        });

        // Determine redirect path
        redirectPath = user.role === 'ADMIN' ? '/admin' : '/student';

    } catch (error: any) {
        console.error('Login error:', error);
        return { error: `An error occurred during login: ${error.message || String(error)}` };
    }

    // Redirect outside try-catch
    if (redirectPath) {
        redirect(redirectPath);
    }
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}
