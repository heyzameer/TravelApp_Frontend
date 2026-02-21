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
                // Deduplicate incoming bookings by _id or id
                const uniqueBookings = action.payload.reduce((acc: Booking[], current: Booking) => {
                    const currentId = current._id || current.id;
                    const exists = acc.find(item => (item._id || item.id) === currentId);
                    if (!exists) {
                        acc.push(current);
                    }
                    return acc;
                }, []);

                state.bookings = uniqueBookings;
                // Auto-filter by status
                state.pendingBookings = uniqueBookings.filter((b: Booking) => b.status === 'pending');
                state.confirmedBookings = uniqueBookings.filter((b: Booking) => b.status === 'confirmed');
                state.completedBookings = uniqueBookings.filter((b: Booking) => b.status === 'completed');
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
                state.error = null;
            })
            .addCase(updateBooking.fulfilled, (state, action) => {
                const payloadId = action.payload._id || action.payload.id;
                const index = state.bookings.findIndex((b) => (b._id || b.id) === payloadId);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                const selectedId = state.selectedBooking?._id || state.selectedBooking?.id;
                if (selectedId === payloadId) {
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
                state.error = null;
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const payloadId = action.payload._id || action.payload.id;
                const index = state.bookings.findIndex((b) => (b._id || b.id) === payloadId);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                const selectedId = state.selectedBooking?._id || state.selectedBooking?.id;
                if (selectedId === payloadId) {
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
                state.error = null;
            })
            .addCase(deleteBooking.fulfilled, (state, action) => {
                state.isLoading = false;
                const deletedId = action.payload;
                state.bookings = state.bookings.filter((b) => (b._id !== deletedId && b.id !== deletedId));
                state.pendingBookings = state.pendingBookings.filter((b) => (b._id !== deletedId && b.id !== deletedId));
                state.confirmedBookings = state.confirmedBookings.filter((b) => (b._id !== deletedId && b.id !== deletedId));
                state.completedBookings = state.completedBookings.filter((b) => (b._id !== deletedId && b.id !== deletedId));
                const selectedId = state.selectedBooking?._id || state.selectedBooking?.id;
                if (selectedId === deletedId) {
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
