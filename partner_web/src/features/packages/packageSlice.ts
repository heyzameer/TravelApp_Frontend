import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { packageService } from '../../services/packageService';
import { toast } from 'react-hot-toast';
import type { Package } from '../../types';

interface PackageState {
    packages: Package[];
    loading: boolean;
    error: string | null;
}

const initialState: PackageState = {
    packages: [],
    loading: false,
    error: null,
};

export const fetchPackages = createAsyncThunk(
    'packages/fetch',
    async (propertyId: string, { rejectWithValue }) => {
        try {
            return await packageService.getPackagesByProperty(propertyId);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch packages');
        }
    }
);

export const createPackage = createAsyncThunk(
    'packages/create',
    async ({ propertyId, data }: { propertyId: string; data: Partial<Package> }, { rejectWithValue }) => {
        try {
            const result = await packageService.createPackage(propertyId, data);
            toast.success('Package created successfully');
            return result;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to create package';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const deletePackage = createAsyncThunk(
    'packages/delete',
    async (packageId: string, { rejectWithValue }) => {
        try {
            await packageService.deletePackage(packageId);
            toast.success('Package deleted');
            return packageId;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to delete package';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const packageSlice = createSlice({
    name: 'packages',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPackages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPackages.fulfilled, (state, action) => {
                state.loading = false;
                state.packages = action.payload;
            })
            .addCase(fetchPackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createPackage.fulfilled, (state, action) => {
                state.packages.push(action.payload);
            })
            .addCase(deletePackage.fulfilled, (state, action) => {
                state.packages = state.packages.filter(p => p._id !== action.payload);
            });
    },
});

export default packageSlice.reducer;
