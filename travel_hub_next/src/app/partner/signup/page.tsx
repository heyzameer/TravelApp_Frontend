"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import styles from '../../auth/auth.module.css';

export default function PartnerSignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: ''
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
            const response = await authService.partnerRegister(formData);
            if (response.data.success && response.data.data) {
                // Save tokens
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);

                // Redirect to verify page
                // Assuming generic verify page works for partner too
                router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&type=email_verification&role=partner`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Partner registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Become a Partner</h1>

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
                            placeholder="Business or Host Name"
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
                            placeholder="partner@example.com"
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
                            placeholder="Strong password"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phone" className={styles.label}>Phone</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            className="input"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1234567890"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register as Partner'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Already a partner?
                    <Link href="/partner/login" className={styles.link}>Login here</Link>
                </div>
            </div>
        </div>
    );
}
