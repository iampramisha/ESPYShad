"use client"
import { useAppSelector } from '@/lib/store/store';
import React from 'react'

export default function Admin() {
      const { loading, error, user } = useAppSelector((state) => state.auth); // Include `user` from the state
      console.log("user",user);
    const userName=user?.role
  return (
    <div>
      {userName}
    </div>
  )
}
