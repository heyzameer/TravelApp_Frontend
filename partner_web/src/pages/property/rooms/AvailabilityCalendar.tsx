import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
    ChevronLeft,
    ChevronRight,
    Lock,
    Unlock,
    DollarSign,
    Wrench,
    X,
    Calendar as CalendarIcon,
    Home,
    Info,
    AlertCircle
} from 'lucide-react';
import { type AppDispatch, type RootState } from '../../../store';
import {
    fetchAvailabilityCalendar,
    blockDates,
    unblockDates,
    setCustomPricing,
    setSelectedMonth
} from '../../../features/availability/availabilitySlice';
import toast from 'react-hot-toast';

const AvailabilityCalendar: React.FC = () => {
    const { propertyId, roomId } = useParams<{ propertyId: string; roomId: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { calendar, selectedMonth, selectedYear } = useSelector((state: RootState) => state.availability);
    const { rooms = [] } = useSelector((state: RootState) => state.rooms);
    const currentRoom = rooms.find(r => r._id === roomId);

    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [blockReason, setBlockReason] = useState<'maintenance' | 'manual'>('manual');
    const [customPrice, setCustomPrice] = useState({ basePricePerNight: 0, extraPersonCharge: 0 });

    useEffect(() => {
        if (roomId) {
            dispatch(fetchAvailabilityCalendar({ roomId, month: selectedMonth, year: selectedYear }));
        }
    }, [dispatch, roomId, selectedMonth, selectedYear]);

    const handleMonthChange = (direction: 'prev' | 'next') => {
        let newMonth = selectedMonth;
        let newYear = selectedYear;

        if (direction === 'next') {
            newMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
            newYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
        } else {
            newMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
            newYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
        }

        dispatch(setSelectedMonth({ month: newMonth, year: newYear }));
    };

    const handleDateClick = (date: Date) => {
        const dateStr = formatDate(date);
        if (selectedDates.includes(dateStr)) {
            setSelectedDates(selectedDates.filter(d => d !== dateStr));
        } else {
            setSelectedDates([...selectedDates, dateStr]);
        }
    };

    const handleBlockDates = async () => {
        if (!roomId || !propertyId || selectedDates.length === 0) {
            toast.error('Please select dates to block');
            return;
        }

        await dispatch(blockDates({
            roomId,
            propertyId,
            dates: selectedDates,
            reason: blockReason
        }));

        setSelectedDates([]);
        setShowBlockModal(false);
    };

    const handleUnblockDates = async () => {
        if (!roomId || selectedDates.length === 0) {
            toast.error('Please select dates to unblock');
            return;
        }

        const hasBookings = selectedDates.some(dateStr => {
            const day = calendar.find(d => d.date === dateStr);
            return day?.blockedReason === 'booking';
        });

        if (hasBookings) {
            toast.error('Cannot unblock dates with active bookings');
            return;
        }

        await dispatch(unblockDates({ roomId, dates: selectedDates }));
        setSelectedDates([]);
    };

    const handleSetCustomPricing = async () => {
        if (!roomId || !propertyId || selectedDates.length === 0) {
            toast.error('Please select dates for custom pricing');
            return;
        }

        // Support both single and multiple dates if backend supports it
        // For now, we'll loop or update the backend. Let's update the backend next.
        await dispatch(setCustomPricing({
            roomId,
            propertyId,
            dates: selectedDates,
            pricing: {
                basePricePerNight: Number(customPrice.basePricePerNight) || 0,
                extraPersonCharge: Number(customPrice.extraPersonCharge) || 0
            }
        }));

        setSelectedDates([]);
        setShowPricingModal(false);
    };

    const formatDate = (date: Date): string => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDayData = (date: Date) => {
        const dateStr = formatDate(date);
        return calendar.find(day => day.date === dateStr);
    };

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view !== 'month') return '';
        const dayData = getDayData(date);
        const dateStr = formatDate(date);
        const isSelected = selectedDates.includes(dateStr);

        const classes = ['calendar-tile'];
        if (isSelected) classes.push('selected');

        if (dayData?.isBlocked) {
            if (dayData.blockedReason === 'booking') classes.push('blocked-booking');
            else if (dayData.blockedReason === 'maintenance') classes.push('blocked-maintenance');
            else classes.push('blocked-manual');
        } else {
            classes.push('available');
        }

        return classes.join(' ');
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view !== 'month') return null;
        const dayData = getDayData(date);

        return (
            <div className="tile-content mt-1">
                {dayData?.isBlocked && (
                    <div className="absolute top-1 right-1">
                        {dayData.blockedReason === 'booking' ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm" />
                        ) : dayData.blockedReason === 'maintenance' ? (
                            <Wrench size={10} className="text-amber-500" />
                        ) : (
                            <X size={10} className="text-slate-400" />
                        )}
                    </div>
                )}
                {dayData?.pricing && (
                    <div className="text-[10px] font-black text-slate-900 mt-auto">
                        {isNaN(dayData.pricing.basePricePerNight) ? '₹---' :
                            `₹${dayData.pricing.basePricePerNight >= 1000 ? (dayData.pricing.basePricePerNight / 1000).toFixed(1) + 'k' : dayData.pricing.basePricePerNight}`}
                    </div>
                )}
            </div>
        );
    };

    const stats = {
        total: calendar.length,
        available: calendar.filter(d => !d.isBlocked).length,
        booked: calendar.filter(d => d.blockedReason === 'booking').length,
        blocked: calendar.filter(d => d.isBlocked && d.blockedReason !== 'booking').length
    };

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate(`/partner/property/${propertyId}/rooms`)}
                        className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-4">
                            <div className="p-2 bg-rose-50 rounded-xl">
                                <Home className="text-rose-600" size={24} />
                            </div>
                            {currentRoom?.roomName || `Room ${currentRoom?.roomNumber || ''}`}
                        </h1>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-1 ml-1">
                            Live Availability & Inventory
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => handleMonthChange('prev')}
                        className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-400 hover:text-gray-900"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-6 py-2 bg-white shadow-sm border border-gray-100 rounded-xl text-sm font-black uppercase tracking-widest text-center min-w-[200px] text-gray-900">
                        {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button
                        onClick={() => handleMonthChange('next')}
                        className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-400 hover:text-gray-900"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Days', value: stats.total, color: 'gray' },
                    { label: 'Available', value: stats.available, color: 'emerald' },
                    { label: 'Booked', value: stats.booked, color: 'rose' },
                    { label: 'Blocked', value: stats.blocked, color: 'amber' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</span>
                        <span className={`text-3xl font-black ${stat.color === 'emerald' ? 'text-emerald-600' : stat.color === 'rose' ? 'text-rose-600' : stat.color === 'amber' ? 'text-amber-500' : 'text-gray-900'}`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Calendar & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Calendar Component */}
                <div className="lg:col-span-8 bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-gray-100">
                    <Calendar
                        value={null}
                        onClickDay={handleDateClick}
                        tileClassName={tileClassName}
                        tileContent={tileContent}
                        className="custom-calendar-premium w-full !border-none"
                        activeStartDate={new Date(selectedYear, selectedMonth - 1, 1)}
                        showNavigation={false}
                    />

                    {/* Legend */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-8 py-6 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-rose-500 rounded-full" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booked</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-amber-500 rounded-full" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Maintenance</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gray-300 rounded-full" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manual Block</span>
                        </div>
                    </div>
                </div>

                {/* Actions Panel */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Selection Tracker */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Selection Tracker</h3>
                                {selectedDates.length > 0 && <div className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold">READY</div>}
                            </div>

                            {selectedDates.length > 0 ? (
                                <div className="space-y-4">
                                    <p className="text-4xl font-black">{selectedDates.length} <span className="text-lg text-gray-400">Days</span></p>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedDates.map(date => (
                                            <div key={date} className="bg-white/10 p-2.5 rounded-xl text-[10px] font-bold flex items-center justify-between border border-white/5">
                                                <span>{new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                <button onClick={() => setSelectedDates(selectedDates.filter(d => d !== date))}>
                                                    <X size={14} className="text-rose-400 hover:text-rose-300" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setSelectedDates([])}
                                        className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300 transition-colors ml-1"
                                    >
                                        Clear Selection
                                    </button>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-4 opacity-50">
                                    <CalendarIcon size={40} className="mx-auto text-gray-600" />
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-8">Select dates on the calendar to manage inventory</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manager Actions */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-3">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Inventory Actions</h3>

                        <button
                            onClick={() => setShowBlockModal(true)}
                            disabled={selectedDates.length === 0}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-900 border border-transparent hover:border-rose-100"
                        >
                            <span className="flex items-center gap-3">
                                <Lock size={16} /> Block Dates
                            </span>
                            <ChevronRight size={14} />
                        </button>

                        <button
                            onClick={handleUnblockDates}
                            disabled={selectedDates.length === 0}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-900 border border-transparent hover:border-emerald-100"
                        >
                            <span className="flex items-center gap-3">
                                <Unlock size={16} /> Mark Available
                            </span>
                            <ChevronRight size={14} />
                        </button>

                        <button
                            onClick={() => setShowPricingModal(true)}
                            disabled={selectedDates.length === 0}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all disabled:opacity-30 disabled:hover:bg-gray-50 disabled:hover:text-gray-900 border border-transparent hover:border-blue-100"
                        >
                            <span className="flex items-center gap-3">
                                <DollarSign size={16} /> Custom Pricing
                            </span>
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    {/* Pro Tip */}
                    <div className="p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 flex gap-4">
                        <span className="mt-0.5 shrink-0"><Info size={20} className="text-blue-400" /></span>
                        <p className="text-[10px] text-blue-900 font-bold uppercase tracking-tight leading-relaxed">
                            Custom pricing overrides property-level base rates for selected dates. Holiday surcharges should be managed here.
                        </p>
                    </div>
                </div>
            </div>

            {/* Block Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowBlockModal(false)} />
                    <div className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all scale-100">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Block Inventory</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Target Selection: {selectedDates.length} Unit Days</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Blocking Reason</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setBlockReason('manual')}
                                        className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${blockReason === 'manual' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                                    >
                                        Manual Block
                                    </button>
                                    <button
                                        onClick={() => setBlockReason('maintenance')}
                                        className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${blockReason === 'maintenance' ? 'border-amber-600 bg-amber-600 text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                                    >
                                        Repair Work
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowBlockModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBlockDates}
                                    className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black shadow-xl"
                                >
                                    Confirm Block
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Pricing Modal */}
            {showPricingModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowPricingModal(false)} />
                    <div className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-gray-100">
                        <div className="space-y-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 font-black">
                                <DollarSign size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 px-4">Dynamic Daily Pricing</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest px-8 leading-relaxed">Adjust pricing for special events or peak periods.</p>

                            <div className="space-y-4 text-left pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Base Price (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter base rate"
                                        value={customPrice.basePricePerNight || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCustomPrice({ ...customPrice, basePricePerNight: val === '' ? 0 : parseInt(val, 10) });
                                        }}
                                        className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-black text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Extra Person Charge (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter extra charge"
                                        value={customPrice.extraPersonCharge || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCustomPrice({ ...customPrice, extraPersonCharge: val === '' ? 0 : parseInt(val, 10) });
                                        }}
                                        className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-black text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setShowPricingModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSetCustomPricing}
                                    className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black shadow-xl"
                                >
                                    Set Rate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                div { font-family: 'Outfit', sans-serif; }
                .react-calendar {
                    width: 100% !important;
                    background: transparent !important;
                    border: none !important;
                }
                .react-calendar__month-view__weekdays {
                    text-transform: uppercase;
                    font-weight: 900;
                    font-size: 10px;
                    letter-spacing: 0.1em;
                    color: #94a3b8;
                    margin-bottom: 2rem;
                }
                .react-calendar__month-view__days {
                    gap: 8px;
                }
                .calendar-tile {
                    aspect-ratio: 1/1;
                    background: #f8fafc !important;
                    border-radius: 1.5rem !important;
                    transition: all 0.2s ease-in-out !important;
                    border: 2px solid transparent !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    padding: 0.75rem !important;
                    position: relative;
                }
                .calendar-tile:hover {
                    background: #f1f5f9 !important;
                    transform: translateY(-1px);
                }
                .calendar-tile.selected {
                    background: white !important;
                    border-color: #0f172a !important;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                }
                .calendar-tile.available {
                    background: #f0fdf4 !important;
                }
                .calendar-tile.blocked-booking {
                    background: #fef2f2 !important;
                }
                .calendar-tile.blocked-maintenance {
                    background: #fffbeb !important;
                }
                .calendar-tile.blocked-manual {
                    background: #f1f5f9 !important;
                }
                .react-calendar__tile--now {
                    background: #e0f2fe !important;
                }
                .react-calendar__tile--now abbr {
                    color: #0369a1 !important;
                    font-weight: 900;
                }
                .tile-content {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                abbr {
                    text-decoration: none !important;
                    font-size: 14px;
                    font-weight: 800;
                    color: #334155;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                @media (max-width: 640px) {
                    .calendar-tile { border-radius: 1rem !important; padding: 0.5rem !important; min-height: 70px; }
                    abbr { font-size: 11px; }
                }
            `}</style>
        </div>
    );
};

export default AvailabilityCalendar;
