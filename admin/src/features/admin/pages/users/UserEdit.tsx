
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchUserById, updateUser } from '../../../../store/slices/usersSlice';
import { toast } from 'react-hot-toast';

const UserEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedUser, isLoading, error } = useAppSelector((state) => state.users);

    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        isActive: true
    });

    useEffect(() => {
        if (id) {
            dispatch(fetchUserById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedUser) {
            setFormData({
                fullName: selectedUser.fullName || '',
                email: selectedUser.email || '',
                phone: selectedUser.phone || '',
                isActive: selectedUser.isActive ?? true
            });
        }
    }, [selectedUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setIsSaving(true);
        try {
            await dispatch(updateUser({ userId: id, userData: formData })).unwrap();
            toast.success('User updated successfully');
            navigate(`/admin/users/${id}`);
        } catch (err: unknown) {
            toast.error(typeof err === 'string' ? err : 'Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && !selectedUser) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (error && !selectedUser) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
                <p className="font-bold">Error: {error}</p>
                <button onClick={() => navigate('/admin/users')} className="mt-4 text-sm underline">Back to Directory</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 px-4">
            <div className="mb-8">
                <button
                    onClick={() => navigate(`/admin/users/${id}`)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Profile
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Edit Guest Profile</h1>
                <p className="text-gray-500 mt-1">Update personal information and account status</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <UserIcon size={14} /> Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                                placeholder="Enter guest's full name"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail size={14} /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                                placeholder="guest@example.com"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={14} /> Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-5 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                                placeholder="+91 00000 00000"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                Account Status
                            </label>
                            <div className="flex items-center gap-4 py-3">
                                <label className="relative inline-flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:to-green-500 bg-gray-200">
                                        <div className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${formData.isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="ml-3 text-sm font-semibold text-gray-700">
                                        {formData.isActive ? 'Active' : 'Deactivated'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex border-t border-gray-50 pt-8">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/users/${id}`)}
                            className="ml-4 px-8 py-4 text-gray-500 font-bold hover:text-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserEdit;
