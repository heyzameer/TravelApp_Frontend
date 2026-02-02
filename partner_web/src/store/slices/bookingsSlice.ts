import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { partnerBookingService } from '../../services/partnerBookingService';
import type { Booking } from '../../types';

interface BookingsState {
    bookings: Booking[];
    currentBooking: Booking | null;
    loading: boolean;
    error: string | null;
    filters: {
        status: string;
        approvalStatus: string;
    };
}

const initialState: BookingsState = {
    bookings: [],
    currentBooking: null,
    loading: false,
    error: null,
    filters: {
        status: '',
        approvalStatus: '',
    },
};

// Async thunks
export const fetchPartnerBookings = createAsyncThunk(
    'bookings/fetchPartnerBookings',
    async (filters: { status?: string; approvalStatus?: string } | undefined, { rejectWithValue }) => {
        try {
            return await partnerBookingService.getPartnerBookings(filters);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings');
        }
    }
);

export const fetchBookingDetails = createAsyncThunk(
    'bookings/fetchBookingDetails',
    async (bookingId: string, { rejectWithValue }) => {
        try {
            return await partnerBookingService.getBookingDetails(bookingId);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch booking details');
        }
    }
);

export const approveBooking = createAsyncThunk(
    'bookings/approveBooking',
    async (bookingId: string, { rejectWithValue }) => {
        try {
            return await partnerBookingService.approveBooking(bookingId);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to approve booking');
        }
    }
);

export const rejectBooking = createAsyncThunk(
    'bookings/rejectBooking',
    async ({ bookingId, reason }: { bookingId: string; reason: string }, { rejectWithValue }) => {
        try {
            return await partnerBookingService.rejectBooking(bookingId, reason);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to reject booking');
        }
    }
);

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<{ status?: string; approvalStatus?: string }>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentBooking: (state) => {
            state.currentBooking = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all bookings
        builder
            .addCase(fetchPartnerBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPartnerBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload;
            })
            .addCase(fetchPartnerBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch booking details
        builder
            .addCase(fetchBookingDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookingDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBooking = action.payload;
            })
            .addCase(fetchBookingDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Approve booking
        builder
            .addCase(approveBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveBooking.fulfilled, (state, action) => {
                state.loading = false;
                // Update in list
                const index = state.bookings.findIndex((b) => b._id === action.payload._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                // Update current if selected
                if (state.currentBooking?._id === action.payload._id) {
                    state.currentBooking = action.payload;
                }
            })
            .addCase(approveBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Reject booking
        builder
            .addCase(rejectBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectBooking.fulfilled, (state, action) => {
                state.loading = false;
                // Update in list
                const index = state.bookings.findIndex((b) => b._id === action.payload._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                // Update current if selected
                if (state.currentBooking?._id === action.payload._id) {
                    state.currentBooking = action.payload;
                }
            })
            .addCase(rejectBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setFilters, clearError, clearCurrentBooking } = bookingsSlice.actions;

export default bookingsSlice.reducer;
