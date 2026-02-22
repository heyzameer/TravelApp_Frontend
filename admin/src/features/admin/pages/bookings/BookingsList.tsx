import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchAllBookings, deleteBooking } from '../../../../store/slices/bookingsSlice';
import { Search, Eye, Trash2, Calendar, CheckCircle, Clock, XCircle, AlertCircle, FileText, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

import ConfirmDialogManager from '../../../../utils/confirmDialog';

const BookingsList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { bookings, isLoading, error } = useAppSelector((state) => state.bookings);
    const { status: routeStatus } = useParams<{ status: string }>();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(routeStatus || 'all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (routeStatus) {
            setStatusFilter(routeStatus);
        } else {
            setStatusFilter('all');
        }
    }, [routeStatus]);

    useEffect(() => {
        dispatch(fetchAllBookings());
    }, [dispatch]);

    // Handle view details
    const handleViewBooking = (id: string) => {
        navigate(`/admin/bookings/detail/${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await ConfirmDialogManager.getInstance().confirm(
            'Are you sure you want to delete this booking? This action cannot be undone.',
            {
                title: 'Delete Booking',
                confirmText: 'Delete',
                type: 'delete'
            }
        );

        if (confirmed) {
            try {
                await dispatch(deleteBooking(id)).unwrap();
                toast.success('Booking deleted successfully');
            } catch {
                toast.error('Failed to delete booking');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'completed': return 'text-blue-600 bg-blue-100';
            case 'checked_in': return 'text-indigo-600 bg-indigo-100';
            case 'checked_out': return 'text-orange-600 bg-orange-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return <CheckCircle size={16} />;
            case 'pending': return <Clock size={16} />;
            case 'completed': return <CheckCircle size={16} />;
            case 'checked_in': return <CheckCircle size={16} />;
            case 'checked_out': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.propertyId as Record<string, string> | undefined)?.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.userId as Record<string, string> | undefined)?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();

        const bookingDate = new Date(booking.checkInDate || booking.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Reset hours for accurate date comparison
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        bookingDate.setHours(0, 0, 0, 0);

        const matchesDate = (!start || bookingDate >= start) && (!end || bookingDate <= end);

        return matchesSearch && matchesStatus && matchesDate;
    });

    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
    const completedCount = bookings.filter(b => b.status === 'completed').length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Bookings</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => dispatch(fetchAllBookings())}
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
                    Bookings
                </h1>
                <p className="text-gray-600">Manage property reservations</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
                            <p className="text-3xl font-bold text-gray-800">{pendingCount}</p>
                            <p className="text-yellow-600 text-sm mt-1 font-semibold">Awaiting confirmation</p>
                        </div>
                        <div className="bg-yellow-50 rounded-2xl p-4">
                            <Clock className="text-yellow-600" size={28} />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Confirmed</p>
                            <p className="text-3xl font-bold text-gray-800">{confirmedCount}</p>
                            <p className="text-green-600 text-sm mt-1 font-semibold">Upcoming stays</p>
                        </div>
                        <div className="bg-green-50 rounded-2xl p-4">
                            <CheckCircle className="text-green-600" size={28} />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                            <p className="text-3xl font-bold text-gray-800">{completedCount}</p>
                            <p className="text-blue-600 text-sm mt-1 font-semibold">Past bookings</p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-4">
                            <FileText className="text-blue-600" size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 w-full md:w-auto bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                            <Filter size={18} className="text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-sm text-gray-700 outline-none w-full md:w-auto"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="checked_in">Checked In</option>
                                <option value="checked_out">Checked Out</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex items-center gap-2 w-full md:w-auto">
                                <span className="text-xs text-gray-400 font-bold uppercase">From</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent text-sm text-gray-700 outline-none w-full"
                                />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm flex items-center gap-2 w-full md:w-auto">
                                <span className="text-xs text-gray-400 font-bold uppercase">To</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent text-sm text-gray-700 outline-none w-full"
                                />
                            </div>
                        </div>

                        {(statusFilter !== 'all' || startDate || endDate || searchTerm) && (
                            <button
                                onClick={() => {
                                    setStatusFilter('all');
                                    setStartDate('');
                                    setEndDate('');
                                    setSearchTerm('');
                                    navigate('/admin/bookings');
                                }}
                                className="text-sm text-red-500 font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search booking ID, property..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="py-2 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 w-full md:w-64 transition-all"
                        />
                        <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                        <tr>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Booking ID</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Check-in / Out</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredBookings.map((booking) => (
                            <tr
                                key={booking._id || booking.id}
                                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer"
                                onClick={() => handleViewBooking(booking._id || booking.id)}
                            >
                                <td className="py-4 px-6">
                                    <span className="font-mono text-sm text-gray-600">#{(booking.id || booking._id || '').slice(-6).toUpperCase()}</span>
                                </td>
                                <td className="py-4 px-6">
                                    <p className="font-semibold text-gray-800">{booking.propertyId?.propertyName || 'N/A'}</p>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex flex-col text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            <span>{new Date(booking.checkInDate || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                        {/* Check-out logic logic later */}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="font-bold text-gray-800">₹{booking.finalPrice?.toLocaleString() || 0}</span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                        {getStatusIcon(booking.status)}
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewBooking(booking._id || booking.id);
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(booking._id || booking.id);
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
                {filteredBookings.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No bookings found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingsList;
