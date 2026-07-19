import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth/session';

export async function middleware(request: NextRequest) {
    const session = await getSession();
    const { pathname } = request.nextUrl;

    // Public routes
    if (pathname === '/' || pathname === '/login') {
        if (session) {
            // Redirect logged-in users to their dashboard
            const redirectUrl = session.role === 'ADMIN' ? '/admin' : '/student';
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.next();
    }

    // Protected routes
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based access control
    if (pathname.startsWith('/admin') && session.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/student', request.url));
    }

    // Allow ADMIN to access student routes, but block STUDENT from accessing admin routes
    // if (pathname.startsWith('/student') && session.role !== 'STUDENT') {
    //     return NextResponse.redirect(new URL('/admin', request.url));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)'],
};
