"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function GoogleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { checkAuth } = useAuth();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
            console.log('Tokens received, saving to localStorage...');
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            console.log('Updating auth context...');
            // Update auth context state
            checkAuth().then(() => {
                console.log('Auth check complete, redirecting...');
                const redirect = localStorage.getItem('authRedirect');
                if (redirect) {
                    localStorage.removeItem('authRedirect');
                    router.push(redirect);
                } else {
                    router.push('/');
                }
            }).catch(err => {
                console.error('Auth verification failed:', err);
                router.push('/auth/login?error=verification_failed');
            });
        } else {
            console.error('Missing tokens in callback URL');
            router.push('/auth/login?error=oauth_failed');
        }
    }, [router, searchParams, checkAuth]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <h2>Authenticating with Google...</h2>
            <p>Please wait while we redirect you.</p>
        </div>
    );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GoogleCallbackContent />
        </Suspense>
    );
}
