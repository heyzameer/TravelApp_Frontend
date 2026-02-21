
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mail, Phone, Shield, ShieldCheck,
    Calendar, User as UserIcon,
    Trash2, Edit2, CheckCircle, XCircle,
    Clock, Tag
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchUserById, updateUser, deleteUser } from '../../../../store/slices/usersSlice';
import { toast } from 'react-hot-toast';

import ConfirmDialogManager from '../../../../utils/confirmDialog';
import ComposeEmailModal from './ComposeEmailModal';
import { adminService } from '../../../../services/admin';

const UserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedUser, isLoading, error } = useAppSelector((state) => state.users);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (id && id !== 'undefined') {
            dispatch(fetchUserById(id));
        }
    }, [dispatch, id]);

    const handleToggleStatus = async () => {
        if (!selectedUser || !id) return;
        setIsActionLoading(true);
        try {
            await dispatch(updateUser({
                userId: id,
                userData: { isActive: !selectedUser.isActive }
            })).unwrap();
            toast.success(selectedUser.isActive ? 'User deactivated' : 'User activated');
        } catch (err: unknown) {
            toast.error((typeof err === 'string' ? err : '') || 'Failed to update status');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        const confirmed = await ConfirmDialogManager.getInstance().confirm(
            'Are you sure you want to delete this user? This action cannot be undone and will permanently remove all their associated data.',
            {
                title: 'Delete User',
                confirmText: 'Delete',
                type: 'delete'
            }
        );

        if (confirmed) {
            setIsActionLoading(true);
            try {
                await dispatch(deleteUser(id)).unwrap();
                toast.success('User deleted successfully');
                navigate('/admin/users');
            } catch (err: unknown) {
                toast.error((typeof err === 'string' ? err : '') || 'Failed to delete user');
            } finally {
                setIsActionLoading(false);
            }
        }
    };

    const handleSendEmail = async (formData: FormData) => {
        try {
            await adminService.sendGuestEmail(formData);
        } catch (error: unknown) {
            console.error('Error sending email:', error);
            throw error;
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { bookings = [] } = (selectedUser || {}) as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredBookings = bookings.filter((booking: any) => {
        let matchesDate = true;
        let matchesStatus = true;

        if (dateFilter) {
            // To be comprehensive, checking the 'booked' date rather than check in/out.
            matchesDate = new Date(booking.createdAt).toISOString().split('T')[0] === dateFilter;
        }

        if (statusFilter) {
            matchesStatus = booking.status.toLowerCase() === statusFilter.toLowerCase();
        }

        return matchesDate && matchesStatus;
    });

    if (isLoading && !selectedUser) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !selectedUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <div className="bg-red-50 p-6 rounded-2xl text-center max-w-md">
                    <p className="text-red-600 text-lg font-bold mb-4">Error loading guest details</p>
                    <p className="text-red-500 text-sm mb-6">{error || 'User not found'}</p>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-red-200 hover:bg-red-50 rounded-xl text-red-600 font-bold transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                        Back to Directory
                    </button>
                </div>
            </div>
        );
    }


    const {
        fullName,
        email,
        phone,
        role,
        isActive,
        isEmailVerified,
        profilePicture,
        createdAt,
        lastLogin,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = selectedUser as any; // Using any for extended fields from backend

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Guests
                </button>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/profile3.png'; }}
                                    />
                                ) : (
                                    <UserIcon size={40} className="text-blue-400" />
                                )}
                            </div>
                            <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg border-2 border-white ${isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                {isActive ? 'Active' : 'Inactive'}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{fullName}</h1>
                                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                                    {role}
                                </span>
                                {isEmailVerified && (
                                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-emerald-100">
                                        <ShieldCheck size={12} />
                                        VERIFIED
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Mail size={16} className="text-gray-400" />
                                    {email}
                                </span>
                                {phone && (
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Phone size={16} className="text-gray-400" />
                                        {phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleToggleStatus}
                            disabled={isActionLoading}
                            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm border ${isActive
                                ? 'bg-white text-orange-600 border-orange-100 hover:bg-orange-50'
                                : 'bg-white text-green-600 border-green-100 hover:bg-green-50'
                                }`}
                        >
                            {isActive ? 'Deactivate Account' : 'Activate Account'}
                        </button>
                        <button
                            onClick={() => navigate(`/admin/users/${id}/edit`)}
                            className="bg-white text-blue-600 border border-blue-100 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-all shadow-sm"
                        >
                            <Edit2 size={18} />
                            Edit Profile
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isActionLoading}
                            className="bg-white text-red-600 border border-red-100 px-4 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-all shadow-sm"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Booking History */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">Recent Bookings</h3>
                            {/* <button className="text-blue-600 font-bold text-sm hover:underline">View All</button> */}
                        </div>

                        {/* Filters placeholder, simplified for now since we usually paginate or have a generic datatable */}
                        <div className="px-8 py-4 bg-gray-50 flex gap-4 border-b border-gray-100">
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                title="Filter by date booked"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="py-4 px-8 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property</th>
                                        <th className="py-4 px-8 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="py-4 px-8 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                        <th className="py-4 px-8 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {filteredBookings.length > 0 ? filteredBookings.map((booking: any) => (
                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-8">
                                                <p className="font-bold text-gray-900">{booking.propertyId?.propertyName || 'Property Name'}</p>
                                                <p className="text-[10px] text-gray-400 font-mono italic">#{booking.bookingId}</p>
                                            </td>
                                            <td className="py-4 px-8 text-sm text-gray-600 font-medium whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span>{new Date(booking.checkInDate).toLocaleDateString()} -</span>
                                                    <span>{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-8">
                                                <p className="font-bold text-gray-900">₹{booking.finalPrice}</p>
                                            </td>
                                            <td className="py-4 px-8">
                                                <BookingStatusBadge status={booking.status} />
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center">
                                                <p className="text-gray-400 font-medium">No bookings found for this user</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Account Details */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Account Overview</h3>
                        <div className="space-y-6">
                            <DetailItem
                                icon={<Calendar size={20} className="text-blue-500" />}
                                label="Member Since"
                                value={new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            />
                            <DetailItem
                                icon={<Clock size={20} className="text-purple-500" />}
                                label="Last Activity"
                                value={lastLogin ? new Date(lastLogin).toLocaleString() : 'Never'}
                            />
                            <DetailItem
                                icon={<Shield size={20} className="text-emerald-500" />}
                                label="Security Level"
                                value={isEmailVerified ? 'High (Verified)' : 'Standard'}
                            />
                        </div>
                    </div>

                    {/* Quick Actions / Engagement */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 shadow-xl text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Contact Guest</h3>
                        </div>
                        <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
                            Need to discuss a booking or account issue? Send an official email to this guest.
                        </p>
                        <button
                            onClick={() => setIsEmailModalOpen(true)}
                            className="w-full py-4 bg-white text-indigo-600 font-extrabold rounded-2xl shadow-lg border-2 border-transparent hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            COMPOSE EMAIL
                        </button>
                    </div>

                    {/* Support Ticket Integration (Placeholder/Future) */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm border-dashed">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Tag size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Support History</span>
                        </div>
                        <p className="text-sm text-gray-400 italic">No active support tickets for this guest.</p>
                    </div>
                </div>
            </div>

            <ComposeEmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                recipientEmail={email}
                recipientName={fullName}
                onSend={handleSendEmail}
            />
        </div>
    );
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-2xl">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const BookingStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let styles = "bg-gray-100 text-gray-600";
    let Icon = Clock;

    switch (status.toLowerCase()) {
        case 'confirmed':
            styles = "bg-green-50 text-green-700 border border-green-100";
            Icon = CheckCircle;
            break;
        case 'pending':
            styles = "bg-yellow-50 text-yellow-700 border border-yellow-100";
            Icon = Clock;
            break;
        case 'completed':
            styles = "bg-blue-50 text-blue-700 border border-blue-100";
            Icon = CheckCircle;
            break;
        case 'cancelled':
            styles = "bg-red-50 text-red-700 border border-red-100";
            Icon = XCircle;
            break;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${styles}`}>
            <Icon size={12} />
            {status}
        </span>
    );
};

export default UserDetail;
