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

interface ErrorState {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  
  const router = useRouter()
  
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  })
  
  const [errors, setErrors] = useState<ErrorState>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setUser((prev) => ({
      ...prev,
      [id]: value,
    }))
    
    // Clear specific field error when user starts typing
    if (errors[id as keyof ErrorState]) {
      setErrors((prev) => ({
        ...prev,
        [id]: undefined,
      }))
    }
    
    // Clear general error when user makes changes
    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: undefined,
      }))
    }
  }
  
  const validateForm = (): boolean => {
    const newErrors: ErrorState = {}
    
    // Name validation
    if (!user.name.trim()) {
      newErrors.name = "Full name is required"
    } else if (user.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long"
    } else if (user.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters"
    } else if (!/^[a-zA-Z\s]+$/.test(user.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces"
    }
    
    // Email validation
    if (!user.email.trim()) {
      newErrors.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim())) {
      newErrors.email = "Please enter a valid email address"
    } else if (user.email.length > 100) {
      newErrors.email = "Email must be less than 100 characters"
    }
    
    // Password validation
    if (!user.password) {
      newErrors.password = "Password is required"
    } else if (user.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    } else if (user.password.length > 128) {
      newErrors.password = "Password must be less than 128 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(user.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const res = await axios.post("/api/auth/user", {
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        password: user.password,
      })
      
      if (res.status === 200 || res.status === 201) {
        // Success - redirect to dashboard
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Registration failed:", err.response?.data || err.message)
      
      if (err.response?.data) {
        const errorData = err.response.data
        
        // Handle specific backend errors
        if (errorData.field && errorData.message) {
          setErrors({
            [errorData.field]: errorData.message
          })
        } else if (errorData.message) {
          // Handle general error messages
          if (errorData.message.toLowerCase().includes('email')) {
            setErrors({ email: errorData.message })
          } else if (errorData.message.toLowerCase().includes('password')) {
            setErrors({ password: errorData.message })
          } else if (errorData.message.toLowerCase().includes('name')) {
            setErrors({ name: errorData.message })
          } else {
            setErrors({ general: errorData.message })
          }
        } else {
          setErrors({ general: "Registration failed. Please try again." })
        }
      } else if (err.response?.status === 409) {
        setErrors({ email: "An account with this email already exists" })
      } else if (err.response?.status === 400) {
        setErrors({ general: "Invalid registration data. Please check your information." })
      } else if (err.response?.status === 500) {
        setErrors({ general: "Server error. Please try again later." })
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setErrors({ general: "Network error. Please check your connection and try again." })
      } else {
        setErrors({ general: "An unexpected error occurred. Please try again." })
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">Create an Account</h1>
        <p className="text-muted-foreground text-sm">
          Sign up to start managing your agricultural supply chain
        </p>
      </div>
      
      {/* General Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errors.general}
        </div>
      )}
      
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={user.name}
            onChange={handleChange}
            className={errors.name ? "border-red-500 focus:border-red-500" : ""}
            disabled={isLoading}
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
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
            className={errors.email ? "border-red-500 focus:border-red-500" : ""}
            disabled={isLoading}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={user.password}
              onChange={handleChange}
              className={errors.password ? "border-red-500 focus:border-red-500 pr-10" : "pr-10"}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.757 7.757M9.878 9.878l2.122 2.122" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
          <div className="text-xs text-gray-500">
            Password must be at least 8 characters with uppercase, lowercase, and number
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
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