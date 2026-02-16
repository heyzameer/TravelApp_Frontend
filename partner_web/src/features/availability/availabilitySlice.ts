import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';
import type { CalendarDay, CustomPricing, AvailabilityCalendarResponse, ApiResponse } from '../../types';

interface AvailabilityState {
    calendar: CalendarDay[];
    loading: boolean;
    error: string | null;
    selectedMonth: number;
    selectedYear: number;
}

const initialState: AvailabilityState = {
    calendar: [],
    loading: false,
    error: null,
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear()
};

// Async Thunks

export const fetchAvailabilityCalendar = createAsyncThunk(
    'availability/fetchCalendar',
    async ({ roomId, month, year }: { roomId: string; month: number; year: number }, { rejectWithValue }) => {
        try {
            const response = await api.get<ApiResponse<AvailabilityCalendarResponse>>(
                `/rooms/${roomId}/availability?month=${month}&year=${year}`
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch availability calendar');
        }
    }
);

export const blockDates = createAsyncThunk(
    'availability/blockDates',
    async (
        { roomId, propertyId, dates, reason }: { roomId: string; propertyId: string; dates: string[]; reason: string },
        { rejectWithValue }
    ) => {
        try {
            await api.post<ApiResponse<void>>(
                `/rooms/${roomId}/block-dates`,
                { dates, reason, propertyId }
            );
            return { dates, reason };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to block dates');
        }
    }
);

export const unblockDates = createAsyncThunk(
    'availability/unblockDates',
    async ({ roomId, dates }: { roomId: string; dates: string[] }, { rejectWithValue }) => {
        try {
            await api.delete<ApiResponse<void>>(
                `/rooms/${roomId}/unblock-dates`,
                {
                    data: { dates }
                }
            );
            return { dates };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to unblock dates');
        }
    }
);

export const setCustomPricing = createAsyncThunk(
    'availability/setCustomPricing',
    async (
        { roomId, propertyId, date, pricing }: { roomId: string; propertyId: string; date: string; pricing: CustomPricing },
        { rejectWithValue }
    ) => {
        try {
            await api.put<ApiResponse<void>>(
                `/rooms/${roomId}/custom-pricing`,
                { date, propertyId, pricing }
            );
            return { date, pricing };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to set custom pricing');
        }
    }
);

// Slice

const availabilitySlice = createSlice({
    name: 'availability',
    initialState,
    reducers: {
        setSelectedMonth: (state, action: PayloadAction<{ month: number; year: number }>) => {
            state.selectedMonth = action.payload.month;
            state.selectedYear = action.payload.year;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Calendar
        builder.addCase(fetchAvailabilityCalendar.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAvailabilityCalendar.fulfilled, (state, action) => {
            state.loading = false;
            state.calendar = action.payload.calendar;
            state.selectedMonth = action.payload.month;
            state.selectedYear = action.payload.year;
        });
        builder.addCase(fetchAvailabilityCalendar.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            toast.error(action.payload as string);
        });

        // Block Dates
        builder.addCase(blockDates.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(blockDates.fulfilled, (state, action) => {
            state.loading = false;
            // Update calendar state optimistically
            const { dates, reason } = action.payload;
            dates.forEach(dateStr => {
                const dayIndex = state.calendar.findIndex(day => day.date === dateStr);
                if (dayIndex !== -1) {
                    state.calendar[dayIndex].isBlocked = true;
                    state.calendar[dayIndex].blockedReason = reason as 'booking' | 'maintenance' | 'manual';
                }
            });
            toast.success('Dates blocked successfully');
        });
        builder.addCase(blockDates.rejected, (state, action) => {
            state.loading = false;
            toast.error(action.payload as string);
        });

        // Unblock Dates
        builder.addCase(unblockDates.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(unblockDates.fulfilled, (state, action) => {
            state.loading = false;
            // Update calendar state optimistically
            const { dates } = action.payload;
            dates.forEach(dateStr => {
                const dayIndex = state.calendar.findIndex(day => day.date === dateStr);
                if (dayIndex !== -1) {
                    state.calendar[dayIndex].isBlocked = false;
                    state.calendar[dayIndex].blockedReason = undefined;
                }
            });
            toast.success('Dates unblocked successfully');
        });
        builder.addCase(unblockDates.rejected, (state, action) => {
            state.loading = false;
            toast.error(action.payload as string);
        });

        // Set Custom Pricing
        builder.addCase(setCustomPricing.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(setCustomPricing.fulfilled, (state, action) => {
            state.loading = false;
            const { date, pricing } = action.payload;
            const dayIndex = state.calendar.findIndex(day => day.date === date);
            if (dayIndex !== -1) {
                state.calendar[dayIndex].pricing = pricing;
            }
            toast.success('Custom pricing set successfully');
        });
        builder.addCase(setCustomPricing.rejected, (state, action) => {
            state.loading = false;
            toast.error(action.payload as string);
        });
    }
});

export const { setSelectedMonth, clearError } = availabilitySlice.actions;
export default availabilitySlice.reducer;
