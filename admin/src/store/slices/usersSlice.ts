import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { adminService } from '../../services/admin';

interface UsersState {
    users: User[];
    selectedUser: User | null;
    isLoading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

const initialState: UsersState = {
    users: [],
    selectedUser: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
    },
};

// Async thunks
export const fetchAllUsers = createAsyncThunk(
    'users/fetchAll',
    async (
        params: { page?: number; limit?: number; role?: string; status?: string } = {},
        { rejectWithValue }
    ) => {
        try {
            const response = await adminService.getAllUsers(
                { page: params.page || 1, limit: params.limit || 10 },
                { role: params.role, status: params.status }
            );
            console.log('fetchAllUsers:', response);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);



export const fetchUserById = createAsyncThunk(
    'users/fetchById',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.getUserById(userId);
            return response.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/update',
    async ({ userId, userData }: { userId: string; userData: any }, { rejectWithValue }) => {
        try {
            const response = await adminService.updateUser(userId, userData);
            console.log('updateUser response:', response);
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (userId: string, { rejectWithValue }) => {
        try {
            await adminService.deleteUser(userId);
            return userId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all users
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                console.log('fetchAllUsers fulfilled:', action.payload);
                state.isLoading = false;
                state.users = action.payload.data.users.data  || [];
                state.pagination = {
                    page: action.payload.pagination?.page || 1,
                    limit: action.payload.pagination?.limit || 10,
                    total: action.payload.pagination?.total || 0,
                };
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch user by ID
        builder
            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update user
        builder
            .addCase(updateUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                console.log('updateUser fulfilled:', action);
                state.isLoading = false;
                const index = state.users.findIndex((user) => user.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete user
        builder
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = state.users.filter((user) => user.id !== action.payload);
                if (state.selectedUser?.id === action.payload) {
                    state.selectedUser = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearSelectedUser } = usersSlice.actions;

export default usersSlice.reducer;
