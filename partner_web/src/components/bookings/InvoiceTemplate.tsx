import React from 'react';
import { format } from 'date-fns';
import type { Booking, User, Property } from '../../types';

interface InvoiceTemplateProps {
    booking: Booking;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ booking }) => {
    return (
        <div id="booking-invoice" className="p-12 font-sans max-w-[800px] mx-auto border" style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '800px', backgroundColor: '#ffffff', color: '#1e293b', borderColor: '#f1f5f9' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-12 border-b-2 pb-8" style={{ borderColor: '#f1f5f9' }}>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2" style={{ color: '#0f172a' }}>TRAVELHUB</h1>
                    <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Premium Travel Ecosystem</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: '#0f172a' }}>Invoice</h2>
                    <p className="text-sm font-bold mt-1" style={{ color: '#64748b' }}>#{booking.bookingId}</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#cbd5e1' }}>Invoice To</h3>
                    <p className="text-lg font-black leading-tight" style={{ color: '#0f172a' }}>
                        {typeof booking.userId === 'object' ? (booking.userId as User).fullName : 'Guest'}
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#64748b' }}>
                        {typeof booking.userId === 'object' ? (booking.userId as User).email : ''}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                        {typeof booking.userId === 'object' ? (booking.userId as User).phone : ''}
                    </p>
                </div>
                <div className="text-right">
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#cbd5e1' }}>Stay Details</h3>
                    <p className="text-md font-bold" style={{ color: '#0f172a' }}>
                        {typeof booking.propertyId === 'object' ? (booking.propertyId as Property).propertyName : 'Property'}
                    </p>
                    <p className="text-sm font-medium mt-1" style={{ color: '#64748b' }}>
                        Check-in: {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                        Check-out: {booking.checkOutDate ? format(new Date(booking.checkOutDate), 'MMM dd, yyyy') : '-'}
                    </p>
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b-2 pb-4 mb-4" style={{ borderColor: '#0f172a' }}>
                <div className="col-span-6 text-[10px] font-black uppercase tracking-widest" style={{ color: '#0f172a' }}>Service Description</div>
                <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: '#0f172a' }}>Qty</div>
                <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: '#0f172a' }}>Rate</div>
                <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: '#0f172a' }}>Amount</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-4 mb-12">
                {booking.roomBookings.map((room, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-6">
                            <p className="font-bold" style={{ color: '#0f172a' }}>Room Reservation</p>
                            <p className="text-xs" style={{ color: '#94a3b8' }}>Standard Suite - Unit {room.roomNumber || idx + 1}</p>
                        </div>
                        <div className="col-span-2 text-center text-sm font-bold" style={{ color: '#475569' }}>{booking.numberOfNights} Nights</div>
                        <div className="col-span-2 text-right text-sm font-bold" style={{ color: '#475569' }}>₹{room.pricePerNight.toFixed(2)}</div>
                        <div className="col-span-2 text-right text-sm font-black" style={{ color: '#0f172a' }}>₹{room.totalRoomPrice.toFixed(2)}</div>
                    </div>
                ))}

                {booking.mealPlanId && (
                    <div className="grid grid-cols-12 gap-4 items-center pt-4 border-t" style={{ borderColor: '#f8fafc' }}>
                        <div className="col-span-6">
                            <p className="font-bold" style={{ color: '#0f172a' }}>Meal Plan</p>
                            <p className="text-xs" style={{ color: '#94a3b8' }}>Fixed daily dining selection</p>
                        </div>
                        <div className="col-span-2 text-center text-sm font-bold" style={{ color: '#475569' }}>{booking.totalGuests} Pax</div>
                        <div className="col-span-2 text-right text-sm font-bold" style={{ color: '#475569' }}>-</div>
                        <div className="col-span-2 text-right text-sm font-black" style={{ color: '#0f172a' }}>₹{(booking.mealTotalPrice || 0).toFixed(2)}</div>
                    </div>
                )}

                {booking.activityBookings?.map((activity, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 items-center pt-4 border-t" style={{ borderColor: '#f8fafc' }}>
                        <div className="col-span-6">
                            <p className="font-bold" style={{ color: '#0f172a' }}>Activity: {typeof activity.activityId === 'object' ? (activity.activityId as unknown as { name: string }).name : 'Adventure'}</p>
                            <p className="text-xs" style={{ color: '#94a3b8', textDecorationColor: '#f1f5f9' }}>Verified Experience</p>
                        </div>
                        <div className="col-span-2 text-center text-sm font-bold" style={{ color: '#475569' }}>{activity.participants} Pax</div>
                        <div className="col-span-2 text-right text-sm font-bold" style={{ color: '#475569' }}>₹{activity.pricePerPerson.toFixed(2)}</div>
                        <div className="col-span-2 text-right text-sm font-black" style={{ color: '#0f172a' }}>₹{activity.totalActivityPrice.toFixed(2)}</div>
                    </div>
                ))}
            </div>

            {/* Calculations Section */}
            <div className="flex justify-end pt-8 border-t-2" style={{ borderColor: '#f1f5f9' }}>
                <div className="w-full max-w-[300px] space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold" style={{ color: '#64748b' }}>
                        <span className="uppercase tracking-widest text-[10px]">Subtotal</span>
                        <span>₹{(booking.finalPrice / 1.18).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold" style={{ color: '#64748b' }}>
                        <span className="uppercase tracking-widest text-[10px]">GST (18%)</span>
                        <span>₹{(booking.finalPrice - (booking.finalPrice / 1.18)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-black pt-4 border-t" style={{ color: '#0f172a', borderColor: '#0f172a' }}>
                        <span className="uppercase tracking-tight text-xs">Total Amount</span>
                        <span>₹{booking.finalPrice.toFixed(2)}</span>
                    </div>
                    {booking.paymentStatus === 'completed' && (
                        <div className="mt-4 p-2 text-center rounded-lg text-[10px] font-black uppercase tracking-widest border" style={{ backgroundColor: '#ecfdf5', color: '#059669', borderColor: '#d1fae5' }}>
                            Fully Paid
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t text-center" style={{ borderColor: '#f1f5f9' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>Thank you for booking with TravelHub</p>
                <div className="flex justify-center gap-6 text-[9px] font-medium" style={{ color: '#94a3b8' }}>
                    <span>WWW.TRAVELHUB.CO</span>
                    <span>SUPPORT@TRAVELHUB.CO</span>
                    <span>+91 1800-TRAVEL-HUB</span>
                </div>
                <p className="text-[8px] italic mt-6" style={{ color: '#cbd5e1' }}>* This is a computer generated invoice and does not require a physical signature.</p>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
