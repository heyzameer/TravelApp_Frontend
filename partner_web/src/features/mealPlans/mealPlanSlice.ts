import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mealPlanService } from '../../services/mealPlanService';
import { toast } from 'react-hot-toast';
import type { MealPlan } from '../../types';

interface MealPlanState {
    mealPlans: MealPlan[];
    loading: boolean;
    error: string | null;
}

const initialState: MealPlanState = {
    mealPlans: [],
    loading: false,
    error: null,
};

export const fetchMealPlans = createAsyncThunk(
    'mealPlans/fetchResult',
    async (propertyId: string, { rejectWithValue }) => {
        try {
            return await mealPlanService.getMealPlansByProperty(propertyId);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch meal plans');
        }
    }
);

export const createMealPlan = createAsyncThunk(
    'mealPlans/create',
    async ({ propertyId, data }: { propertyId: string; data: Partial<MealPlan> }, { rejectWithValue }) => {
        try {
            const result = await mealPlanService.createMealPlan(propertyId, data);
            toast.success('Meal plan created successfully');
            return result;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to create meal plan';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const deleteMealPlan = createAsyncThunk(
    'mealPlans/delete',
    async (mealPlanId: string, { rejectWithValue }) => {
        try {
            await mealPlanService.deleteMealPlan(mealPlanId);
            toast.success('Meal plan deleted');
            return mealPlanId;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to delete meal plan';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const mealPlanSlice = createSlice({
    name: 'mealPlans',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchMealPlans.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMealPlans.fulfilled, (state, action) => {
                state.loading = false;
                state.mealPlans = action.payload;
            })
            .addCase(fetchMealPlans.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createMealPlan.fulfilled, (state, action) => {
                state.mealPlans.push(action.payload);
            })
            // Delete
            .addCase(deleteMealPlan.fulfilled, (state, action) => {
                state.mealPlans = state.mealPlans.filter(mp => mp._id !== action.payload);
            });
    },
});

export default mealPlanSlice.reducer;
