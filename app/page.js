"use client"
import React from 'react'
import Dashboard from '@/components/Dashboard'
import { SessionProvider } from 'next-auth/react'
export default function HOme() {
  return (
    <SessionProvider>
        <Dashboard />
    </SessionProvider>
  )
}
