import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchAllUsers, updateUser, deleteUser } from '../../../../store/slices/usersSlice';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import { type User } from '../../../../types';

const UsersList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { users, isLoading, error } = useAppSelector((state) => state.users);
    const [searchTerm, setSearchTerm] = useState('');

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        dispatch(fetchAllUsers({ page: 1, limit: 100, role: 'customer' }));
    }, [dispatch]);

    const handleStatusToggle = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        try {
            await dispatch(updateUser({ userId: id, userData: { isActive: newStatus } })).unwrap();
            toast.success(newStatus ? 'User activated' : 'User deactivated');
        } catch {
            toast.error('Failed to update user status');
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone and will permanently remove the user account.',
            onConfirm: async () => {
                try {
                    await dispatch(deleteUser(id)).unwrap();
                    toast.success('User deleted successfully');
                } catch {
                    toast.error('Failed to delete user');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleViewUser = (id: string) => {
        navigate(`/admin/users/${id}`);
    };

    const filteredUsers = (users as User[]).filter((user) =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log("users", users);
    const totalBookings = users.reduce((sum: number, user) => sum + (user.totalOrders || 0), 0);
    const totalRevenue = users.reduce((sum: number, user) => sum + (user.totalAmount || 0), 0);
    const activeUsers = users.filter((u) => u.isActive).length;

    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="bg-gray-200 rounded-2xl p-4 w-16 h-16"></div>
            </div>
        </div>
    );

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
            <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
            </td>
            <td className="py-4 px-6">
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
            </td>
            <td className="py-4 px-6"><div className="h-6 bg-gray-200 rounded-full w-12"></div></td>
            <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
            <td className="py-4 px-6"><div className="h-7 bg-gray-200 rounded-full w-14"></div></td>
            <td className="py-4 px-6">
                <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                </div>
            </td>
        </tr>
    );

    if (isLoading) {
        return (
            <div>
                <div className="mb-8 animate-pulse">
                    <div className="h-10 bg-gray-300 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200 animate-pulse">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </div>
                            <div className="h-12 bg-gray-200 rounded-xl w-80"></div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                                <tr>
                                    <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-8"></div></th>
                                    <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-20"></div></th>
                                    <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-16"></div></th>
                                    <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-16"></div></th>
                                    <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-12"></div></th>
                                    <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-16"></div></th>
                                    <th className="py-4 px-6 text-left"><div className="h-3 bg-gray-300 rounded w-16"></div></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 max-w-md w-full text-center">
                    <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Guests</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => dispatch(fetchAllUsers({ page: 1, limit: 100, role: 'customer' }))}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Guest Management
                </h1>
                <p className="text-gray-600">Manage and monitor your guests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Total Guests</p>
                            <p className="text-3xl font-bold text-gray-800">{users.length}</p>
                            <p className="text-green-600 text-sm mt-1 font-semibold">{activeUsers} Active</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4">
                            <Users className="text-white" size={28} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Total Bookings</p>
                            <p className="text-3xl font-bold text-gray-800">{totalBookings || 0}</p>
                            <p className="text-blue-600 text-sm mt-1 font-semibold">All time</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4">
                            <TrendingUp className="text-white" size={28} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-800">₹{totalRevenue.toFixed(2) || 0}</p>
                            <p className="text-emerald-600 text-sm mt-1 font-semibold">Lifetime value</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4">
                            <DollarSign className="text-white" size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header with Search */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Guest Directory</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {filteredUsers.length} {filteredUsers.length === 1 ? 'guest' : 'guests'} found
                            </p>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search guests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="py-3 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 w-full md:w-80 transition-all"
                            />
                            <Search size={20} className="absolute top-3.5 left-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                            <tr>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Guest</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Bookings</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Spent</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(filteredUsers as User[]).map((user, index) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer"
                                    onClick={() => handleViewUser(user.id)}
                                >
                                    <td className="py-4 px-6">
                                        <span className="text-gray-600 font-medium">{index + 1}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 flex-shrink-0 border-2 border-white shadow-md">
                                                    <img
                                                        src={user.profilePicture || '/profile3.png'}
                                                        alt={user.fullName}
                                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/profile3.png'; }}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{user.fullName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-800">{user.email}</p>
                                            <p className="text-sm text-gray-500">{user.phone}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                                            {user.totalOrders || 0}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-emerald-600 font-bold">₹{user.totalAmount?.toFixed(2) || 0}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <label
                                            onClick={(e) => e.stopPropagation()}
                                            className="relative inline-flex items-center cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={user.isActive}
                                                onChange={() => handleStatusToggle(user.id, user.isActive)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="sr-only peer"
                                            />
                                            <div className={`w-14 h-7 rounded-full transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:to-green-500 bg-gradient-to-r from-gray-300 to-gray-400 shadow-inner`}>
                                                <div className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${user.isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                                            </div>
                                        </label>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="inline-flex items-center px-3 py-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(user.id);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No guests found</p>
                    </div>
                )}
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                variant="danger"
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default UsersList;
