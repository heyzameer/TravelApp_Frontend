'use client';

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { consumerApi } from '@/services/consumerApi';
import { Loader2 } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface AvailabilityProps {
    roomId: string; // The specific room to check availability for
    onDateSelect: (startDate: Date, endDate: Date) => void;
}

interface BlockedDate {
    date: string;
    reason: string;
}

export const AvailabilityCalendar: React.FC<AvailabilityProps> = ({ roomId, onDateSelect }) => {
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!roomId) return;
            setLoading(true);
            try {
                // Fetch next 3 months availability
                const start = new Date();
                const end = addDays(start, 90);

                const data = await consumerApi.checkRoomAvailability(
                    roomId,
                    start.toISOString().split('T')[0],
                    end.toISOString().split('T')[0]
                );

                const blocked: BlockedDate[] = [];
                if (data && data.availability) {
                    Object.keys(data.availability).forEach((dateStr) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const dayData = (data.availability as any)[dateStr];
                        // If blocked or no inventory (assuming 1 for now if inventory not managed per room count details here)
                        // Backend availability response structure: { "YYYY-MM-DD": { price: number, inventory: number, isBlocked: boolean } }
                        if (dayData.isBlocked || dayData.inventory === 0) {
                            blocked.push({ date: dateStr, reason: 'Unavailable' });
                        }
                    });
                }
                setBlockedDates(blocked);
            } catch (error) {
                console.error("Failed to fetch availability", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [roomId]);

    const isTileDisabled = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            // Disable past dates
            if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;

            // Disable blocked dates
            const dateStr = format(date, 'yyyy-MM-dd');
            return blockedDates.some(bd => bd.date === dateStr);
        }
        return false;
    };

    const handleChange = (value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (Array.isArray(value)) {
            const [start, end] = value;
            setDateRange([start, end]);
            onDateSelect(start, end);
        } else {
            // Handle single date click - maybe reset or start range?
            // React-Calendar with selectRange=true returns array of [start, end]
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Dates</h3>
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-emerald-500" />
                </div>
            ) : (
                <div className="calendar-wrapper">
                    <Calendar
                        onChange={handleChange}
                        value={dateRange}
                        selectRange={true}
                        tileDisabled={isTileDisabled}
                        minDate={new Date()}
                        className="w-full border-none !font-sans"
                    />
                </div>
            )}
            <style jsx global>{`
                .react-calendar {
                    width: 100%;
                    border: none;
                    font-family: inherit;
                }
                .react-calendar__tile--active {
                    background: #10b981 !important;
                    color: white !important;
                }
                .react-calendar__tile--now {
                    background: #ecfdf5;
                    color: #047857;
                }
                .react-calendar__tile--active:enabled:hover,
                .react-calendar__tile--active:enabled:focus {
                    background: #059669 !important;
                }
            `}</style>
        </div>
    );
};
