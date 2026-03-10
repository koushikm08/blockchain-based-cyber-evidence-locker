'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Lock, Users, Badge, AlertCircle, CheckCircle2, Mail, Building2, Eye, EyeOff, Check, X } from 'lucide-react'
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

    if (!formData.fullName || formData.fullName.trim().length < 3) {
      errors.fullName = 'Full name required (3+ characters)'
    }
    if (!formData.email) {
      errors.email = 'Email required'
    }
    if (!formData.organization || formData.organization.trim().length < 3) {
      errors.organization = 'Organization required (3+ characters)'
    }
    const passwordError = validatePasswordStrength(formData.password)
    if (!formData.password || passwordError) {
      errors.password = passwordError || 'Password does not meet requirements'
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    if (formData.role === 'admin' && !formData.adminCode) {
      errors.adminCode = 'Admin code required'
    }

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

      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const selectedRole = roleConfig[formData.role as keyof typeof roleConfig]

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-green-50 to-white flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo / Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-linear-to-br from-green-500 to-green-700 rounded-full shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-600">B-CEL</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600">Join our secure evidence management system</p>
        </div>

        {/* Alert Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700">Account created successfully! Redirecting...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-green-200 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`bg-white border rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition w-full ${
                    validationErrors.fullName
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-green-200 focus:ring-green-500'
                  }`}
                />
                {validationErrors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`bg-white border rounded-lg px-4 py-3 pl-11 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition w-full ${
                      validationErrors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-green-200 focus:ring-green-500'
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="organization" className="block text-sm font-semibold text-gray-900 mb-2">
                Organization
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Your Organization"
                  value={formData.organization}
                  onChange={handleChange}
                  disabled={loading}
                  className={`bg-white border rounded-lg px-4 py-3 pl-11 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition w-full ${
                    validationErrors.organization
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-green-200 focus:ring-green-500'
                  }`}
                />
              </div>
              {validationErrors.organization && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.organization}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">Select Your Role</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(roleConfig).map(([roleKey, roleData]) => {
                  const IconComponent = roleData.icon
                  const isSelected = formData.role === roleKey
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleRoleChange(roleKey)}
                      disabled={loading}
                      className={`p-4 rounded-lg transition-all border-2 ${
                        isSelected
                          ? 'bg-green-50 border-green-500 shadow-md'
                          : 'bg-white border-green-200 hover:bg-green-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2 text-center group`}
                    >
                      <IconComponent className={`w-7 h-7 ${isSelected ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600'}`} />
                      <span className={`text-sm font-semibold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                        {roleData.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Role Description */}
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  {React.createElement(selectedRole.icon as any, {
                    className: 'w-5 h-5 text-green-600 mt-0.5'
                  })}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedRole.label}</p>
                    <p className="text-xs text-gray-600">{selectedRole.description}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {selectedRole.permissions?.map((perm) => (
                    <p key={perm} className="text-xs text-gray-700 flex items-center gap-2">
                      <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                      {perm}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Code */}
            {formData.role === 'admin' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <label htmlFor="adminCode" className="block text-sm font-semibold text-gray-900 mb-2">
                  Admin Verification Code
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                  <Input
                    id="adminCode"
                    name="adminCode"
                    type="password"
                    placeholder="Enter admin code"
                    value={formData.adminCode}
                    onChange={handleChange}
                    disabled={loading}
                    className={`bg-white border rounded-lg px-4 py-3 pl-11 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition w-full ${
                      validationErrors.adminCode
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-green-300 focus:ring-green-500'
                    }`}
                  />
                </div>
                {validationErrors.adminCode && (
                  <p className="text-xs text-red-600 mt-2">{validationErrors.adminCode}</p>
                )}
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className={`bg-white border rounded-lg px-4 py-3 pl-11 pr-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition w-full ${
                      validationErrors.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-green-200 focus:ring-green-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-green-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Password Requirements:</span>
                    </div>
                    <div className="mt-3 space-y-1">
                      {[
                        { req: 'At least 8 characters', met: formData.password.length >= 8 },
                        { req: 'Lowercase letter (a-z)', met: /[a-z]/.test(formData.password) },
                        { req: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(formData.password) },
                        { req: 'Number (0-9)', met: /[0-9]/.test(formData.password) },
                        { req: 'Special character (!@#$%...)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) },
                      ].map((item) => (
                        <div key={item.req} className="flex items-center gap-2">
                          {item.met ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs ${item.met ? 'text-green-600' : 'text-gray-400'}`}>
                            {item.req}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-green-600" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={`bg-white border rounded-lg px-4 py-3 pl-11 pr-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition w-full ${
                      validationErrors.confirmPassword || (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-green-200 focus:ring-green-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-green-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && formData.confirmPassword && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <Check className="w-3 h-3" /> Passwords match
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" /> Passwords don't match
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0 || !!passwordStrength}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link href="/signin" className="text-green-600 font-semibold hover:text-green-700 transition">
                Sign In
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Secured by blockchain technology • Enterprise-grade encryption
        </p>
      </div>
    </div>
  )
}
