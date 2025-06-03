'use server'
import { signOut } from '@/auth'
import React from 'react'

export async function auth_LogOut() {
    await signOut({redirectTo: "/"})
} 
