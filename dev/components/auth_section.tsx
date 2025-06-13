
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import React from 'react'
import { auth_LogOut } from '@/app/actions/auth_LogOut'


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
            <form action={auth_LogOut}>
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
            {/* <Button
                asChild
                variant="outline"
                size="sm"
                className={cn(isScrolled && 'lg:hidden')}>
                <Link href="#">
                    <span>Login</span>
                </Link>
            </Button> */}
            {/* <form
            >
            <GoogleButton isScrolled={isScrolled}/>
            </form>
            <form>
            <GithubButton isScrolled={isScrolled}/>
            </form> */}
            <Button
                asChild
                size="sm"
                className="lg:inline-flex">
                <Link href="/login">
                    <span>Sign In</span>
                </Link>
            </Button> 
            <Button
                asChild
                size="sm"
                className="lg:inline-flex">
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

