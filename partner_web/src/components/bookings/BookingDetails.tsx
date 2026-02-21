import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchBookingDetails, approveBooking, rejectBooking, checkInBooking, checkOutBooking, completeBooking } from '../../store/slices/bookingsSlice';
import { format } from 'date-fns';
import { ArrowLeft, User as UserIcon, CreditCard, Building, LogIn, LogOut, CheckCircle, XCircle, MapPin, Home, Utensils, Compass, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';
import PromptModal from '../common/PromptModal';
import { type Booking, type Property, type User } from '../../types';
import InvoiceTemplate from './InvoiceTemplate';
import { generateInvoicePDF } from '../../utils/invoiceGenerator';

const BookingDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { currentBooking, loading, error } = useSelector((state: RootState) => state.bookings);
    const booking = currentBooking as Booking;

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

    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const [promptModal, setPromptModal] = useState<PromptModalState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchBookingDetails(id));
        }
    }, [dispatch, id]);

    const handleApprove = () => {
        if (!id) return;
        setConfirmModal({
            isOpen: true,
            title: 'Approve Booking',
            message: 'Are you sure you want to approve this booking? This will confirm the reservation for the guest.',
            variant: 'info',
            onConfirm: async () => {
                try {
                    setIsActionLoading(true);
                    await dispatch(approveBooking(id)).unwrap();
                    toast.success('Booking approved successfully');
                } catch (err: unknown) {
                    toast.error(typeof err === 'string' ? err : 'Failed to approve booking');
                } finally {
                    setIsActionLoading(false);
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleReject = () => {
        if (!id) return;
        setPromptModal({
            isOpen: true,
            title: 'Reject Booking',
            message: 'Please enter a reason for rejection. This will be sent to the guest.',
            placeholder: 'Reason for rejection...',
            onConfirm: async (reason: string) => {
                try {
                    setIsActionLoading(true);
                    await dispatch(rejectBooking({ bookingId: id, reason })).unwrap();
                    toast.success('Booking rejected');
                } catch (err: unknown) {
                    toast.error(typeof err === 'string' ? err : 'Failed to reject booking');
                } finally {
                    setIsActionLoading(false);
                    setPromptModal((prev) => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleCheckIn = () => {
        if (!id) return;
        setConfirmModal({
            isOpen: true,
            title: 'Confirm Check-In',
            message: 'Has the guest arrived? Mark as checked-in to start their stay.',
            variant: 'info',
            onConfirm: async () => {
                try {
                    setIsActionLoading(true);
                    await dispatch(checkInBooking(id)).unwrap();
                    toast.success('Guest checked-in successfully');
                } catch (err: unknown) {
                    toast.error(typeof err === 'string' ? err : 'Failed to check-in guest');
                } finally {
                    setIsActionLoading(false);
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleCheckOut = () => {
        if (!id) return;
        setConfirmModal({
            isOpen: true,
            title: 'Confirm Check-Out',
            message: 'Is the guest leaving? Mark as checked-out to finalize their stay.',
            variant: 'warning',
            onConfirm: async () => {
                try {
                    setIsActionLoading(true);
                    await dispatch(checkOutBooking(id)).unwrap();
                    toast.success('Guest checked-out successfully');
                } catch (err: unknown) {
                    toast.error(typeof err === 'string' ? err : 'Failed to check-out guest');
                } finally {
                    setIsActionLoading(false);
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleComplete = () => {
        if (!id) return;
        setConfirmModal({
            isOpen: true,
            title: 'Complete Stay',
            message: 'Mark this booking as completed? This confirms all services were rendered and the stay is finalized.',
            variant: 'info',
            onConfirm: async () => {
                try {
                    setIsActionLoading(true);
                    await dispatch(completeBooking(id)).unwrap();
                    toast.success('Booking marked as completed');
                } catch (err: unknown) {
                    toast.error(typeof err === 'string' ? err : 'Failed to complete booking');
                } finally {
                    setIsActionLoading(false);
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    if (loading && !booking) return <div className="text-center py-10">Loading booking details...</div>;
    if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;
    if (!booking) return <div className="text-center py-10">Booking not found</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 bg-[#f8fafc]">
            {/* Back Button & Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/partner/bookings')}
                        className="group flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Bookings</span>
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                #{booking.bookingId}
                            </h1>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${booking.status?.toLowerCase() === 'cancelled' || booking.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                booking.status?.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                {(booking.status || '').replace('_', ' ')}
                            </span>
                            {booking.partnerApprovalStatus?.toLowerCase() === 'approved' && booking.confirmedAt && (
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                                    <CheckCircle2 size={10} />
                                    Auto-Confirmed
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 font-medium">
                            Reserved on <span className="text-slate-600">{format(new Date(booking.createdAt), 'PPP')}</span> at {format(new Date(booking.createdAt), 'p')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Details & Bill */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Stay Stepper Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Stay Progress</h3>
                            <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                                <div className="absolute top-[20px] left-0 w-full h-[3px] bg-slate-100 z-0"></div>
                                <div
                                    className="absolute top-[20px] left-0 h-[3px] bg-emerald-500 z-0 transition-all duration-1000 ease-in-out"
                                    style={{
                                        width:
                                            booking.status?.toLowerCase() === 'confirmed' ? '0%' :
                                                booking.status?.toLowerCase() === 'checked_in' ? '33.33%' :
                                                    booking.status?.toLowerCase() === 'checked_out' ? '66.66%' :
                                                        booking.status?.toLowerCase() === 'completed' ? '100%' : '0%'
                                    }}
                                ></div>

                                {[
                                    { label: 'Confirmed', status: 'confirmed', icon: CheckCircle },
                                    { label: 'Checked In', status: 'checked_in', icon: LogIn },
                                    { label: 'Checked Out', status: 'checked_out', icon: LogOut },
                                    { label: 'Completed', status: 'completed', icon: CheckCircle }
                                ].map((step, idx) => {
                                    const statusOrder = ['confirmed', 'checked_in', 'checked_out', 'completed'];
                                    const currentIdx = statusOrder.indexOf(booking.status?.toLowerCase() || '');
                                    const isCompleted = currentIdx >= idx;
                                    const isCurrent = currentIdx === idx;
                                    const Icon = step.icon;

                                    return (
                                        <div key={idx} className="relative z-10 flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 transform ${isCompleted ? 'bg-emerald-500 border-white text-white shadow-lg shadow-emerald-100' : 'bg-white border-slate-50 text-slate-200'
                                                } ${isCurrent ? 'scale-125 ring-8 ring-emerald-50' : ''}`}>
                                                <Icon size={18} strokeWidth={3} />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-wider mt-5 ${isCompleted ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Stay Control Card - Relocated for Better Mobile UX */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stay Control</h3>
                                <span className="text-[8px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-black uppercase tracking-widest">Manual</span>
                            </div>

                            <div className="space-y-4">
                                {((booking.partnerApprovalStatus?.toLowerCase() === 'pending') ||
                                    (booking.status?.toLowerCase() === 'payment_completed')) &&
                                    booking.status?.toLowerCase() !== 'confirmed' && (
                                        <div className="space-y-3">
                                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-4">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 text-center">New Reservation</p>
                                                <p className="text-[9px] text-amber-500 font-bold leading-tight text-center">Confirm this booking to block dates and enable stay management.</p>
                                            </div>
                                            <button
                                                onClick={handleApprove}
                                                disabled={isActionLoading}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg shadow-emerald-100 active:scale-95"
                                            >
                                                <CheckCircle size={18} />
                                                <span>Confirm Booking</span>
                                            </button>
                                            <button
                                                onClick={handleReject}
                                                disabled={isActionLoading}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-red-600 border-2 border-red-50 rounded-2xl hover:bg-red-50 transition-all font-bold text-sm active:scale-95"
                                            >
                                                <XCircle size={18} />
                                                <span>Reject Booking</span>
                                            </button>
                                        </div>
                                    )}

                                {booking.status?.toLowerCase() === 'confirmed' && (
                                    <button
                                        onClick={handleCheckIn}
                                        disabled={isActionLoading}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-[1.25rem] hover:bg-black transition-all font-bold text-sm shadow-xl shadow-slate-200 group active:scale-95"
                                    >
                                        <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                        <span>Mark as Checked In</span>
                                    </button>
                                )}

                                {booking.status?.toLowerCase() === 'checked_in' && (
                                    <button
                                        onClick={handleCheckOut}
                                        disabled={isActionLoading}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-amber-600 text-white rounded-[1.25rem] hover:bg-amber-700 transition-all font-bold text-sm shadow-xl shadow-amber-100 group active:scale-95"
                                    >
                                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                                        <span>Mark as Checked Out</span>
                                    </button>
                                )}

                                {booking.status?.toLowerCase() === 'checked_out' && (
                                    <button
                                        onClick={handleComplete}
                                        disabled={isActionLoading}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-[1.25rem] hover:bg-emerald-700 transition-all font-bold text-sm shadow-xl shadow-emerald-100 group active:scale-95"
                                    >
                                        <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                                        <span>Mark as Completed</span>
                                    </button>
                                )}

                                {['completed', 'cancelled', 'rejected'].includes(booking.status?.toLowerCase() || '') && (
                                    <div className="text-center space-y-3 py-6 px-4 bg-slate-50/50 rounded-3xl border border-slate-100">
                                        <div className="mx-auto w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                                            <CheckCircle size={20} />
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed px-2">
                                            Stay cycle is complete. All checks finished.
                                        </p>
                                    </div>
                                )}

                                {booking.status?.toLowerCase() === 'pending_payment' && (
                                    <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-center">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Awaiting Guest Payment</p>
                                        <p className="text-[10px] text-blue-500 font-medium">Reservation will be available for approval once the payment is completed.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 pt-8 md:pt-0 md:pl-8 border-t md:border-t-0 md:border-l border-slate-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Support ID</span>
                                <span className="text-sm font-black text-slate-900 tracking-tight">TH-{booking.bookingId.slice(-6).toUpperCase()}</span>
                            </div>
                            <button
                                onClick={async () => {
                                    const loadingToast = toast.loading('Generating invoice PDF...');
                                    try {
                                        await generateInvoicePDF('booking-invoice', `Invoice-${booking.bookingId}`);
                                        toast.success('Invoice generated successfully', { id: loadingToast });
                                    } catch (error) {
                                        console.error('PDF Generation Error:', error);
                                        toast.error('Failed to generate invoice', { id: loadingToast });
                                    }
                                }}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95"
                            >
                                Download Invoice PDF
                            </button>
                        </div>
                    </div>

                    {/* Stay & Guest Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Property & Stay</h3>
                                <Building size={16} className="text-slate-300" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                        <Home size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">
                                            {typeof booking.propertyId === 'object' ? (booking.propertyId as Property).propertyName : 'Property'}
                                        </p>
                                        {typeof booking.propertyId === 'object' && (booking.propertyId as Property).address && (
                                            <p className="text-xs text-slate-400 font-medium flex items-center mt-1">
                                                <MapPin size={10} className="mr-1" />
                                                {(booking.propertyId as Property).address.city}, {(booking.propertyId as Property).address.state}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Check-in</p>
                                        <p className="text-sm font-bold text-slate-700">{format(new Date(booking.checkInDate), 'MMM dd, yyyy')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Check-out</p>
                                        <p className="text-sm font-bold text-slate-700">{booking.checkOutDate ? format(new Date(booking.checkOutDate), 'MMM dd, yyyy') : '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Contact</h3>
                                <UserIcon size={16} className="text-slate-300" />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xl font-black text-slate-900">
                                        {booking.userId && typeof booking.userId === 'object' ? (booking.userId as User).fullName : 'Guest'}
                                    </p>
                                    <p className="text-sm text-slate-500 font-medium">{booking.userId && typeof booking.userId === 'object' ? (booking.userId as User).email : ''}</p>
                                </div>
                                <div className="pt-4 border-t border-slate-50">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Total Guests: {booking.totalGuests}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {booking.guestDetails.map((guest, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100">
                                                {guest.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Room Bill Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Room Reservation</h3>
                        <div className="space-y-4">
                            {booking.roomBookings.map((room, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                            {idx + 1}
                                        </div>
                                        <p className="font-bold text-slate-900">
                                            {room.roomId && typeof room.roomId === 'object' ? (room.roomId as unknown as { roomName: string }).roomName : 'Guest Room'}
                                            {room.roomNumber && <span className="ml-2 px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded-md font-black uppercase tracking-widest">#{room.roomNumber}</span>}
                                        </p>
                                    </div>
                                    <p className="text-lg font-black text-slate-900">₹{room.totalRoomPrice.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meal Plan Card */}
                    {booking.mealPlanId && (
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Dining & Meal Plan</h3>
                            <div className="flex items-center justify-between p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100">
                                <div className="flex items-center gap-4">
                                    <Utensils className="text-emerald-600" size={20} />
                                    <p className="font-bold text-slate-900">
                                        {typeof booking.mealPlanId === 'object' ? (booking.mealPlanId as unknown as { name: string }).name : 'Standard Meal Plan'}
                                    </p>
                                </div>
                                <p className="text-lg font-black text-slate-900">₹{(booking.mealTotalPrice || booking.mealPlanPrice || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    {/* Activities Card */}
                    {booking.activityBookings && booking.activityBookings.length > 0 && (
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Guest Experiences</h3>
                            <div className="space-y-4">
                                {booking.activityBookings.map((activity, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 bg-purple-50/30 rounded-3xl border border-purple-100">
                                        <div className="flex items-center gap-4">
                                            <Compass className="text-purple-600" size={18} />
                                            <p className="font-bold text-slate-900">
                                                {typeof activity.activityId === 'object' ? (activity.activityId as unknown as { name: string }).name : 'Adventure Activity'}
                                            </p>
                                        </div>
                                        <p className="text-lg font-black text-slate-900">₹{activity.totalActivityPrice.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Bill Section */}
                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            <CreditCard size={120} />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Summary Receipt</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Bill</p>
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${booking.paymentStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                                        {booking.paymentStatus}
                                    </div>
                                </div>
                                <p className="text-4xl font-black tracking-tight">₹{booking.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="pt-8 border-t border-slate-800 space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Included Services</p>
                                <div className="flex flex-wrap gap-2">
                                    {booking.roomBookings.length > 0 && (
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Room</span>
                                    )}
                                    {booking.mealPlanId && (
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Meal Plan</span>
                                    )}
                                    {(booking.activityBookings?.length ?? 0) > 0 && (
                                        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-500/20">Activities</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                isLoading={isActionLoading}
            />

            <PromptModal
                isOpen={promptModal.isOpen}
                title={promptModal.title}
                message={promptModal.message}
                placeholder={promptModal.placeholder}
                onConfirm={promptModal.onConfirm}
                onCancel={() => setPromptModal((prev) => ({ ...prev, isOpen: false }))}
                isLoading={isActionLoading}
            />
            <InvoiceTemplate booking={booking} />
        </div>
    );
};

export default BookingDetails;
