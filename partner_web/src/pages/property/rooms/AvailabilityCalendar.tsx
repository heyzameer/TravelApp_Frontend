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
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <button
                            onClick={() => navigate(`/partner/property/${propertyId}/rooms`)}
                            className="group flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Inventory Management</span>
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                <Home size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                                    {currentRoom?.roomName || `Room ${currentRoom?.roomNumber || ''}`}
                                </h1>
                                <p className="text-slate-500 font-bold text-sm flex items-center gap-2 uppercase tracking-wider">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Availability Status
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <button
                            onClick={() => handleMonthChange('prev')}
                            className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest text-center min-w-[180px]">
                            {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <button
                            onClick={() => handleMonthChange('next')}
                            className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Days</p>
                        <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Available</p>
                        <p className="text-3xl font-black text-emerald-700">{stats.available}</p>
                    </div>
                    <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Booked</p>
                        <p className="text-3xl font-black text-red-700">{stats.booked}</p>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 shadow-sm space-y-2">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Maintenance</p>
                        <p className="text-3xl font-black text-amber-700">{stats.blocked}</p>
                    </div>
                </div>

                {/* Calendar & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Calendar Component */}
                    <div className="lg:col-span-8 bg-white rounded-[3rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
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
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 py-6 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Booked</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maintenance</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-slate-300 rounded-full" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manual Block</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Selected Tracker */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selection Tracker</h3>
                                    <div className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold">LIVE</div>
                                </div>

                                {selectedDates.length > 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-4xl font-black">{selectedDates.length} <span className="text-lg text-slate-400">Selected</span></p>
                                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedDates.map(date => (
                                                <div key={date} className="bg-white/10 p-2 rounded-xl text-[10px] font-bold flex items-center justify-between">
                                                    <span>{date.split('-').slice(1).join('/')}</span>
                                                    <button onClick={() => setSelectedDates(selectedDates.filter(d => d !== date))}>
                                                        <X size={12} className="text-red-400" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setSelectedDates([])}
                                            className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors"
                                        >
                                            Clear All Selection
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center space-y-4">
                                        <CalendarIcon size={40} className="mx-auto text-slate-700" />
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest px-8">Select dates on the calendar to perform actions</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Manager Actions</h3>

                            <button
                                onClick={() => setShowBlockModal(true)}
                                disabled={selectedDates.length === 0}
                                className="w-full flex items-center justify-between p-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-30 active:scale-95 group"
                            >
                                <span className="flex items-center gap-3">
                                    <Lock size={16} /> Block Inventory
                                </span>
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={handleUnblockDates}
                                disabled={selectedDates.length === 0}
                                className="w-full flex items-center justify-between p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-30 active:scale-95 group"
                            >
                                <span className="flex items-center gap-3">
                                    <Unlock size={16} /> Mark as Available
                                </span>
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => setShowPricingModal(true)}
                                disabled={selectedDates.length === 0}
                                className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-30 active:scale-95 group"
                            >
                                <span className="flex items-center gap-3">
                                    <DollarSign size={16} /> Set Custom Price
                                </span>
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Help Tip */}
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex gap-4">
                            <Info size={20} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                <span className="font-bold text-slate-700">Pro Tip:</span> Tap and drag to select multiple dates quickly. Custom pricing overrides property-level base rates for selected dates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Block Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowBlockModal(false)} />
                    <div className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-slate-100 transform transition-all scale-100">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Block Inventory</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Blocking {selectedDates.length} units</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Blocking Reason</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setBlockReason('manual')}
                                        className={`p-4 rounded-2xl border-2 text-xs font-black uppercase transition-all ${blockReason === 'manual' ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-100 bg-white text-slate-400'}`}
                                    >
                                        Manual
                                    </button>
                                    <button
                                        onClick={() => setBlockReason('maintenance')}
                                        className={`p-4 rounded-2xl border-2 text-xs font-black uppercase transition-all ${blockReason === 'maintenance' ? 'border-amber-600 bg-amber-50 text-amber-600' : 'border-slate-100 bg-white text-slate-400'}`}
                                    >
                                        Repair
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowBlockModal(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBlockDates}
                                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-200"
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
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowPricingModal(false)} />
                    <div className="relative bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl border border-slate-100">
                        <div className="space-y-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6">
                                <DollarSign size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 px-4">Dynamic Daily Pricing</h3>
                            <p className="text-xs text-slate-500 font-medium px-8 leading-relaxed">Adjust pricing for special events, holidays, or seasonal peak periods.</p>

                            <div className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Base Price (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter base rate"
                                        value={customPrice.basePricePerNight || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCustomPrice({ ...customPrice, basePricePerNight: val === '' ? 0 : parseInt(val, 10) });
                                        }}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Extra Person Charge (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter extra charge"
                                        value={customPrice.extraPersonCharge || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCustomPrice({ ...customPrice, extraPersonCharge: val === '' ? 0 : parseInt(val, 10) });
                                        }}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setShowPricingModal(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSetCustomPricing}
                                    className="flex-1 py-4 bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-xl shadow-blue-200"
                                >
                                    Set Rate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .react-calendar {
                    width: 100% !important;
                    background: transparent !important;
                    border: none !important;
                    font-family: inherit !important;
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
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    border: 2px solid transparent !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    padding: 0.75rem !important;
                    position: relative;
                }
                .calendar-tile:hover {
                    background: #f1f5f9 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                }
                .calendar-tile.selected {
                    background: white !important;
                    border-color: #0f172a !important;
                    transform: scale(0.95);
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
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
                    .calendar-tile {
                        border-radius: 1rem !important;
                        padding: 0.5rem !important;
                        min-height: 70px;
                    }
                    abbr {
                        font-size: 11px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AvailabilityCalendar;
