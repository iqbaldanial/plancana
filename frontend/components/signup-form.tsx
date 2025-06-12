'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GithubButton } from "@/app/actions/github_SignIn"
import { GoogleButton } from "@/app/actions/google_SignIn"
import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
   const router = useRouter()

  const [user, setUser] = useState({
    name: "",
    email:"",
    password:"",
  })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setUser((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await axios.post("/api/auth/register", user)
      if (res.status === 201) {
        router.push("/login")
      }
    } catch (err: any) {
      console.error("Registration failed:", err.response?.data || err.message)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">Creater an Account</h1>
        <p className="text-muted-foreground text-sm">
          Sign up to start managing your agricultural supply chain
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Full Name</Label>
          <Input 
          id="name" 
          type="text" 
          placeholder="Enter your full name" 
          value={user.name}
          onChange={handleChange}
          required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="email">Email Address</Label>
          </div>
          <Input 
          id="email" 
          type="email" 
          placeholder="Enter your email address" 
          value={user.email}
          onChange={handleChange}
          required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input 
          id="password" 
          type="password" 
          placeholder="Enter your password" 
          value={user.password}
          onChange={handleChange}
          required />
        </div>
        <div className="grid gap-3">
         {/* <Label htmlFor="role">Select Your Role</Label> */}
        </div>
        <Button type="submit" className="w-full">
          Create Account
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <GoogleButton/>
        <GithubButton/>
      </div>
      <div className="text-center text-sm">
        Have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  )
}
