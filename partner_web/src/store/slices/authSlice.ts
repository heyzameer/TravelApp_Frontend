import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User, LoginCredentials, PartnerRegistrationData } from '../../types';
import { authService } from '../../services/auth';
import { partnerAuthService } from '../../services/partnerAuth';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const user = await authService.login(credentials);
      return user;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await authService.adminLoginService(credentials.email, credentials.password);
      return user;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Admin login failed');
    }
  }
);

export const partnerRegister = createAsyncThunk(
  'auth/partnerRegister',
  async (data: PartnerRegistrationData, { rejectWithValue }) => {
    try {
      const response = await partnerAuthService.registerPartner(data);
      return response.user;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Partner registration failed');
    }
  }
);

export const partnerLoginVerify = createAsyncThunk(
  'auth/partnerLoginVerify',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await partnerAuthService.verifyLoginOtp(email, otp);
      return response.user;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Partner verification failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return rejectWithValue('No user found');
      }
      return user;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to get current user');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await authService.refreshAccessToken();
      if (!token) {
        return rejectWithValue('Token refresh failed');
      }
      return token;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Admin Login
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Partner Register
    builder
      .addCase(partnerRegister.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(partnerRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(partnerRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Partner Login Verify
    builder
      .addCase(partnerLoginVerify.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(partnerLoginVerify.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(partnerLoginVerify.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;

export default authSlice.reducer;