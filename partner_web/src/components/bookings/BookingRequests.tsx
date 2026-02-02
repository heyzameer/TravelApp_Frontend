import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchPartnerBookings, approveBooking, rejectBooking, setFilters } from '../../store/slices/bookingsSlice';
import { format } from 'date-fns';
import { Eye, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingRequests: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { bookings, loading, filters } = useSelector((state: RootState) => state.bookings);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        // Initial fetch
        dispatch(fetchPartnerBookings(undefined));
    }, [dispatch]);

    // Handle filtering
    useEffect(() => {
        let status = '';
        let approvalStatus = '';

        switch (activeTab) {
            case 'pending':
                status = 'payment_completed';
                approvalStatus = 'pending';
                break;
            case 'upcoming':
                status = 'confirmed';
                break;
            case 'completed':
                status = 'checked_out';
                break;
            case 'cancelled':
                status = 'cancelled';
                break;
            case 'rejected':
                approvalStatus = 'rejected';
                break;
            default:
                break;
        }

        dispatch(setFilters({ status, approvalStatus }));
        // In a real app, we might debounce this or trigger fetch explicitly
        // For now, we filter client side or re-fetch depending on API design.
        // Given the API supports filters, let's re-fetch or just filter locally if the list is small.
        // The thunk fetchPartnerBookings takes args. Let's re-fetch.
        dispatch(fetchPartnerBookings(status || approvalStatus ? { status, approvalStatus } : undefined));

    }, [activeTab, dispatch]);

    const handleApprove = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to approve this booking?')) {
            await dispatch(approveBooking(id));
            // Refresh list
            dispatch(fetchPartnerBookings({ status: filters.status, approvalStatus: filters.approvalStatus }));
        }
    };

    const handleReject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const reason = window.prompt('Please enter a reason for rejection:');
        if (reason) {
            await dispatch(rejectBooking({ bookingId: id, reason }));
            // Refresh list
            dispatch(fetchPartnerBookings({ status: filters.status, approvalStatus: filters.approvalStatus }));
        }
    };

    const getStatusColor = (status: string, approvalStatus: string) => {
        if (approvalStatus === 'pending') return 'text-yellow-600 bg-yellow-100';
        if (status === 'confirmed') return 'text-green-600 bg-green-100';
        if (status === 'cancelled' || approvalStatus === 'rejected') return 'text-red-600 bg-red-100';
        if (status === 'checked_out') return 'text-gray-600 bg-gray-100';
        return 'text-blue-600 bg-blue-100';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header & Tabs */}
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold mb-4">Booking Requests</h2>
                <div className="flex space-x-4 border-b overflow-x-auto">
                    {['all', 'pending', 'upcoming', 'completed', 'cancelled', 'rejected'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 px-1 capitalize whitespace-nowrap ${activeTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    Loading bookings...
                                </td>
                            </tr>
                        ) : bookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    No bookings found.
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr
                                    key={booking.bookingId}
                                    onClick={() => navigate(`/bookings/${booking.bookingId}`)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {booking.bookingId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {typeof booking.userId === 'object' ? booking.userId.fullName : 'Guest'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.totalGuests} Guests
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{format(new Date(booking.checkInDate), 'MMM d, yyyy')}</div>
                                        <div className="text-xs">to {booking.checkOutDate ? format(new Date(booking.checkOutDate), 'MMM d, yyyy') : '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{booking.finalPrice.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                booking.status,
                                                booking.partnerApprovalStatus
                                            )}`}
                                        >
                                            {booking.partnerApprovalStatus === 'pending'
                                                ? 'Pending Approval'
                                                : booking.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {booking.partnerApprovalStatus === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={(e) => handleApprove(booking.bookingId, e)}
                                                        className="p-1 text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded"
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleReject(booking.bookingId, e)}
                                                        className="p-1 text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded"
                                                        title="Reject"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/bookings/${booking.bookingId}`);
                                                }}
                                                className="p-1 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingRequests;
