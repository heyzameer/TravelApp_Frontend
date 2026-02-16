import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityService } from '../../services/activityService';
import { toast } from 'react-hot-toast';
import type { Activity } from '../../types';

interface ActivityState {
    activities: Activity[];
    loading: boolean;
    error: string | null;
}

const initialState: ActivityState = {
    activities: [],
    loading: false,
    error: null,
};

export const fetchActivities = createAsyncThunk(
    'activities/fetch',
    async (propertyId: string, { rejectWithValue }) => {
        try {
            return await activityService.getActivitiesByProperty(propertyId);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch activities');
        }
    }
);

export const createActivity = createAsyncThunk(
    'activities/create',
    async ({ propertyId, data }: { propertyId: string; data: Partial<Activity> }, { rejectWithValue }) => {
        try {
            const result = await activityService.createActivity(propertyId, data);
            toast.success('Activity created successfully');
            return result;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to create activity';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const deleteActivity = createAsyncThunk(
    'activities/delete',
    async (activityId: string, { rejectWithValue }) => {
        try {
            await activityService.deleteActivity(activityId);
            toast.success('Activity deleted');
            return activityId;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to delete activity';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const activitySlice = createSlice({
    name: 'activities',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchActivities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActivities.fulfilled, (state, action) => {
                state.loading = false;
                state.activities = action.payload;
            })
            .addCase(fetchActivities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createActivity.fulfilled, (state, action) => {
                state.activities.push(action.payload);
            })
            .addCase(deleteActivity.fulfilled, (state, action) => {
                state.activities = state.activities.filter(a => a._id !== action.payload);
            });
    },
});

export default activitySlice.reducer;
