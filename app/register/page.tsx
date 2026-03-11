'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Shield, Lock, Users, AlertCircle, CheckCircle2, Mail,
  Building2, Eye, EyeOff, Check, X, ArrowRight, ChevronLeft,
  Fingerprint, BadgeCheck, KeyRound, User
} from 'lucide-react'
import React from 'react'

const validateEmail = (email: string) => {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? '' : 'Enter a valid email'
}

const validatePasswordStrength = (password: string) => {
  if (!password) return ''
  const errors: string[] = []
  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[a-z]/.test(password)) errors.push('Lowercase letter')
  if (!/[A-Z]/.test(password)) errors.push('Uppercase letter')
  if (!/[0-9]/.test(password)) errors.push('Number')
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Special character')
  return errors.length > 0 ? 'Password must contain: ' + errors.join(', ') : ''
}

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Number (0-9)', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character (!@#$...)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
]

const roleConfig = {
  investigator: {
    label: 'Investigator',
    description: 'Upload & manage evidence',
    icon: Fingerprint,
    color: 'from-emerald-500 to-green-600',
    textColor: 'text-emerald-600',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
    permissions: ['Upload evidence files', 'View own evidence', 'Generate evidence IDs'],
  },
  law_enforcement: {
    label: 'Law Enforcement',
    description: 'View & verify evidence',
    icon: Users,
    color: 'from-blue-500 to-cyan-600',
    textColor: 'text-blue-600',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-500',
    permissions: ['View all evidence', 'Verify file integrity', 'Generate audit reports'],
  },
  admin: {
    label: 'Administrator',
    description: 'Full system access',
    icon: BadgeCheck,
    color: 'from-violet-500 to-purple-600',
    textColor: 'text-violet-600',
    lightBg: 'bg-violet-50',
    borderColor: 'border-violet-500',
    permissions: ['Full system access', 'Manage all users', 'Configure settings'],
    requiresCode: true,
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    role: 'investigator',
    adminCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const passwordStrength = validatePasswordStrength(formData.password)
  const selectedRole = roleConfig[formData.role as keyof typeof roleConfig]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    const newErrors = { ...validationErrors }
    if (name === 'email') {
      const emailError = validateEmail(value)
      if (emailError) newErrors.email = emailError
      else delete newErrors.email
    } else if (name === 'fullName') {
      if (value && value.length < 3) newErrors.fullName = 'At least 3 characters'
      else if (value && value.split(/\s+/).length < 2) newErrors.fullName = 'Please provide first and last name'
      else delete newErrors.fullName
    } else if (name === 'organization') {
      if (value && value.length < 3) newErrors.organization = 'At least 3 characters'
      else delete newErrors.organization
    } else if (name === 'password') {
      const passwordError = validatePasswordStrength(value)
      if (passwordError) newErrors.password = passwordError
      else delete newErrors.password
    }
    setValidationErrors(newErrors)
  }

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ ...prev, role, adminCode: '' }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const errors: Record<string, string> = {}
    if (!formData.fullName || formData.fullName.trim().length < 3) errors.fullName = 'Full name required (3+ characters)'
    if (!formData.email) errors.email = 'Email required'
    if (!formData.organization || formData.organization.trim().length < 3) errors.organization = 'Organization required (3+ characters)'
    const passwordError = validatePasswordStrength(formData.password)
    if (!formData.password || passwordError) errors.password = passwordError || 'Password does not meet requirements'
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match'
    if (formData.role === 'admin' && !formData.adminCode) errors.adminCode = 'Admin code required'

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Registration failed')
        setLoading(false)
        return
      }
      setSuccess(true)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-green-500/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/50 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">B-CEL</span>
          </Link>
        </div>

        {/* Content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white mb-3 leading-tight">
              Join the platform.<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Secure evidence.
              </span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Create your account and start managing digital evidence with blockchain-grade security.
            </p>
          </div>

          {/* Role preview */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Available Roles</p>
            {Object.entries(roleConfig).map(([key, role]) => {
              const Icon = role.icon
              const isSelected = formData.role === key
              return (
                <div key={key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-white/10 border-white/20'
                    : 'border-transparent'
                }`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>{role.label}</p>
                    <p className="text-xs text-gray-600">{role.description}</p>
                  </div>
                  {isSelected && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom status */}
        <div className="relative">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-50" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Registration open</p>
              <p className="text-gray-500 text-xs">Secure • Encrypted • Blockchain-backed</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="w-full lg:w-7/12 flex items-start justify-center p-6 lg:p-12 bg-white relative overflow-y-auto">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

        <div className="w-full max-w-lg py-4">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">B-CEL</span>
          </div>

          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-500">Join the blockchain-secured evidence management platform</p>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">Account created successfully!</p>
                <p className="text-xs text-emerald-600">Redirecting to your dashboard...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Select your role</label>
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-2xl">
                {Object.entries(roleConfig).map(([roleKey, roleData]) => {
                  const Icon = roleData.icon
                  const isSelected = formData.role === roleKey
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleRoleChange(roleKey)}
                      disabled={loading}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center transition-all duration-200 ${
                        isSelected ? 'bg-white shadow-md shadow-gray-200' : 'hover:bg-white/60'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isSelected ? `bg-gradient-to-br ${roleData.color} shadow-sm` : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                        {roleData.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl ${selectedRole.lightBg}`}>
                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${selectedRole.color}`} />
                <p className={`text-xs font-semibold ${selectedRole.textColor}`}>
                  {selectedRole.label}: {selectedRole.description}
                </p>
              </div>
            </div>

            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                    className={`pl-11 h-12 rounded-xl border-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 text-sm font-medium transition-all focus-visible:ring-0 ${
                      validationErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                </div>
                {validationErrors.fullName && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{validationErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@org.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`pl-11 h-12 rounded-xl border-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 text-sm font-medium transition-all focus-visible:ring-0 ${
                      validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{validationErrors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="organization" className="block text-sm font-bold text-gray-700 mb-2">Organization</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Your department or agency"
                  value={formData.organization}
                  onChange={handleChange}
                  disabled={loading}
                  className={`pl-11 h-12 rounded-xl border-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 text-sm font-medium transition-all focus-visible:ring-0 ${
                    validationErrors.organization ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-emerald-500 focus:bg-white'
                  }`}
                />
              </div>
              {validationErrors.organization && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{validationErrors.organization}
                </p>
              )}
            </div>

            {/* Admin Code */}
            {formData.role === 'admin' && (
              <div className="p-4 bg-violet-50 border border-violet-200 rounded-2xl">
                <label htmlFor="adminCode" className="block text-sm font-bold text-violet-800 mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Admin Verification Code
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                  <Input
                    id="adminCode"
                    name="adminCode"
                    type="password"
                    placeholder="Enter admin verification code"
                    value={formData.adminCode}
                    onChange={handleChange}
                    disabled={loading}
                    className={`pl-11 h-12 rounded-xl border-2 bg-white text-gray-900 placeholder:text-gray-400 text-sm font-medium transition-all focus-visible:ring-0 ${
                      validationErrors.adminCode ? 'border-red-300' : 'border-violet-200 focus:border-violet-500'
                    }`}
                  />
                </div>
                {validationErrors.adminCode && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{validationErrors.adminCode}
                  </p>
                )}
              </div>
            )}

            {/* Password row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">Password</label>
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
                    className={`pl-11 pr-12 h-12 rounded-xl border-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 text-sm font-medium transition-all focus-visible:ring-0 ${
                      validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength checklist */}
                {formData.password && (
                  <div className="mt-3 space-y-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {passwordRequirements.map((req) => {
                      const met = req.test(formData.password)
                      return (
                        <div key={req.label} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${met ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                            {met ? <Check className="w-2.5 h-2.5 text-white" /> : <X className="w-2.5 h-2.5 text-gray-400" />}
                          </div>
                          <span className={`text-xs ${met ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>{req.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={`pl-11 pr-12 h-12 rounded-xl border-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 text-sm font-medium transition-all focus-visible:ring-0 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-gray-200 focus:border-emerald-500 focus:bg-white'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <p className={`text-xs mt-2 flex items-center gap-1.5 font-medium ${
                    formData.password === formData.confirmPassword ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      formData.password === formData.confirmPassword ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      {formData.password === formData.confirmPassword
                        ? <Check className="w-2.5 h-2.5 text-white" />
                        : <X className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {formData.password === formData.confirmPassword ? 'Passwords match' : "Passwords don't match"}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0 || !!passwordStrength}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group
                bg-gradient-to-r ${selectedRole.color} hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account as {selectedRole.label}
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
                <span className="bg-white px-4 text-xs text-gray-400 font-medium">Already have an account?</span>
              </div>
            </div>

            <Link
              href="/signin"
              className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:bg-emerald-50"
            >
              Sign in instead
            </Link>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Protected by blockchain technology •{' '}
            <span className="text-emerald-600 font-medium">Enterprise-grade security</span>
          </p>
        </div>
      </div>
    </div>
  )
}
