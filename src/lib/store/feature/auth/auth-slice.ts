import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  rememberMe: boolean;
}

interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  verificationCode?: string;
}

interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number; // in seconds
  rememberMe: boolean;
}

// Helper to check for window object
const isBrowser = typeof window !== "undefined";

// Enhanced Auth Persistence Helper
const AuthPersistence = {
  getStorage: (rememberMe: boolean) => {
    if (!isBrowser) return null;
    return rememberMe ? localStorage : sessionStorage;
  },
  saveAuthData: (token: string, expiresIn: number, rememberMe: boolean) => {
    if (!isBrowser) return;
    
    const storage = rememberMe ? localStorage : sessionStorage;
    const expirationDate = new Date(Date.now() + expiresIn * 1000).toISOString();
    
    storage.setItem('token', token);
    storage.setItem('token_expiration', expirationDate);
  
    // Only set rememberMe in localStorage if true
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    }
  }
  ,
  clearAuthData: () => {
    if (!isBrowser) return;
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiration');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('token_expiration');
  },

  getInitialAuthState: (): Omit<AuthState, 'loading' | 'error'> => {
    if (!isBrowser) return { user: null, token: null, rememberMe: false };

    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    
    const token = storage.getItem('token');
    const expiration = storage.getItem('token_expiration');

    if (token && expiration) {
      const isExpired = new Date(expiration) < new Date();
      if (!isExpired) {
        return { user: null, token, rememberMe };
      }
      AuthPersistence.clearAuthData();
    }

    return { user: null, token: null, rememberMe: false };
  }
};

// Initial State
const initialState: AuthState = {
  ...AuthPersistence.getInitialAuthState(),
  loading: false,
  error: null,
};

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
          rememberMe: payload.rememberMe // Ensure this is included
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      return data; // The API response already contains rememberMe
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);
export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const fetchUserData = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch user');
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.rememberMe = false;
      AuthPersistence.clearAuthData();
    },
    clearError: (state) => {
      state.error = null;
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
      if (isBrowser) {
        action.payload
          ? localStorage.setItem('rememberMe', 'true')
          : localStorage.removeItem('rememberMe');
      }
    },
    hydrateAuth: (state) => {
      const hydratedState = AuthPersistence.getInitialAuthState();
      return { ...state, ...hydratedState };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     // In your loginUser.fulfilled case
.addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
  state.loading = false;
  state.user = action.payload.user;
  state.token = action.payload.token;
  state.rememberMe = action.payload.rememberMe;
  
  // Clear all existing auth data first
  AuthPersistence.clearAuthData();

  // Only save data if rememberMe is true
  if (action.payload.rememberMe) {
    AuthPersistence.saveAuthData(
      action.payload.token,
      action.payload.expiresIn,
      true
    );
  }
})
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserData.rejected, (state) => {
        state.loading = false;
      });
  },
});

// Actions
export const { logout, clearError, hydrateAuth, setRememberMe } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectRememberMe = (state: { auth: AuthState }) => state.auth.rememberMe;
export const selectIsAuthenticated = (state: { auth: AuthState }) => {
  if (!isBrowser || !state.auth.token) return false;
  
  const storage = AuthPersistence.getStorage(state.auth.rememberMe);
  if (!storage) return false;

  const expiration = storage.getItem('token_expiration');
  return expiration ? new Date(expiration) > new Date() : false;
};

export default authSlice.reducer;