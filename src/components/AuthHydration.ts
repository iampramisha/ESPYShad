"use client";
import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/store/store';
import { fetchUserData } from '@/lib/store/feature/auth/auth-slice';

export default function AuthHydration() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  return null;
}