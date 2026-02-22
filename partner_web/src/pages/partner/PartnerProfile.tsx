import React, { useEffect, useState } from "react";
import {
    User, Mail, Phone, Shield, AlertCircle, CheckCircle,
    Edit2, Save, X, Calendar, UserCheck,
    Briefcase, Verified, Layout
} from "lucide-react";
import { partnerAuthService } from "../../services/partnerAuth";
import type { PartnerProfile } from "../../types";
import { toast } from "react-hot-toast";

const PartnerProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<PartnerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        fullName: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        autoConfirmBookings: false
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await partnerAuthService.getPartnerProfile();
            setProfile(data);
            setEditData({
                fullName: data.fullName || "",
                phone: data.phone || "",
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "",
                gender: data.gender || "",
                autoConfirmBookings: !!data.autoConfirmBookings
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast.error("Could not load profile details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!editData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        } else if (editData.fullName.trim().length < 3) {
            newErrors.fullName = "Name must be at least 3 characters";
        }

        if (!editData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(editData.phone.trim())) {
            newErrors.phone = "Enter a valid 10-digit phone number";
        }

        if (!editData.dateOfBirth) {
            newErrors.dateOfBirth = "Date of birth is required";
        } else {
            const birthDate = new Date(editData.dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                newErrors.dateOfBirth = "You must be at least 18 years old";
            }
        }

        if (!editData.gender) {
            newErrors.gender = "Please select your gender";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        try {
            setSaving(true);
            await partnerAuthService.updatePartnerProfile(editData);
            toast.success("Profile updated successfully");
            setIsEditing(false);
            setErrors({});
            await fetchProfile();
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center p-8 text-gray-500">Failed to load profile.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700"></div>
                <div className="px-8 pb-10">
                    <div className="relative flex flex-col md:flex-row md:items-end gap-8 -mt-16">
                        <div className="h-40 w-40 rounded-[2.5rem] bg-white p-2 shadow-2xl relative overflow-hidden">
                            {profile.profilePicture ? (
                                <img
                                    src={profile.profilePicture}
                                    alt={profile.fullName}
                                    className="h-full w-full rounded-[2.2rem] object-cover border-4 border-white shadow-inner transition-transform duration-500"
                                />
                            ) : (
                                <div className="h-full w-full rounded-[2.2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-black border-4 border-white shadow-inner">
                                    {profile.fullName.charAt(0)}
                                </div>
                            )}
                            {profile.status === 'verified' && (
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-2xl border-4 border-white shadow-lg">
                                    <Shield size={20} fill="currentColor" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-2 pb-2">
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{profile.fullName}</h1>
                                {profile.status === 'verified' && (
                                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                                        <Verified size={14} />
                                        Verified Partner
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400">
                                <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100"><Briefcase size={16} className="text-blue-500" /> ID: {profile.partnerId}</span>
                                <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 capitalize"><UserCheck size={16} className="text-indigo-500" /> {profile.status} Member</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pb-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setErrors({});
                                        }}
                                        className="px-6 py-3 border-2 border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2"
                                    >
                                        <X size={18} /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
                                    >
                                        {saving ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-8 py-3 bg-white border-2 border-gray-100 text-gray-900 font-bold rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <Edit2 size={18} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Details Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-100/50 transition-colors duration-1000"></div>

                        <h3 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-4 relative z-10">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><User size={24} /></div>
                            Account Settings
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Identity Name</label>
                                {isEditing ? (
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            value={editData.fullName}
                                            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                            className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl transition-all font-bold outline-none text-gray-900 ${errors.fullName ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'}`}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.fullName && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.fullName}</p>}
                                    </div>
                                ) : (
                                    <div className="px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-bold text-gray-900 text-lg">{profile.fullName}</div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Verified Email</label>
                                <div className="px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-bold text-gray-400 cursor-not-allowed flex items-center gap-4 text-lg">
                                    <Mail size={20} className="text-gray-300" /> {profile.email}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Mobile Contact</label>
                                {isEditing ? (
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="tel"
                                                value={editData.phone}
                                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                                className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl transition-all font-bold outline-none text-gray-900 ${errors.phone ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'}`}
                                                placeholder="Your phone number"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.phone}</p>}
                                    </div>
                                ) : (
                                    <div className="px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-bold text-gray-900 flex items-center gap-4 text-lg">
                                        <Phone size={20} className="text-blue-500" /> {profile.phone}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Birth Date</label>
                                {isEditing ? (
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="date"
                                                value={editData.dateOfBirth}
                                                onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                                                className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl transition-all font-bold outline-none text-gray-900 ${errors.dateOfBirth ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'}`}
                                            />
                                        </div>
                                        {errors.dateOfBirth && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.dateOfBirth}</p>}
                                    </div>
                                ) : (
                                    <div className="px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-bold text-gray-900 flex items-center gap-4 text-lg">
                                        <Calendar size={20} className="text-indigo-500" />
                                        {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-gray-300 italic">Not provided</span>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Gender Identity</label>
                                {isEditing ? (
                                    <div className="space-y-1">
                                        <select
                                            value={editData.gender}
                                            onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                            className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl transition-all font-bold outline-none appearance-none cursor-pointer text-gray-900 ${errors.gender ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'}`}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        {errors.gender && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{errors.gender}</p>}
                                    </div>
                                ) : (
                                    <div className="px-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100 font-bold text-gray-900 flex items-center gap-4 text-lg">
                                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                        <span className="capitalize">{profile.gender || "Not specified"}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Automation Settings Card */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-amber-100/50 transition-colors duration-1000"></div>

                        <h3 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-4 relative z-10">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-inner"><Verified size={24} /></div>
                            Automation & Management
                        </h3>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 group/item hover:border-amber-200 transition-colors">
                                <div
                                    className={`space-y-1 flex-1 ${isEditing ? 'cursor-pointer' : ''}`}
                                    onClick={() => isEditing && setEditData(prev => ({ ...prev, autoConfirmBookings: !prev.autoConfirmBookings }))}
                                >
                                    <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                        Auto Confirm Bookings
                                        {profile.autoConfirmBookings && !isEditing && <CheckCircle size={16} className="text-emerald-500" />}
                                    </h4>
                                    <p className="text-sm text-gray-400 font-bold max-w-md">Instantly approve incoming booking requests without manual review. Recommended for high-occupancy properties.</p>
                                </div>

                                {isEditing ? (
                                    <button
                                        type="button"
                                        onClick={() => setEditData(prev => ({ ...prev, autoConfirmBookings: !prev.autoConfirmBookings }))}
                                        className={`w-16 h-8 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-4 focus:ring-amber-100 ${editData.autoConfirmBookings ? 'bg-amber-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-500 ease-in-out shadow-md ${editData.autoConfirmBookings ? 'left-9' : 'left-1'}`}></div>
                                    </button>
                                ) : (
                                    <div className={`px-6 py-2 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${profile.autoConfirmBookings ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                        {profile.autoConfirmBookings ? 'ACTIVE' : 'INACTIVE'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats Column */}
                <div className="space-y-8">
                    {/* Business Snapshot Card */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl text-white relative overflow-hidden group h-full flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                        <div className="relative z-10">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-10 flex items-center gap-3">
                                <Layout size={16} /> Business Snapshot
                            </h4>

                            <div className="space-y-10">
                                <div className="group/stat">
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <p className="text-6xl font-black tracking-tighter text-blue-400 group-hover/stat:text-blue-300 transition-colors">
                                            {profile.totalOrders || 0}
                                        </p>
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Total Partner Bookings</p>
                                </div>

                                <div className="h-[1px] bg-white/5 w-full"></div>

                                <div className="group/stat">
                                    <div className="flex items-baseline gap-4 mb-2">
                                        <p className="text-6xl font-black tracking-tighter text-indigo-400 group-hover/stat:text-indigo-300 transition-colors">
                                            {profile.totalProperties || 0}
                                        </p>
                                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Active Property Listings</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-12 bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Verification Health</h5>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-300">Identity Docs</span>
                                    <div className={`flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest ${profile.personalDocuments?.aadharStatus === 'approved' ? 'text-emerald-400' : 'text-amber-400'
                                        }`}>
                                        {profile.personalDocuments?.aadharStatus === 'approved' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                        {profile.personalDocuments?.aadharStatus || 'NOT SUBMITTED'}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-300">Email Status</span>
                                    <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest text-emerald-400">
                                        <CheckCircle size={12} /> VERIFIED
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerProfilePage;
