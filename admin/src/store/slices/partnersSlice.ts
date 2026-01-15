import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PartnerUser } from '../../types';
import { adminService } from '../../services/admin';

interface PartnersState {
    partners: PartnerUser[];
    partnerRequests: PartnerUser[];
    selectedPartner: PartnerUser | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: PartnersState = {
    partners: [],
    partnerRequests: [],
    selectedPartner: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchAllPartners = createAsyncThunk(
    'partners/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminService.getAllPartners();
            console.log('Fetch All Partners Response:', response);
            return response.data.partners.data || [];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch partners');
        }
    }
);

export const fetchPartnerRequests = createAsyncThunk(
    'partners/fetchRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminService.getAllPartnersRequest();
            return response.partners || [];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch partner requests');
        }
    }
);

export const fetchPartnerById = createAsyncThunk(
    'partners/fetchById',
    async (partnerId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.getPartnerById(partnerId);
            return response.partner;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch partner');
        }
    }
);

export const updatePartner = createAsyncThunk(
    'partners/update',
    async (
        { partnerId, partnerData }: { partnerId: string; partnerData: any },
        { rejectWithValue }
    ) => {
        try {
            const response = await adminService.updatePartner(partnerId, partnerData);
            return response.data.partner;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update partner');
        }
    }
);

export const approvePartner = createAsyncThunk(
    'partners/approve',
    async (partnerId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.updatePartner(partnerId, {
                status: 'verified',
                isVerified: true,
            });
            return response.partner;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve partner');
        }
    }
);

export const rejectPartner = createAsyncThunk(
    'partners/reject',
    async (partnerId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.updatePartner(partnerId, {
                status: 'rejected',
                isVerified: false,
            });
            return response.partner;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject partner');
        }
    }
);

export const deletePartner = createAsyncThunk(
    'partners/delete',
    async (partnerId: string, { rejectWithValue }) => {
        try {
            await adminService.deletePartner(partnerId);
            return partnerId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete partner');
        }
    }
);

export const sendPartnerEmail = createAsyncThunk(
    'partners/sendEmail',
    async (emailData: { email: string; subject: string; message: string }, { rejectWithValue }) => {
        try {
            const response = await adminService.sendPartnerEmail(emailData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send email');
        }
    }
);

const partnersSlice = createSlice({
    name: 'partners',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedPartner: (state) => {
            state.selectedPartner = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all partners
        builder
            .addCase(fetchAllPartners.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllPartners.fulfilled, (state, action) => {
                state.isLoading = false;
                state.partners = action.payload;
            })
            .addCase(fetchAllPartners.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch partner requests
        builder
            .addCase(fetchPartnerRequests.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPartnerRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.partnerRequests = action.payload;
            })
            .addCase(fetchPartnerRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch partner by ID
        builder
            .addCase(fetchPartnerById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPartnerById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedPartner = action.payload;
            })
            .addCase(fetchPartnerById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update partner
        builder
            .addCase(updatePartner.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updatePartner.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.partners.findIndex((p) => p._id === action.payload._id);
                if (index !== -1) {
                    state.partners[index] = action.payload;
                }
                if (state.selectedPartner?._id === action.payload._id) {
                    state.selectedPartner = action.payload;
                }
            })
            .addCase(updatePartner.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Approve partner
        builder
            .addCase(approvePartner.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(approvePartner.fulfilled, (state, action) => {
                state.isLoading = false;
                state.partnerRequests = state.partnerRequests.filter((p) => p._id !== action.payload._id);
                state.partners.push(action.payload);
            })
            .addCase(approvePartner.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Reject partner
        builder
            .addCase(rejectPartner.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(rejectPartner.fulfilled, (state, action) => {
                state.isLoading = false;
                state.partnerRequests = state.partnerRequests.filter((p) => p._id !== action.payload._id);
            })
            .addCase(rejectPartner.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete partner
        builder
            .addCase(deletePartner.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deletePartner.fulfilled, (state, action) => {
                state.isLoading = false;
                state.partners = state.partners.filter((p) => p._id !== action.payload);
                if (state.selectedPartner?._id === action.payload) {
                    state.selectedPartner = null;
                }
            })
            .addCase(deletePartner.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Send partner email
        builder
            .addCase(sendPartnerEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(sendPartnerEmail.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(sendPartnerEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSelectedPartner } = partnersSlice.actions;

export default partnersSlice.reducer;
