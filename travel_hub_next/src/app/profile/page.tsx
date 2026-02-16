"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { authService } from '@/services/api';
import { UserCircle, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link'; // Added Link import
import { AxiosError } from 'axios'; // Added AxiosError import

export default function ProfilePage() {
    const { user, checkAuth } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: ''
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
                email: user.email || ''
            });
            if (user.profilePicture) {
                setImagePreview(user.profilePicture);
            }
        }
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                setMessage({ type: 'error', text: 'Please upload a valid image (JPEG, JPG, or PNG)' });
                return;
            }
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
                return;
            }
            setProfileImage(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setMessage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('phone', formData.phone);

            if (profileImage) {
                formDataToSend.append('profileImage', profileImage);
            }

            const response = await authService.updateProfile(formDataToSend);

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                // Refresh auth context to get updated user data
                await checkAuth();
                setProfileImage(null);
            }
        } catch (error) { // Changed error type to unknown implicitly, then cast to AxiosError
            const axiosError = error as AxiosError<{ message?: string }>;
            setMessage({
                type: 'error',
                text: axiosError.response?.data?.message || 'Failed to update profile. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 pt-24 pb-12">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">My Profile</h1>
                    <p className="text-slate-500 mb-8">Manage your account information</p>

                    {message && (
                        <div className={`mb - 6 p - 4 rounded - xl flex items - center gap - 3 ${message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            } `}>
                            {message.type === 'success' ? (
                                <CheckCircle className="h-5 w-5" />
                            ) : (
                                <AlertCircle className="h-5 w-5" />
                            )}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Picture Section */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Picture</h2>
                                <div className="flex flex-col items-center">
                                    <div className="relative group">
                                        {imagePreview ? (
                                            <div className="relative w-40 h-40">
                                                <Image
                                                    src={imagePreview}
                                                    alt="Profile"
                                                    className="rounded-full object-cover border-4 border-primary/20"
                                                    fill
                                                    sizes="160px"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-200">
                                                <UserCircle className="w-32 h-32 text-slate-400" />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-2 right-2 bg-primary hover:bg-primary-hover text-white p-3 rounded-full shadow-lg transition-all group-hover:scale-110"
                                        >
                                            <Camera className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <p className="text-xs text-slate-400 mt-4 text-center">
                                        Allowed: JPEG, JPG, PNG<br />
                                        Max size: 5MB
                                    </p>
                                </div>
                            </div>

                            {/* My Bookings Quick Access */}
                            <div className="mt-6 bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm">
                                <h3 className="text-lg font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                    Active Trips
                                </h3>
                                <p className="text-sm text-emerald-700 mb-4">View and manage your upcoming adventures and booking history.</p>
                                <Link
                                    href="/profile/bookings"
                                    className="block w-full text-center bg-white text-emerald-600 font-bold py-3 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-sm"
                                >
                                    Go to My Trips
                                </Link>
                            </div>
                        </div>

                        {/* Profile Details Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            id="fullName"
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Updating Profile...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
