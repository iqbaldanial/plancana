'use server'

import { signIn } from '@/auth'
import React from 'react'


export async function github_SignIn() {
    await signIn('github')
}
