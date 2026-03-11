'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Shield, ArrowRight, ChevronLeft, Fingerprint, Users, BadgeCheck } from 'lucide-react'
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
    description: 'Upload & manage evidence',
    icon: Fingerprint,
    color: 'from-emerald-500 to-green-600',
    selectedBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    ringColor: 'ring-emerald-500',
    textColor: 'text-emerald-600',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
  },
  law_enforcement: {
    label: 'Law Enforcement',
    description: 'View & verify evidence',
    icon: Users,
    color: 'from-blue-500 to-cyan-600',
    selectedBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    ringColor: 'ring-blue-500',
    textColor: 'text-blue-600',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-500',
  },
  admin: {
    label: 'Administrator',
    description: 'Full system access',
    icon: BadgeCheck,
    color: 'from-violet-500 to-purple-600',
    selectedBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    ringColor: 'ring-violet-500',
    textColor: 'text-violet-600',
    lightBg: 'bg-violet-50',
    borderColor: 'border-violet-500',
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
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

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
          password: formData.password,
          role: selectedRole
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = extractResponseError(data)
        setError(errorMessage)
        setLoading(false)
        return
      }

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
      }, 2000)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const currentRole = roleConfig[selectedRole as keyof typeof roleConfig]

  return (
    <div className="min-h-screen bg-gray-950 flex overflow-hidden">

      {/* ── LEFT PANEL (decorative) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />

        {/* Top: Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/50 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">B-CEL</span>
          </Link>
        </div>

        {/* Middle: Feature highlights */}
        <div className="relative space-y-6">
          <div>
            <h2 className="text-4xl font-black text-white mb-3 leading-tight">
              Secure evidence.<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Immutable records.
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Sign in to access the blockchain-secured evidence management platform.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '🔐', text: 'SHA-256 cryptographic integrity on every file' },
              { icon: '⛓️', text: 'Immutable records on Ethereum blockchain' },
              { icon: '🌐', text: 'Decentralized IPFS storage — no single point of failure' },
              { icon: '✅', text: 'Court-admissible chain of custody documentation' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-xl leading-none mt-0.5">{item.icon}</span>
                <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Status */}
        <div className="relative">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-50" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">All systems operational</p>
              <p className="text-gray-500 text-xs">Blockchain network • IPFS • API</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white relative">
        {/* Subtle top decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">B-CEL</span>
          </div>

          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Sign in to your evidence management account</p>
          </div>

          {!mounted ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-gray-100 rounded-2xl shimmer" />
              ))}
            </div>
          ) : (
            <>
              {/* Success state */}
              {success && userData && (
                <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl animate-scale-in">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">Signed in successfully!</p>
                      <p className="text-xs text-emerald-600">{userData.fullName} • {userData.organization}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-xs text-emerald-600 font-medium">Redirecting to dashboard...</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Sign in as
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-2xl">
                    {Object.entries(roleConfig).map(([roleKey, roleData]) => {
                      const Icon = roleData.icon
                      const isSelected = selectedRole === roleKey
                      return (
                        <button
                          key={roleKey}
                          type="button"
                          onClick={() => handleRoleChange(roleKey)}
                          disabled={loading}
                          className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center transition-all duration-200 ${
                            isSelected
                              ? 'bg-white shadow-md shadow-gray-200'
                              : 'hover:bg-white/60'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? `bg-gradient-to-br ${roleData.color} shadow-sm`
                              : 'bg-gray-200'
                          }`}>
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <span className={`text-xs font-bold leading-tight transition-colors ${
                            isSelected ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {roleData.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Role description pill */}
                  <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl ${currentRole.lightBg} border border-current/10`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${currentRole.color}`} />
                    <p className={`text-xs font-semibold ${currentRole.textColor}`}>
                      {currentRole.label}: {currentRole.description}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@organization.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className={`pl-11 h-12 rounded-xl border-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 text-sm font-medium transition-all duration-200 focus-visible:ring-0 ${
                        validationErrors.email
                          ? 'border-red-300 bg-red-50 focus:border-red-400'
                          : 'border-gray-200 focus:border-emerald-500 focus:bg-white'
                      }`}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className={`pl-11 pr-12 h-12 rounded-xl border-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 text-sm font-medium transition-all duration-200 focus-visible:ring-0 ${
                        validationErrors.password
                          ? 'border-red-300 bg-red-50 focus:border-red-400'
                          : 'border-gray-200 focus:border-emerald-500 focus:bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || Object.keys(validationErrors).length > 0 || !formData.email || !formData.password}
                  className={`w-full h-13 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group
                    bg-gradient-to-r ${currentRole.color} hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in as {currentRole.label}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-xs text-gray-400 font-medium">Don't have an account?</span>
                  </div>
                </div>

                {/* Register link */}
                <Link
                  href="/register"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:bg-emerald-50"
                >
                  Create an account
                </Link>
              </form>

              {/* Footer note */}
              <p className="text-center text-xs text-gray-400 mt-8">
                Protected by blockchain technology •{' '}
                <span className="text-emerald-600 font-medium">Enterprise-grade security</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
