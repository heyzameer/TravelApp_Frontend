"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import styles from '../auth.module.css';
import Image from 'next/image';

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '' // Optional logic if you want to add phone, JSON example has it
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authService.register(formData);
            if (response.data.success && response.data.data) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                // Redirect to verify page with email
                router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&type=email_verification`);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Create an Account</h1>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="fullName" className={styles.label}>Full Name</label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            className="input"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phone" className={styles.label}>Phone (Optional)</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            className="input"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1234567890"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <div className={styles.divider}>Or continue with</div>

                <button
                    type="button"
                    className={styles.googleBtn}
                    onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/google`}
                >
                    <div className="relative w-5 h-5">
                        <Image
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            fill
                        />
                    </div>
                    Continue with Google
                </button>

                <div className={styles.footer}>
                    Already have an account?
                    <Link href="/auth/login" className={styles.link}>Log in</Link>
                </div>
            </div>
        </div>
    );
}
