import React from 'react'
import Authsection from './auth_section'
import { HeroHeader } from './hero5-header'

type Props ={
    session:any
    isScrolled:boolean
}
const Navbar = ({session}:Props) => {
  return (
    <>
    <HeroHeader session={session}></HeroHeader>
    </>
  )
}

export default Navbar
