import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../services/admin';
import { AxiosError } from 'axios';

import type { Property } from '../../types';

interface PropertiesState {
    properties: Property[];
    selectedProperty: Property | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: PropertiesState = {
    properties: [],
    selectedProperty: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchAllProperties = createAsyncThunk(
    'properties/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminService.getAllProperties();
            // response is { success: true, data: { properties: [] } }
            return response.data?.properties || response.properties || [];
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
            }
            return rejectWithValue('Failed to fetch properties');
        }
    }
);

export const fetchPropertyById = createAsyncThunk(
    'properties/fetchById',
    async (propertyId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.getPropertyById(propertyId);
            // response matches ApiResponse<T> from backend: { success: true, data: { property: ... } }
            // adminService returns response.data (the body)
            return response.data?.property || response.property;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch property');
            }
            return rejectWithValue('Failed to fetch property');
        }
    }
);

export const addProperty = createAsyncThunk(
    'properties/add',
    async (propertyData: Partial<Property>, { rejectWithValue }) => {
        try {
            const response = await adminService.createProperty(propertyData);
            return response.data?.property || response.property;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to add property');
            }
            return rejectWithValue('Failed to add property');
        }
    }
);

export const updateProperty = createAsyncThunk(
    'properties/update',
    async (
        { propertyId, propertyData }: { propertyId: string; propertyData: Partial<Property> },
        { rejectWithValue }
    ) => {
        try {
            const response = await adminService.updateProperty(propertyId, propertyData);
            return response.data?.property || response.property;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to update property');
            }
            return rejectWithValue('Failed to update property');
        }
    }
);

export const deleteProperty = createAsyncThunk(
    'properties/delete',
    async (propertyId: string, { rejectWithValue }) => {
        try {
            await adminService.deleteProperty(propertyId);
            return propertyId;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
            }
            return rejectWithValue('Failed to delete property');
        }
    }
);

export const togglePropertyStatus = createAsyncThunk(
    'properties/toggleStatus',
    async (
        { propertyId, isActive }: { propertyId: string; isActive: boolean },
        { rejectWithValue }
    ) => {
        try {
            const response = await adminService.updateProperty(propertyId, { isActive });
            return response.data?.property || response.property;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to toggle property status');
            }
            return rejectWithValue('Failed to toggle property status');
        }
    }
);

export const updatePropertyDocumentStatus = createAsyncThunk(
    'properties/updateDocumentStatus',
    async (
        { propertyId, section, status, rejectionReason }: { propertyId: string; section: string; status: 'approved' | 'rejected'; rejectionReason?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await adminService.updatePropertyDocumentStatus(propertyId, section, status, rejectionReason);
            return response.data?.property || response.property;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to update document status');
            }
            return rejectWithValue('Failed to update document status');
        }
    }
);

export const verifyProperty = createAsyncThunk(
    'properties/verify',
    async (
        { propertyId, status, rejectionReason }: { propertyId: string; status: 'verified' | 'rejected' | 'suspended'; rejectionReason?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await adminService.verifyProperty(propertyId, status, rejectionReason);
            return response.data?.property || response.property;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to verify property');
            }
            return rejectWithValue('Failed to verify property');
        }
    }
);

const propertiesSlice = createSlice({
    name: 'properties',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedProperty: (state) => {
            state.selectedProperty = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all properties
        builder
            .addCase(fetchAllProperties.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllProperties.fulfilled, (state, action) => {
                state.isLoading = false;
                state.properties = action.payload;
            })
            .addCase(fetchAllProperties.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch property by ID
        builder
            .addCase(fetchPropertyById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPropertyById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedProperty = action.payload;
            })
            .addCase(fetchPropertyById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Add property
        builder
            .addCase(addProperty.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addProperty.fulfilled, (state, action) => {
                state.isLoading = false;
                state.properties.push(action.payload);
            })
            .addCase(addProperty.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update property
        builder
            .addCase(updateProperty.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProperty.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.properties.findIndex((p) => p._id === action.payload._id);
                if (index !== -1) {
                    state.properties[index] = action.payload;
                }
                if (state.selectedProperty?._id === action.payload._id) {
                    state.selectedProperty = action.payload;
                }
            })
            .addCase(updateProperty.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete property
        builder
            .addCase(deleteProperty.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProperty.fulfilled, (state, action) => {
                state.isLoading = false;
                state.properties = state.properties.filter((p) => p._id !== action.payload);
                if (state.selectedProperty?._id === action.payload) {
                    state.selectedProperty = null;
                }
            })
            .addCase(deleteProperty.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Toggle property status
        builder
            .addCase(togglePropertyStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(togglePropertyStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.properties.findIndex((p) => p._id === action.payload._id);
                if (index !== -1) {
                    state.properties[index] = action.payload;
                }
                if (state.selectedProperty?._id === action.payload._id) {
                    state.selectedProperty = action.payload;
                }
            })
            .addCase(togglePropertyStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update document status
        builder
            .addCase(updatePropertyDocumentStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updatePropertyDocumentStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.properties.findIndex((p) => p._id === action.payload._id);
                if (index !== -1) {
                    state.properties[index] = action.payload;
                }
                if (state.selectedProperty?._id === action.payload._id) {
                    state.selectedProperty = action.payload;
                }
            })
            .addCase(updatePropertyDocumentStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Verify property
        builder
            .addCase(verifyProperty.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyProperty.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.properties.findIndex((p) => p._id === action.payload._id);
                if (index !== -1) {
                    state.properties[index] = action.payload;
                }
                if (state.selectedProperty?._id === action.payload._id) {
                    state.selectedProperty = action.payload;
                }
            })
            .addCase(verifyProperty.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSelectedProperty } = propertiesSlice.actions;

export default propertiesSlice.reducer;
