import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function requireAdmin() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required');
    }
    return session;
}

export interface SessionPayload {
    userId: string;
    username: string;
    role: string;
    name: string;
    [key: string]: any;
}

export async function createSession(payload: SessionPayload) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);

    (await cookies()).set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as SessionPayload;
    } catch (error) {
        return null;
    }
}

export async function deleteSession() {
    (await cookies()).delete('session');
}
