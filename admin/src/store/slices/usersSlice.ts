import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { adminService } from '../../services/admin';
import { AxiosError } from 'axios';

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
    stats: {
        totalBookings: number;
        totalAmount: number;
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
    stats: {
        totalBookings: 0,
        totalAmount: 0,
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
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
            }
            return rejectWithValue('Failed to fetch users');
        }
    }
);



export const fetchUserById = createAsyncThunk(
    'users/fetchById',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await adminService.getUserById(userId);
            const user = response.data?.user || response.user;
            if (user && !user.id && user._id) {
                user.id = user._id;
            }
            return user;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
            }
            return rejectWithValue('Failed to fetch user');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/update',
    async ({ userId, userData }: { userId: string; userData: Partial<User> }, { rejectWithValue }) => {
        try {
            const response = await adminService.updateUser(userId, userData);
            console.log('updateUser response:', response);
            const user = response.data?.user || response.user;
            if (user && !user.id && user._id) {
                user.id = user._id;
            }
            return user;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to update user');
            }
            return rejectWithValue('Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (userId: string, { rejectWithValue }) => {
        try {
            await adminService.deleteUser(userId);
            return userId;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
            }
            return rejectWithValue('Failed to delete user');
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
                const rawUsers = action.payload.data.users.data || [];
                state.users = rawUsers.map((u: User) => ({
                    ...u,
                    id: u.id || u._id
                }));
                state.pagination = {
                    page: action.payload.data.users.pagination?.page || 1,
                    limit: action.payload.data.users.pagination?.limit || 10,
                    total: action.payload.data.users.pagination?.total || 0,
                };
                // Store global stats if provided
                if (action.payload.data.stats) {
                    state.stats = action.payload.data.stats;
                }
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
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                console.log('updateUser fulfilled:', action);
                state.isLoading = false;
                const updatedUser = action.payload;

                // Ensure id field is set
                if (updatedUser && !updatedUser.id && updatedUser._id) {
                    updatedUser.id = updatedUser._id;
                }

                const payloadId = updatedUser.id || updatedUser._id;

                // Update in users list
                const index = state.users.findIndex((user) => (user.id || user._id) === payloadId);
                if (index !== -1) {
                    state.users[index] = updatedUser;
                }

                // Update selectedUser if it matches
                const selectedId = state.selectedUser?.id || state.selectedUser?._id;
                if (selectedId && selectedId === payloadId) {
                    state.selectedUser = updatedUser;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Delete user
        builder
            .addCase(deleteUser.pending, (state) => {
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
