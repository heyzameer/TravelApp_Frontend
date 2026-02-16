import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchPartnerBookings, approveBooking, rejectBooking, completeBooking, setFilters, checkInBooking, checkOutBooking } from '../../store/slices/bookingsSlice';
import { format, isSameDay } from 'date-fns';
import { Eye, Search, Calendar, XCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../common/ConfirmModal';
import PromptModal from '../common/PromptModal';
import { DataTable, type Column } from '../common/DataTable';
import type { Booking } from '../../types';

const BookingRequests: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { bookings, loading, filters } = useSelector((state: RootState) => state.bookings);
    const [activeTab, setActiveTab] = useState('all');

    interface ConfirmModalState {
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info';
    }

    interface PromptModalState {
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: (value: string) => void;
        initialValue?: string;
        placeholder?: string;
    }

    const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const [promptModalState, setPromptModalState] = useState<PromptModalState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    // Handle filtering
    useEffect(() => {
        let status = '';
        let approvalStatus = '';

        switch (activeTab) {
            case 'pending':
                status = 'payment_completed';
                approvalStatus = 'pending';
                break;
            case 'active':
                status = 'checked_in';
                break;
            case 'upcoming':
                status = 'confirmed';
                break;
            case 'completed':
                status = 'completed';
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

        const apiFilters = {
            status: status || undefined,
            approvalStatus: approvalStatus || undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            search: filters.search || undefined
        };

        dispatch(fetchPartnerBookings(apiFilters));

    }, [activeTab, dispatch, filters.startDate, filters.endDate, filters.search]);

    const handleFilterChange = (field: string, value: string) => {
        dispatch(setFilters({ [field]: value }));
    };

    const clearFilters = () => {
        dispatch(setFilters({
            startDate: '',
            endDate: '',
            search: ''
        }));
    };

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'refunds') {
            return b.refundStatus === 'requested';
        }
        if (activeTab === 'check-in') {
            return b.status === 'confirmed' && isSameDay(new Date(b.checkInDate), new Date());
        }
        if (activeTab === 'check-out') {
            return b.status === 'checked_in' && b.checkOutDate && isSameDay(new Date(b.checkOutDate), new Date());
        }
        return true;
    });

    const handleApprove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmModalState({
            isOpen: true,
            title: 'Approve Booking',
            message: 'Are you sure you want to approve this booking? This will confirm the reservation for the guest.',
            variant: 'info',
            onConfirm: async () => {
                await dispatch(approveBooking(id));
                setConfirmModalState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleReject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setPromptModalState({
            isOpen: true,
            title: 'Reject Booking',
            message: 'Please enter a reason for rejection. This will be sent to the guest.',
            placeholder: 'Reason for rejection...',
            onConfirm: async (reason) => {
                await dispatch(rejectBooking({ bookingId: id, reason }));
                setPromptModalState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleCheckIn = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Check-In',
            message: 'Has the guest arrived at the property? Mark as checked-in to start their stay.',
            variant: 'info',
            onConfirm: async () => {
                try {
                    await dispatch(checkInBooking(id)).unwrap();
                    toast.success('Guest checked-in');
                } catch (err: unknown) {
                    toast.error(typeof err === 'string' ? err : 'Failed to check-in');
                }
                setConfirmModalState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleCheckOut = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmModalState({
            isOpen: true,
            title: 'Confirm Check-Out',
            message: 'Is the guest leaving the property? Mark as checked-out to finalize their stay.',
            variant: 'warning',
            onConfirm: async () => {
                try {
                    await dispatch(checkOutBooking(id)).unwrap();
                    toast.success('Guest checked-out');
                } catch (err: unknown) {
                    toast.error(typeof err === 'string' ? err : 'Failed to check-out');
                }
                setConfirmModalState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleCompleteAction = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmModalState({
            isOpen: true,
            title: 'Complete Booking',
            message: 'Mark this booking as completed? This confirms all services were rendered.',
            variant: 'info',
            onConfirm: async () => {
                try {
                    await dispatch(completeBooking(id)).unwrap();
                    toast.success('Booking completed');
                } catch (err: unknown) {
                    toast.error(typeof err === 'string' ? err : 'Failed to complete booking');
                }
                setConfirmModalState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const getStatusColor = (status: string, approvalStatus: string, refundStatus?: string) => {
        if (refundStatus === 'requested') return 'text-orange-600 bg-orange-50 border-orange-100';
        if (refundStatus === 'processed') return 'text-purple-600 bg-purple-50 border-purple-100';
        if (approvalStatus === 'pending') return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        if (status === 'confirmed') return 'text-green-600 bg-green-50 border-green-100';
        if (status === 'checked_in') return 'text-blue-600 bg-blue-50 border-blue-100';
        if (status === 'cancelled' || approvalStatus === 'rejected') return 'text-red-600 bg-red-50 border-red-100';
        if (status === 'completed' || status === 'checked_out') return 'text-gray-600 bg-gray-50 border-gray-100';
        return 'text-blue-600 bg-blue-50 border-blue-100';
    };

    const columns: Column<Booking>[] = [
        {
            header: 'Booking ID',
            key: 'bookingId',
            render: (booking) => (
                <span className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:bg-slate-100/50 transition-colors">
                    #{booking.bookingId}
                </span>
            )
        },
        {
            header: 'Guest',
            key: 'userId',
            render: (booking) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200 uppercase">
                        {(booking.userId && typeof booking.userId === 'object' ? booking.userId.fullName : 'G')[0]}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-800">
                            {booking.userId && typeof booking.userId === 'object' ? booking.userId.fullName : 'Guest'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2 mt-1">
                            <User size={10} className="text-slate-300" />
                            {booking.totalGuests} Guests
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Stay Duration',
            key: 'checkInDate',
            render: (booking) => (
                <>
                    <div className="text-sm text-gray-700 font-bold flex items-center gap-2">
                        {format(new Date(booking.checkInDate), 'MMM d, yyyy')}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">
                        to {booking.checkOutDate ? format(new Date(booking.checkOutDate), 'MMM d, yyyy') : '-'}
                    </div>
                </>
            )
        },
        {
            header: 'Pricing',
            key: 'finalPrice',
            render: (booking) => (
                <>
                    <div className="text-sm font-bold text-slate-900">
                        ₹{booking.finalPrice.toLocaleString()}
                    </div>
                    <div className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-md inline-block ${booking.paymentStatus === 'completed' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                        {booking.paymentStatus === 'completed' ? 'Paid' : booking.paymentStatus}
                    </div>
                </>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (booking) => (
                <span
                    className={`px-3 py-1.5 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-xl border ${getStatusColor(
                        booking.status,
                        booking.partnerApprovalStatus,
                        booking.refundStatus
                    )}`}
                >
                    {booking.refundStatus === 'requested'
                        ? 'Refund Requested'
                        : booking.partnerApprovalStatus === 'pending'
                            ? 'Pending Approval'
                            : booking.status.replace('_', ' ')}
                </span>
            )
        },
        {
            header: 'Actions',
            key: 'actions',
            headerClassName: 'text-right',
            className: 'text-right',
            render: (booking) => (
                <div className="flex justify-end items-center gap-2">
                    {booking.partnerApprovalStatus === 'pending' && booking.status !== 'cancelled' ? (
                        <>
                            <button
                                onClick={(e) => handleApprove(booking.bookingId, e)}
                                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-black transition-all font-bold text-[10px] uppercase tracking-wider"
                            >
                                Approve
                            </button>
                            <button
                                onClick={(e) => handleReject(booking.bookingId, e)}
                                className="px-3 py-1.5 bg-white text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all font-bold text-[10px] uppercase tracking-wider"
                            >
                                Reject
                            </button>
                        </>
                    ) : (
                        <>
                            {booking.status === 'confirmed' && (
                                <button
                                    onClick={(e) => handleCheckIn(booking.bookingId, e)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-xs shadow-md shadow-blue-100 active:scale-95"
                                >
                                    Check-In
                                </button>
                            )}
                            {booking.status === 'checked_in' && (
                                <button
                                    onClick={(e) => handleCheckOut(booking.bookingId, e)}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-bold text-xs shadow-md shadow-orange-100 active:scale-95"
                                >
                                    Check-Out
                                </button>
                            )}
                            {booking.status === 'checked_out' && (
                                <button
                                    onClick={(e) => handleCompleteAction(booking.bookingId, e)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-xs active:scale-95"
                                >
                                    Finalize
                                </button>
                            )}
                        </>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/partner/bookings/${booking.bookingId}`);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            )
        }
    ];

    const tabs = [
        { id: 'all', label: 'All Bookings' },
        { id: 'pending', label: 'Pending' },
        { id: 'upcoming', label: 'Confirmed' },
        { id: 'active', label: 'Active' },
        { id: 'check-in', label: 'Check-In' },
        { id: 'check-out', label: 'Check-Out' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'refunds', label: 'Refunds' }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-[1600px] mx-auto p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-lg">
                                <Calendar className="text-white h-5 w-5" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Booking Management</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <div className="relative w-full sm:w-64 lg:w-80">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search guest or ID..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white focus:border-transparent outline-none transition-all text-sm"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl p-2 sm:p-1 shadow-sm">
                                <input
                                    type="date"
                                    className="bg-transparent flex-grow sm:flex-grow-0 px-3 py-1.5 text-sm outline-none focus:text-slate-900 transition-colors w-full sm:w-auto min-h-[40px] sm:min-h-0"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                />
                                <span className="text-slate-300 text-[10px] uppercase font-bold tracking-wider px-1 text-center sm:text-left self-center">to</span>
                                <input
                                    type="date"
                                    className="bg-transparent flex-grow sm:flex-grow-0 px-3 py-1.5 text-sm outline-none focus:text-slate-900 transition-colors w-full sm:w-auto min-h-[40px] sm:min-h-0"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                />
                            </div>

                            {(filters.search || filters.startDate || filters.endDate) && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-red-600 font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all border border-slate-200"
                                >
                                    <XCircle size={18} />
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-8 border-b border-slate-100 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 px-4 whitespace-nowrap text-sm tracking-tight transition-all relative font-bold ${activeTab === tab.id
                                    ? 'text-slate-900 border-b-2 border-slate-900'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-4 md:p-6 mt-2">
                <DataTable
                    columns={columns}
                    data={filteredBookings}
                    loading={loading}
                    onRowClick={(booking) => navigate(`/partner/bookings/${booking.bookingId}`)}
                    emptyMessage={loading ? "Syncing Live Bookings..." : "No bookings matching your criteria."}
                />
            </div>

            <ConfirmModal
                isOpen={confirmModalState.isOpen}
                title={confirmModalState.title}
                message={confirmModalState.message}
                variant={confirmModalState.variant}
                onConfirm={confirmModalState.onConfirm}
                onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
            />

            <PromptModal
                isOpen={promptModalState.isOpen}
                title={promptModalState.title}
                message={promptModalState.message}
                placeholder={promptModalState.placeholder}
                onConfirm={promptModalState.onConfirm}
                onCancel={() => setPromptModalState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default BookingRequests;
