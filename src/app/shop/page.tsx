"use client"
import { useAppSelector } from '@/lib/store/store';

import React from 'react'

export default function page() {
      const { loading, error, user } = useAppSelector((state) => state.auth); // Include `user` from the state
      const role=user?.role
  return (
    <div>
     hi {role}
    </div>
  )
}
