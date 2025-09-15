'use server'
import { signOut } from '@/app/api/auth/auth'
import React from 'react'

export async function auth_LogOut() {
    await signOut({redirectTo: "/"})
} 