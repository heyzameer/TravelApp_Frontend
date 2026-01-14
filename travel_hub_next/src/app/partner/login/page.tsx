"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/api';
import styles from '../../auth/auth.module.css';

export default function PartnerLoginPage() {
    const router = useRouter();
    const { partnerLogin } = useAuth();

    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0);
    const canResend = timeLeft === 0;

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const handleRequestOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await authService.partnerRequestLoginOtp(email);
            if (response.data.success) {
                setMessage('OTP sent successfully to your email.');
                setStep(2);
                setTimeLeft(30); // Start 30s timer
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await partnerLogin(email, otp);
            // Redirect handled in context (to /)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Partner Login</h1>

                {error && <div className={styles.error}>{error}</div>}
                {message && <div style={{ marginBottom: '1rem', color: 'green', textAlign: 'center' }}>{message}</div>}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>Email Address</label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="partner@example.com"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius)', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                                {email} <button type="button" onClick={() => setStep(1)} style={{ color: 'var(--primary)', float: 'right', fontSize: '0.875rem' }}>Change</button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="otp" className={styles.label}>Enter OTP</label>
                            <input
                                id="otp"
                                type="text"
                                required
                                className="input"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter verification code"
                                style={{ textAlign: 'center', letterSpacing: '0.25rem', fontSize: '1.25rem' }}
                            />
                        </div>

                        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)' }}>
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={() => handleRequestOtp()}
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
                            {isLoading ? 'Verifying...' : 'Login'}
                        </button>
                    </form>
                )}

                <div className={styles.footer}>
                    Want to become a partner?
                    <Link href="/partner/signup" className={styles.link}>Register here</Link>
                </div>
            </div>
        </div>
    );
}
