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
    X
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

    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [blockReason, setBlockReason] = useState<'maintenance' | 'manual'>('manual');
    const [customPrice, setCustomPrice] = useState({ basePricePerNight: 0, extraPersonCharge: 0 });

    // Fetch calendar on mount and month change
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

        // Check if any selected dates are booked (cannot unblock bookings)
        const hasBookings = selectedDates.some(dateStr => {
            const day = calendar.find((d: { date: string; blockedReason?: string }) => d.date === dateStr);
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
        if (!roomId || !propertyId || selectedDates.length !== 1) {
            toast.error('Please select exactly one date for custom pricing');
            return;
        }

        await dispatch(setCustomPricing({
            roomId,
            propertyId,
            date: selectedDates[0],
            pricing: customPrice
        }));

        setSelectedDates([]);
        setShowPricingModal(false);
    };

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDayData = (date: Date) => {
        const dateStr = formatDate(date);
        return calendar.find((day: { date: string; isBlocked?: boolean; blockedReason?: string; pricing?: { basePricePerNight: number } }) => day.date === dateStr);
    };

    const tileClassName = ({ date }: { date: Date }) => {
        const dayData = getDayData(date);
        const dateStr = formatDate(date);
        const isSelected = selectedDates.includes(dateStr);

        let className = 'calendar-tile';

        if (isSelected) className += ' selected';
        if (dayData?.isBlocked) {
            if (dayData.blockedReason === 'booking') className += ' blocked-booking';
            else if (dayData.blockedReason === 'maintenance') className += ' blocked-maintenance';
            else className += ' blocked-manual';
        } else {
            // Available dates get green background
            className += ' available';
        }

        return className;
    };

    const tileContent = ({ date }: { date: Date }) => {
        const dayData = getDayData(date);

        return (
            <div className="tile-content">
                {dayData?.isBlocked && (
                    <div className="block-indicator">
                        {dayData.blockedReason === 'booking' && <Lock size={12} />}
                        {dayData.blockedReason === 'maintenance' && <Wrench size={12} />}
                        {dayData.blockedReason === 'manual' && <X size={12} />}
                    </div>
                )}
                {dayData?.pricing && (
                    <div className="price-indicator">
                        ₹{dayData.pricing.basePricePerNight}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <button
                    onClick={() => navigate(`/partner/property/${propertyId}/rooms`)}
                    className="flex items-center text-gray-500 hover:text-gray-900 font-bold mb-4"
                >
                    <ChevronLeft size={20} /> Back to Rooms
                </button>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Room Availability Calendar</h1>
                        <p className="text-gray-600">Manage availability and pricing for this room</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                        <button
                            onClick={() => handleMonthChange('prev')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="text-lg font-bold px-4">
                            {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <button
                            onClick={() => handleMonthChange('next')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
                    <Calendar
                        value={null}
                        onClickDay={handleDateClick}
                        tileClassName={tileClassName}
                        tileContent={tileContent}
                        className="custom-calendar w-full"
                        activeStartDate={new Date(selectedYear, selectedMonth - 1, 1)}
                    />

                    {/* Legend */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-sm">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="text-sm flex items-center gap-1">
                                <Lock size={12} /> Booked
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span className="text-sm flex items-center gap-1">
                                <Wrench size={12} /> Maintenance
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-500 rounded"></div>
                            <span className="text-sm flex items-center gap-1">
                                <X size={12} /> Manual Block
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Panel */}
                <div className="space-y-4">
                    {/* Selected Dates */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="font-bold text-lg mb-4">Selected Dates</h3>
                        {selectedDates.length > 0 ? (
                            <div className="space-y-2">
                                {selectedDates.map(date => (
                                    <div key={date} className="bg-gray-100 px-3 py-2 rounded-lg text-sm flex justify-between items-center">
                                        <span>{new Date(date).toLocaleDateString()}</span>
                                        <button
                                            onClick={() => setSelectedDates(selectedDates.filter(d => d !== date))}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Click on dates to select</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
                        <h3 className="font-bold text-lg mb-4">Actions</h3>

                        <button
                            onClick={() => setShowBlockModal(true)}
                            disabled={selectedDates.length === 0}
                            className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Lock size={18} /> Block Dates
                        </button>

                        <button
                            onClick={handleUnblockDates}
                            disabled={selectedDates.length === 0}
                            className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Unlock size={18} /> Unblock Dates
                        </button>

                        <button
                            onClick={() => setShowPricingModal(true)}
                            disabled={selectedDates.length !== 1}
                            className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <DollarSign size={18} /> Set Custom Pricing
                        </button>
                    </div>
                </div>
            </div>

            {/* Block Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Block Dates</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for blocking</label>
                                <select
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value as 'maintenance' | 'manual')}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none"
                                >
                                    <option value="manual">Manual Block</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBlockModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-bold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBlockDates}
                                    className="flex-1 bg-red-500 text-white py-2 rounded-xl font-bold hover:bg-red-600"
                                >
                                    Block
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Pricing Modal */}
            {showPricingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Set Custom Pricing</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Base Price Per Night (₹)</label>
                                <input
                                    type="number"
                                    value={customPrice.basePricePerNight}
                                    onChange={(e) => setCustomPrice({ ...customPrice, basePricePerNight: parseInt(e.target.value, 10) })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Extra Person Charge (₹)</label>
                                <input
                                    type="number"
                                    value={customPrice.extraPersonCharge}
                                    onChange={(e) => setCustomPrice({ ...customPrice, extraPersonCharge: parseInt(e.target.value, 10) })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPricingModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-bold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSetCustomPricing}
                                    className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-bold hover:bg-blue-600"
                                >
                                    Set Pricing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Styles */}
            <style>{`
                .custom-calendar {
                    border: none !important;
                    font-family: inherit;
                }

                .calendar-tile {
                    padding: 20px 10px !important;
                    position: relative;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .calendar-tile:hover {
                    background-color: #f3f4f6 !important;
                }

                .calendar-tile.selected {
                    background-color: #dbeafe !important;
                    border: 2px solid #3b82f6 !important;
                }

                .calendar-tile.blocked-booking {
                    background-color: #fee2e2 !important;
                }

                .calendar-tile.blocked-maintenance {
                    background-color: #fef3c7 !important;
                }

                .calendar-tile.blocked-manual {
                    background-color: #e5e7eb !important;
                }

                .calendar-tile.available {
                    background-color: #d1fae5 !important;
                }

                .tile-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }

                .block-indicator {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                }

                .price-indicator {
                    font-size: 10px;
                    font-weight: 600;
                    color: #1f2937;
                }
            `}</style>
        </div>
    );
};

export default AvailabilityCalendar;
