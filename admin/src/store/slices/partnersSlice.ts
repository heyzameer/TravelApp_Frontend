import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PartnerUser } from '../../types';
import { adminService } from '../../services/admin';
import { AxiosError } from 'axios';

interface PartnersState {
    partners: PartnerUser[];
    partnerRequests: PartnerUser[];
    selectedPartner: PartnerUser | null;
    isLoading: boolean;
    error: string | null;
    aadharStatusFilter: 'all' | 'not_submitted' | 'manual_review' | 'approved' | 'rejected';
    totalPartners: number;
    currentPage: number;
    totalPages: number;
}

const initialState: PartnersState = {
    partners: [],
    partnerRequests: [],
    selectedPartner: null,
    isLoading: false,
    error: null,
    aadharStatusFilter: 'all',
    totalPartners: 0,
    currentPage: 1,
    totalPages: 1,
};

// Async thunks
export const fetchAllPartners = createAsyncThunk(
    'partners/fetchAll',
    async (params: { page?: number; limit?: number; search?: string; aadharStatus?: string } | undefined, { rejectWithValue }) => {
        try {
            const response = await adminService.getAllPartners({
                page: params?.page,
                limit: params?.limit,
                search: params?.search,
                aadharStatus: params?.aadharStatus && params.aadharStatus !== 'all' ? params.aadharStatus : undefined
            });
            console.log('Fetch All Partners Response:', response);
            // The response structure seems to be { success: true, data: { partners: { data: [], total: X, page: Y, totalPages: Z } } }
            return response.data.partners;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch partners');
            }
            return rejectWithValue('Failed to fetch partners');
        }
    }
);

export const fetchPartnerRequests = createAsyncThunk(
    'partners/fetchRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminService.getAllPartnersRequest();
            // response is { success: true, data: { partners: { data: [...] } } }
            // Access response.data.partners.data if paginated, or response.data.partners if array
            const partnersData = response.data?.partners?.data || response.data?.partners || [];
            return partnersData;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch partner requests');
            }
            return rejectWithValue('Failed to fetch partner requests');
        }
    }
);

export const fetchPartnerById = createAsyncThunk(
    'partners/fetchById',
    async (partnerId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.getPartnerById(partnerId);
            return response.partner;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch partner');
            }
            return rejectWithValue('Failed to fetch partner');
        }
    }
);

export const fetchPartnerVerificationDetails = createAsyncThunk(
    'partners/fetchVerificationDetails',
    async (partnerId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.getPartnerVerificationDetails(partnerId);
            // response is { success: true, data: { partner: ... } }
            // We want to return the partner object directly
            return response.data?.partner || response.partner || response;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch partner verification details');
            }
            return rejectWithValue('Failed to fetch partner verification details');
        }
    }
);

export const updatePartner = createAsyncThunk(
    'partners/update',
    async (
        { partnerId, partnerData }: { partnerId: string; partnerData: Partial<PartnerUser> },
        { rejectWithValue }
    ) => {
        try {
            const response = await adminService.updatePartner(partnerId, partnerData);
            return response.data?.partner || response.partner || response;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to update partner');
            }
            return rejectWithValue('Failed to update partner');
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
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to approve partner');
            }
            return rejectWithValue('Failed to approve partner');
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
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to reject partner');
            }
            return rejectWithValue('Failed to reject partner');
        }
    }
);

export const deletePartner = createAsyncThunk(
    'partners/delete',
    async (partnerId: string, { rejectWithValue }) => {
        try {
            await adminService.deletePartner(partnerId);
            return partnerId;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to delete partner');
            }
            return rejectWithValue('Failed to delete partner');
        }
    }
);

export const verifyPartnerAadhaar = createAsyncThunk(
    'partners/verifyAadhaar',
    async ({ partnerId, action, reason }: { partnerId: string; action: 'approve' | 'reject'; reason?: string }, { rejectWithValue }) => {
        try {
            const response = await adminService.verifyPartnerAadhaar(partnerId, action, reason);
            return response.data?.partner || response.partner || response;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to verify partner aadhaar');
            }
            return rejectWithValue('Failed to verify partner aadhaar');
        }
    }
);

export const sendPartnerEmail = createAsyncThunk(
    'partners/sendEmail',
    async (emailData: { email: string; subject: string; message: string }, { rejectWithValue }) => {
        try {
            const response = await adminService.sendPartnerEmail(emailData);
            return response;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to send email');
            }
            return rejectWithValue('Failed to send email');
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
        setAadharStatusFilter: (state, action) => {
            state.aadharStatusFilter = action.payload;
        },
        updatePartnerInStore: (state, action) => {
            const updatedPartner = action.payload;
            const index = state.partners.findIndex(p => p._id === updatedPartner._id);
            if (index !== -1) {
                state.partners[index] = { ...state.partners[index], ...updatedPartner };
            }
            if (state.selectedPartner?._id === updatedPartner._id) {
                state.selectedPartner = { ...state.selectedPartner, ...updatedPartner };
            }
        }
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
                state.partners = action.payload.data || [];
                state.totalPartners = action.payload.pagination?.total || state.partners.length;
                state.currentPage = action.payload.pagination?.page || 1;
                state.totalPages = action.payload.pagination?.pages || 1;
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
            })

            // Fetch partner verification details
            .addCase(fetchPartnerVerificationDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPartnerVerificationDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedPartner = action.payload; // Update selectedPartner with details
            })
            .addCase(fetchPartnerVerificationDetails.rejected, (state, action) => {
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
            })
            // Verify Partner Aadhaar
            .addCase(verifyPartnerAadhaar.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyPartnerAadhaar.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.partners.findIndex((p) => p._id === action.payload._id);
                if (index !== -1) {
                    state.partners[index] = action.payload;
                }
                if (state.selectedPartner?._id === action.payload._id) {
                    state.selectedPartner = action.payload;
                }
            })
            .addCase(verifyPartnerAadhaar.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSelectedPartner, setAadharStatusFilter, updatePartnerInStore } = partnersSlice.actions;

export default partnersSlice.reducer;
