import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../services/admin';
import { AxiosError } from 'axios';

import type { Booking } from '../../types';

interface BookingsState {
    bookings: Booking[];
    pendingBookings: Booking[];
    confirmedBookings: Booking[];
    completedBookings: Booking[];
    selectedBooking: Booking | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: BookingsState = {
    bookings: [],
    pendingBookings: [],
    confirmedBookings: [],
    completedBookings: [],
    selectedBooking: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchAllBookings = createAsyncThunk(
    'bookings/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminService.getAllBookings();
            return response.data.bookings || [];
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
            }
            return rejectWithValue('Failed to fetch bookings');
        }
    }
);

export const fetchBookingById = createAsyncThunk(
    'bookings/fetchById',
    async (bookingId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.getBookingById(bookingId);
            return response.data.booking;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
            }
            return rejectWithValue('Failed to fetch booking');
        }
    }
);

export const updateBooking = createAsyncThunk(
    'bookings/update',
    async (
        { bookingId, bookingData }: { bookingId: string; bookingData: Partial<Booking> },
        { rejectWithValue }
    ) => {
        try {
            const response = await adminService.updateBooking(bookingId, bookingData);
            return response.data.booking;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to update booking');
            }
            return rejectWithValue('Failed to update booking');
        }
    }
);

export const updateBookingStatus = createAsyncThunk(
    'bookings/updateStatus',
    async (
        { bookingId, status }: { bookingId: string; status: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await adminService.updateBooking(bookingId, { status });
            return response.data.booking;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to update booking status');
            }
            return rejectWithValue('Failed to update booking status');
        }
    }
);

export const deleteBooking = createAsyncThunk(
    'bookings/delete',
    async (bookingId: string, { rejectWithValue }) => {
        try {
            await adminService.deleteBooking(bookingId);
            return bookingId;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to delete booking');
            }
            return rejectWithValue('Failed to delete booking');
        }
    }
);

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedBooking: (state) => {
            state.selectedBooking = null;
        },
        filterBookingsByStatus: (state) => {
            state.pendingBookings = state.bookings.filter((b) => b.status === 'pending');
            state.confirmedBookings = state.bookings.filter((b) => b.status === 'confirmed');
            state.completedBookings = state.bookings.filter((b) => b.status === 'completed');
        },
    },
    extraReducers: (builder) => {
        // Fetch all bookings
        builder
            .addCase(fetchAllBookings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllBookings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bookings = action.payload;
                // Auto-filter by status
                state.pendingBookings = action.payload.filter((b: Booking) => b.status === 'pending');
                state.confirmedBookings = action.payload.filter((b: Booking) => b.status === 'confirmed');
                state.completedBookings = action.payload.filter((b: Booking) => b.status === 'completed');
            })
            .addCase(fetchAllBookings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch booking by ID
        builder
            .addCase(fetchBookingById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBookingById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedBooking = action.payload;
            })
            .addCase(fetchBookingById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update booking
        builder
            .addCase(updateBooking.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateBooking.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.bookings.findIndex((b) => b.id === action.payload.id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                if (state.selectedBooking?.id === action.payload.id) {
                    state.selectedBooking = action.payload;
                }
                // Re-filter by status
                state.pendingBookings = state.bookings.filter((b) => b.status === 'pending');
                state.confirmedBookings = state.bookings.filter((b) => b.status === 'confirmed');
                state.completedBookings = state.bookings.filter((b) => b.status === 'completed');
            })
            .addCase(updateBooking.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update booking status
        builder
            .addCase(updateBookingStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.bookings.findIndex((b) => b.id === action.payload.id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                if (state.selectedBooking?.id === action.payload.id) {
                    state.selectedBooking = action.payload;
                }
                // Re-filter by status
                state.pendingBookings = state.bookings.filter((b) => b.status === 'pending');
                state.confirmedBookings = state.bookings.filter((b) => b.status === 'confirmed');
                state.completedBookings = state.bookings.filter((b) => b.status === 'completed');
            })
            .addCase(updateBookingStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete booking
        builder
            .addCase(deleteBooking.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteBooking.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bookings = state.bookings.filter((b) => b.id !== action.payload);
                state.pendingBookings = state.pendingBookings.filter((b) => b.id !== action.payload);
                state.confirmedBookings = state.confirmedBookings.filter((b) => b.id !== action.payload);
                state.completedBookings = state.completedBookings.filter((b) => b.id !== action.payload);
                if (state.selectedBooking?.id === action.payload) {
                    state.selectedBooking = null;
                }
            })
            .addCase(deleteBooking.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSelectedBooking, filterBookingsByStatus } = bookingsSlice.actions;

export default bookingsSlice.reducer;
