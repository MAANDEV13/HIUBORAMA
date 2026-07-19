'use client';

import { useEffect, useRef } from 'react';
import { logout } from '../actions/auth';
import { useRouter } from 'next/navigation';

const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export function SessionManager() {
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const resetTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(async () => {
                // Session expired
                console.log('Session expired due to inactivity');
                await logout();
            }, TIMEOUT_MS);
        };

        // Events to monitor
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

        // Initial set
        resetTimer();

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, []);

    return null; // This component doesn't render anything
}
