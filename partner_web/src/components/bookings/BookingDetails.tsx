import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchBookingDetails, approveBooking, rejectBooking, checkInBooking, checkOutBooking, completeBooking } from '../../store/slices/bookingsSlice';
import { format } from 'date-fns';
import { ArrowLeft, User, Calendar, CreditCard, Building, LogIn, LogOut, CheckCircle, MapPin, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';
import PromptModal from '../common/PromptModal';
import { type Booking, type Property } from '../../types';

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

    if (loading) return <div className="text-center py-10">Loading booking details...</div>;
    if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;
    if (!booking) return <div className="text-center py-10">Booking not found</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
            {/* Header */}
            <div className="p-6 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/partner/bookings')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900 break-all">Booking #{booking.bookingId}</h1>
                        <p className="text-sm text-slate-400 font-medium">Created on {format(new Date(booking.createdAt), 'PPP p')}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${booking.partnerApprovalStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        booking.partnerApprovalStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-red-50 text-red-600 border-red-100'
                        }`}>
                        {booking.status.replace('_', ' ')}
                    </span>
                    {booking.partnerApprovalStatus === 'pending' && (
                        <div className="flex space-x-2">
                            <button
                                onClick={handleApprove}
                                className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all font-bold text-xs"
                            >
                                Approve
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex items-center px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs"
                            >
                                Reject
                            </button>
                        </div>
                    )}
                    {booking.status === 'confirmed' && (
                        <button
                            onClick={handleCheckIn}
                            className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black font-bold text-xs"
                        >
                            <LogIn size={16} className="mr-2" /> Mark Check-In
                        </button>
                    )}
                    {booking.status === 'checked_in' && (
                        <button
                            onClick={handleCheckOut}
                            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold text-xs"
                        >
                            <LogOut size={16} className="mr-2" /> Mark Check-Out
                        </button>
                    )}
                    {booking.status === 'checked_out' && (
                        <button
                            onClick={handleComplete}
                            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-xs"
                        >
                            <CheckCircle size={16} className="mr-2" /> Complete Stay
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Guest Information */}
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                        <User className="mr-2 text-slate-900" size={16} /> Guest Information
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="font-bold text-xl text-slate-900">{booking.userId && typeof booking.userId === 'object' ? booking.userId.fullName : 'Guest'}</p>
                        <p className="text-slate-500 font-medium">{booking.userId && typeof booking.userId === 'object' ? booking.userId.email : ''}</p>
                        <p className="text-slate-500 font-medium mt-1">{booking.userId && typeof booking.userId === 'object' ? booking.userId.phone : ''}</p>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500 mb-2">Guest List ({booking.totalGuests})</p>
                            <ul className="space-y-1">
                                {booking.guestDetails.map((guest, idx) => (
                                    <li key={idx} className="text-sm">
                                        {guest.name} ({guest.age}, {guest.gender})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Stay Details */}
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                        <Building className="mr-2 text-slate-900" size={16} /> Stay Details
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        <div className="flex items-start">
                            <Home className="mr-2 text-gray-400 mt-1" size={16} />
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {typeof booking.propertyId === 'object' ? (booking.propertyId as Property).propertyName : 'Property'}
                                </p>
                                {typeof booking.propertyId === 'object' && (booking.propertyId as Property).address && (
                                    <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                        <MapPin size={12} className="mr-1" />
                                        {(booking.propertyId as Property).address.city}, {(booking.propertyId as Property).address.state}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center pt-2">
                            <Calendar className="mr-2 text-gray-400" size={16} />
                            <span className="font-medium">Check-in:</span>
                            <span className="ml-2">{format(new Date(booking.checkInDate), 'PPP')}</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="mr-2 text-gray-400" size={16} />
                            <span className="font-medium">Check-out:</span>
                            <span className="ml-2">{booking.checkOutDate ? format(new Date(booking.checkOutDate), 'PPP') : '-'}</span>
                        </div>
                        {/* Rooms List */}
                        <div className="border-t pt-3 mt-3">
                            <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">Rooms Reserved</p>
                            {booking.roomBookings.map((room, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 last:border-0">
                                    <div>
                                        <p className="font-medium text-gray-700">
                                            {room.roomNumber ? `Room ${room.roomNumber}` : `Room ${idx + 1}`}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            ID: {typeof room.roomId === 'string'
                                                ? `${room.roomId.substring(0, 8)}...`
                                                : (room.roomId as unknown as { _id: string })?._id
                                                    ? `${(room.roomId as unknown as { _id: string })._id.substring(0, 8)}...`
                                                    : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">₹{room.totalRoomPrice}</p>
                                        <p className="text-xs text-gray-400">{room.numberOfGuests} Guests</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                        <CreditCard className="mr-2 text-slate-900" size={16} /> Payment Breakdown
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Room Total</span>
                                <span>₹{booking.roomTotalPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Meal Plan Total</span>
                                <span>₹{booking.mealTotalPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Activity Total</span>
                                <span>₹{booking.activityTotalPrice}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-lg">
                                <span>Grand Total</span>
                                <span>₹{booking.finalPrice}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Payment Status</span>
                                <span className={`px-2 py-1 rounded text-xs capitalize ${booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>{booking.paymentStatus}</span>
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
        </div >
    );
};

export default BookingDetails;
