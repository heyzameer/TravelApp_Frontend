import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { partnerBookingService } from '../../services/partnerBookingService';
import type { Booking } from '../../types';

interface BookingsState {
    bookings: Booking[];
    currentBooking: Booking | null;
    loading: boolean;
    isLoading: boolean;
    error: string | null;
    filters: {
        status: string;
        approvalStatus: string;
        startDate: string;
        endDate: string;
        search: string;
    };
}

const initialState: BookingsState = {
    bookings: [],
    currentBooking: null,
    loading: false,
    isLoading: false,
    error: null,
    filters: {
        status: '',
        approvalStatus: '',
        startDate: '',
        endDate: '',
        search: '',
    },
};

// Async thunks
export const fetchPartnerBookings = createAsyncThunk(
    'bookings/fetchPartnerBookings',
    async (filters: {
        status?: string;
        approvalStatus?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    } | undefined, { rejectWithValue }) => {
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

export const checkInBooking = createAsyncThunk(
    'bookings/checkInBooking',
    async (bookingId: string, { rejectWithValue }) => {
        try {
            return await partnerBookingService.checkInBooking(bookingId);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to check in guest');
        }
    }
);

export const checkOutBooking = createAsyncThunk(
    'bookings/checkOutBooking',
    async (bookingId: string, { rejectWithValue }) => {
        try {
            return await partnerBookingService.checkOutBooking(bookingId);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to check out guest');
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

export const completeBooking = createAsyncThunk(
    'bookings/completeBooking',
    async (bookingId: string, { rejectWithValue }) => {
        try {
            return await partnerBookingService.completeBooking(bookingId);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to complete booking');
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

export const processRefund = createAsyncThunk(
    'bookings/processRefund',
    async ({ bookingId, approved, note }: { bookingId: string; approved: boolean; note?: string }, { rejectWithValue }) => {
        try {
            return await partnerBookingService.processRefund(bookingId, approved, note);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to process refund');
        }
    }
);

export const fetchAllBookings = createAsyncThunk(
    'bookings/fetchAllBookings',
    async (_, { rejectWithValue }) => {
        try {
            // Reusing getPartnerBookings for admin view if it's the same, 
            // otherwise we'd need an admin service call.
            return await partnerBookingService.getPartnerBookings();
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch all bookings');
        }
    }
);

// Alias for compatibility if needed
export const fetchAllBooking = fetchAllBookings;

export const deleteBooking = createAsyncThunk(
    'bookings/deleteBooking',
    async (bookingId: string, { rejectWithValue }) => {
        try {
            await partnerBookingService.deleteBooking(bookingId);
            return bookingId;
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to delete booking');
        }
    }
);

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<{
            status?: string;
            approvalStatus?: string;
            startDate?: string;
            endDate?: string;
            search?: string;
        }>) => {
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
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPartnerBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoading = false;
                state.bookings = action.payload;
            })
            .addCase(fetchPartnerBookings.rejected, (state, action) => {
                state.loading = false;
                state.isLoading = false;
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

        // Complete booking
        builder
            .addCase(completeBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(completeBooking.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.bookings.findIndex((b) => b._id === action.payload._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                if (state.currentBooking?._id === action.payload._id) {
                    state.currentBooking = action.payload;
                }
            })
            .addCase(completeBooking.rejected, (state, action) => {
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

        // Check In Booking
        builder
            .addCase(checkInBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkInBooking.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.bookings.findIndex((b) => b._id === action.payload._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                if (state.currentBooking?._id === action.payload._id) {
                    state.currentBooking = action.payload;
                }
            })
            .addCase(checkInBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Check Out Booking
        builder
            .addCase(checkOutBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkOutBooking.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.bookings.findIndex((b) => b._id === action.payload._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                if (state.currentBooking?._id === action.payload._id) {
                    state.currentBooking = action.payload;
                }
            })
            .addCase(checkOutBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Process refund
        builder
            .addCase(processRefund.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(processRefund.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.bookings.findIndex((b) => b._id === action.payload._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload;
                }
                if (state.currentBooking?._id === action.payload._id) {
                    state.currentBooking = action.payload;
                }
            })
            .addCase(processRefund.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch all bookings
        builder
            .addCase(fetchAllBookings.pending, (state) => {
                state.loading = true;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoading = false;
                state.bookings = action.payload;
            })
            .addCase(fetchAllBookings.rejected, (state, action) => {
                state.loading = false;
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete booking
        builder
            .addCase(deleteBooking.pending, (state) => {
                state.loading = true;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteBooking.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoading = false;
                state.bookings = state.bookings.filter(b => b._id !== action.payload);
            })
            .addCase(deleteBooking.rejected, (state, action) => {
                state.loading = false;
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setFilters, clearError, clearCurrentBooking } = bookingsSlice.actions;

export default bookingsSlice.reducer;
