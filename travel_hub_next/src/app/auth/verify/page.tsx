"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/api';
import styles from '../auth.module.css';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const type = searchParams.get('type') || 'email_verification';
    const role = searchParams.get('role');

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(30); // Start with 30s initially on load? Or assume it was just sent. Usually assume just sent.
    const canResend = timeLeft === 0;

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const handleResend = async () => {
        if (!email) return;
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            let response;
            if (role === 'partner') {
                response = await authService.partnerRequestLoginOtp(email);
            } else {
                // Pass type (e.g., 'email_verification') and email to match resendOTPSchema
                response = await authService.resendUserOtp({ email, type });
            }

            if (response.data.success) {
                setSuccess('OTP resent successfully.');
                setTimeLeft(30);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            let response;
            if (role === 'partner' && email) {
                response = await authService.partnerVerifyLoginOtp(email, code);
            } else {
                response = await authService.verifyOtp({ code, type });
            }

            if (response.data.success) {
                setSuccess('Verification successful! Redirecting...');
                if (response.data.data && response.data.data.accessToken) {
                    localStorage.setItem('accessToken', response.data.data.accessToken);
                    localStorage.setItem('refreshToken', response.data.data.refreshToken);
                }

                setTimeout(() => {
                    router.push(role === 'partner' ? '/' : '/auth/login');
                }, 2000);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Verification failed. Invalid code.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Check your email</h1>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--muted)' }}>
                    We&apos;ve sent a verification code {email ? `to ${email}` : ''}.
                </p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.error} style={{ backgroundColor: '#dcfce7', color: '#166534' }}>{success}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="code" className={styles.label}>Verification Code</label>
                        <input
                            id="code"
                            name="code"
                            type="text"
                            required
                            className="input"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            style={{ textAlign: 'center', letterSpacing: '0.25rem', fontSize: '1.25rem' }}
                        />
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResend}
                                className={styles.link}
                                disabled={isLoading}
                            >
                                Resend OTP
                            </button>
                        ) : (
                            <span>Resend OTP in {timeLeft}s</span>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Back to
                    <Link href="/auth/signup" className={styles.link}>Sign up</Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
