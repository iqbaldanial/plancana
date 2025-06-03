
import Link from 'next/link'
import { Logo } from './logo'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { auth, signIn, signOut } from '@/auth'
import { github_SignIn } from '@/app/actions/github_SignIn'
import { github_LogOut } from '@/app/actions/github_LogOut'


type Props ={
    session:any
    isScrolled:boolean
}

const Authsection = ({session,isScrolled} : Props) => {
    console.log('SESSION boolean:', session && session?.user)
  return (
    <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
        {session && session?.user ?(
            <>
            <form action={github_LogOut}>
                <Button 
                type='submit'
                size="sm"
                className="lg:inline-flex">
                <span>Logout</span>
            </Button>

            </form>
            <Button
                asChild
                size="sm"
                className="lg:inline-flex">
                <Link href={`/user/${session?.id}`}>
                <span>{session?.user?.name}</span>
                </Link>
            </Button>
            </>
        ):(
            <>
            <Button
                asChild
                variant="outline"
                size="sm"
                className={cn(isScrolled && 'lg:hidden')}>
                <Link href="#">
                    <span>Login</span>
                </Link>
            </Button>
            <form
            action={github_SignIn}>
                <Button 
                type='submit'
                size="sm"
                className={cn(isScrolled && 'lg:hidden')}>
                <span>Sign Up using Github</span>
                </Button>
            </form>
            <Button
                asChild
                size="sm"
                className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                <Link href="#">
                    <span>Get Started</span>
                </Link>
            </Button> 
            </>
        )}


    </div>
  )
}

export default Authsection

