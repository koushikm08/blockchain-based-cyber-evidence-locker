'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Shield, Badge, Users } from 'lucide-react'
import { validateEmail, extractResponseError } from '@/lib/validation'

interface UserData {
  id: string
  fullName: string
  email: string
  role: 'investigator' | 'law_enforcement' | 'admin'
  organization: string
}

const roleConfig = {
  investigator: {
    label: 'Investigator',
    description: 'Upload & verify evidence',
    icon: Badge,
    permissions: ['Upload evidence', 'Verify files', 'Access dashboard'],
  },
  law_enforcement: {
    label: 'Law Enforcement',
    description: 'View & verify evidence',
    icon: Users,
    permissions: ['View evidence', 'Verify files', 'Generate reports'],
  },
  admin: {
    label: 'Administrator',
    description: 'Full system access',
    icon: Shield,
    permissions: ['Full system access', 'Manage users', 'System settings'],
  },
}

export default function SignIn() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('investigator')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Ensure component only renders after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    return ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')

    // Real-time validation - properly clear errors when valid
    const newErrors = { ...validationErrors }
    
    if (name === 'email') {
      const emailError = validateEmail(value)
      if (emailError) newErrors.email = emailError
      else delete newErrors.email
    }
    if (name === 'password') {
      const passwordError = validatePassword(value)
      if (passwordError) newErrors.password = passwordError
      else delete newErrors.password
    }
    
    setValidationErrors(newErrors)
  }

  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate all fields
    const errors: Record<string, string> = {}
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    
    if (emailError) errors.email = emailError
    if (passwordError) errors.password = passwordError

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = extractResponseError(data)
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Save token and user data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setUserData(data.user)
      setSuccess(true)
      setTimeout(() => {
        if (data.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }, 2500)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const selectedRoleData = roleConfig[selectedRole as keyof typeof roleConfig]
  const userRoleData = userData ? roleConfig[userData.role as keyof typeof roleConfig] : null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3.5 bg-foreground rounded-lg">
              <Shield className="w-7 h-7 bg-background" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">B-CEL</h1>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Authentication</h2>
          <p className="text-base text-muted-foreground">Sign in to your evidence management system</p>
        </div>

        {!mounted ? (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Alert Messages */}
            {success && userData && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-emerald-200">Login successful!</p>
                </div>
                {/* Role Information */}
                <div className="p-3 border border-border bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-primary">
                      {userRoleData?.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{userData.fullName} • {userData.organization}</p>
                  <p className="text-xs text-muted-foreground mt-1">{userRoleData?.description}</p>
                </div>
                <p className="text-xs text-emerald-200 mt-3">Redirecting to your dashboard...</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-base font-bold text-foreground mb-5">Select Your Role</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(roleConfig).map(([roleKey, roleData]) => {
                  const IconComponent = roleData.icon
                  const isSelected = selectedRole === roleKey
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleRoleChange(roleKey)}
                      disabled={loading}
                      className={`p-5 rounded-xl transition-all duration-200 border-2 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xl scale-105'
                          : 'bg-secondary/40 border-border hover:bg-secondary hover:border-primary/50 text-foreground'
                      } disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-3 text-center group`}
                    >
                      <IconComponent className={`w-8 h-8 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      <span className={`text-sm font-bold tracking-tight`}>
                        {roleData.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Role Description */}
              <div className="mt-5 p-5 bg-secondary/40 border border-border rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  {React.createElement(roleConfig[selectedRole as keyof typeof roleConfig].icon as any, {
                    className: 'w-6 h-6 text-primary mt-0.5 flex-shrink-0'
                  })}
                  <div>
                    <p className="text-base font-bold text-foreground">{roleConfig[selectedRole as keyof typeof roleConfig].label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{roleConfig[selectedRole as keyof typeof roleConfig].description}</p>
                  </div>
                </div>
                <div className="space-y-2 pl-9">
                  {roleConfig[selectedRole as keyof typeof roleConfig].permissions?.map((perm) => (
                    <p key={perm} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></span>
                      {perm}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="mt-8">
              <label htmlFor="email" className="block text-base font-bold text-foreground mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`bg-secondary/50 border rounded-xl px-4 py-3.5 pl-12 text-base text-foreground placeholder:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition w-full ${
                    validationErrors.email
                      ? 'border-destructive/50 focus:ring-destructive'
                      : 'border-border focus:ring-primary'
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-sm text-destructive mt-2 font-medium">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-base font-bold text-foreground mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`bg-secondary/50 border rounded-xl px-4 py-3.5 pl-12 pr-12 text-base text-foreground placeholder:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition w-full ${
                    validationErrors.password
                      ? 'border-destructive/50 focus:ring-destructive'
                      : 'border-border focus:ring-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-destructive mt-2 font-medium">{validationErrors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0 || !formData.email || !formData.password}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base py-3.5 rounded-xl transition-all shadow-lg mt-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2 text-base">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Signing In...
                </span>
              ) : (
                `Sign In as ${roleConfig[selectedRole as keyof typeof roleConfig].label}`
              )}
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-base text-muted-foreground mt-8">
              Don't have an account?{' '}
              <Link href="/register" className="text-foreground font-bold hover:text-primary transition">
                Create Account
              </Link>
            </p>
              </form>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-10 font-medium">
              Secured by blockchain technology • Enterprise-grade encryption
            </p>
          </>
        )}
      </div>
    </div>
  )
}
