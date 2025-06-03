'use server'
import { signOut } from '@/auth'
import React from 'react'

export async function github_LogOut() {
    await signOut({redirectTo: "/"})
} 
