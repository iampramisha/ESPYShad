// lib/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './feature/auth/auth-slice';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here...
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;