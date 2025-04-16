import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  rememberMe: boolean;
  isAuthenticated: boolean;
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

interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
  rememberMe: boolean;
}

const isBrowser = typeof window !== 'undefined';

const AuthPersistence = {
  getStorage: (rememberMe: boolean) => {
    if (!isBrowser) return null;
    return rememberMe ? localStorage : sessionStorage;
  },

  saveAuthData: (token: string, expiresIn: number, rememberMe: boolean, role: string) => {
    if (!isBrowser) return;
    const storage = rememberMe ? localStorage : sessionStorage;
    const expirationDate = new Date(Date.now() + expiresIn * 1000).toISOString();
    storage.setItem('token', token);
    storage.setItem('token_expiration', expirationDate);
    storage.setItem('role', role);
    if (rememberMe) localStorage.setItem('rememberMe', 'true');
  },

  clearAuthData: () => {
    if (!isBrowser) return;
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiration');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('token_expiration');
    sessionStorage.removeItem('role');
  },

  getInitialAuthState: (): Omit<AuthState, 'loading' | 'error'> => {
    if (!isBrowser) return { user: null, token: null, rememberMe: false, isAuthenticated: false };
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    const token = storage.getItem('token');
    const expiration = storage.getItem('token_expiration');
    const role = storage.getItem('role');

    if (token && expiration && role) {
      const isExpired = new Date(expiration) < new Date();
      if (!isExpired) {
        return {
          user: { id: '', name: '', email: '', role },
          token,
          rememberMe,
          isAuthenticated: true
        };
      }
      AuthPersistence.clearAuthData();
    }

    return { user: null, token: null, rememberMe: false, isAuthenticated: false };
  }
};

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
        body: JSON.stringify(payload),
      });

      const data: AuthResponse = await response.json();
      if (!response.ok) throw new Error(data as any);

      AuthPersistence.saveAuthData(data.token, data.expiresIn, data.rememberMe, data.user.role);
      return data;
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

      const data: AuthResponse = await response.json();
      if (!response.ok) throw new Error(data as any);

      AuthPersistence.saveAuthData(data.token, data.expiresIn, data.rememberMe, data.user.role);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const data = AuthPersistence.getInitialAuthState();
      if (data.user && data.token) {
        return {
          user: data.user,
          token: data.token,
          rememberMe: data.rememberMe
        };
      }
      return rejectWithValue('No user data found');
    } catch (error) {
      return rejectWithValue('Failed to fetch user data');
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
      state.isAuthenticated = false;
      AuthPersistence.clearAuthData();
    },
    hydrateAuth: (state) => {
      const hydrated = AuthPersistence.getInitialAuthState();
      return { ...state, ...hydrated };
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.rememberMe = action.payload.rememberMe;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.rememberMe = action.payload.rememberMe;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Hydration
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.rememberMe = action.payload.rememberMe;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  }
});

export const { logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
