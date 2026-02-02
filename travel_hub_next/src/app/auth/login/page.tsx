"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, TreePine, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
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
            await login(formData);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Hero Image (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-indigo-600 to-purple-700 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200"
                        alt="Nature"
                        className="object-cover opacity-20"
                        fill
                        priority
                    />
                </div>
                <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
                    <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-90 transition-opacity">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                            <TreePine className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold">NatureStay</h1>
                    </Link>
                    <p className="text-2xl font-semibold mb-4 text-indigo-100">Welcome Back!</p>
                    <p className="text-lg text-indigo-200 max-w-md leading-relaxed">
                        Continue your journey to discover verified homestays and authentic local adventures in nature&apos;s lap.
                    </p>
                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                            </div>
                            <span className="text-indigo-100">Verified Properties</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                            </div>
                            <span className="text-indigo-100">Secure Bookings</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                            </div>
                            <span className="text-indigo-100">24/7 Support</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link href="/" className="lg:hidden flex items-center gap-2 justify-center mb-8 hover:opacity-80 transition-opacity">
                        <div className="bg-primary p-2 rounded-lg">
                            <TreePine className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">NatureStay</span>
                    </Link>

                    <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-100">
                        <div className="mb-8">
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Sign In</h2>
                            <p className="text-slate-500">Enter your credentials to continue</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 pr-12"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.location.href = 'http://localhost:3000/api/v1/auth/google'}
                            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 py-3.5 rounded-xl font-semibold transition-all hover:border-slate-300"
                        >
                            <div className="relative h-5 w-5">
                                <Image
                                    src="https://www.google.com/favicon.ico"
                                    alt="Google"
                                    fill
                                />
                            </div>
                            Continue with Google
                        </button>

                        <div className="mt-8 text-center text-sm text-slate-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/signup" className="text-primary font-bold hover:text-primary-hover transition-colors">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
