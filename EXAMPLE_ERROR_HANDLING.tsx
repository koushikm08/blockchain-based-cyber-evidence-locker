// Example: Using Error Handling Properly in Components

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  validateEmail,
  validatePasswordStrength,
  extractResponseError,
  extractErrorMessage,
} from '@/lib/validation'
import { SafeError, useSafeError } from '@/components/error-boundary'

/**
 * EXAMPLE 1: Simple Form with Validation
 * Shows how to handle validation errors safely
 */
export function SimpleFormExample() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>('')

  const handleEmailChange = (value: string) => {
    setEmail(value)
    // ✅ validateEmail returns a string, never an object
    const emailError = validateEmail(value)
    setError(emailError)
  }

  return (
    <div className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(e) => handleEmailChange(e.target.value)}
        placeholder="Enter email"
      />
      {/* ✅ Always safe - error is a string */}
      {error && <SafeError error={error} />}
    </div>
  )
}

/**
 * EXAMPLE 2: API Error Handling
 * Shows how to safely extract errors from API responses
 */
export function ApiErrorExample() {
  const [loading, setLoading] = useState(false)
  // ✅ Use the hook for type-safe error handling
  const [error, setError] = useSafeError('')

  const handleSubmit = async (formData: any) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // ✅ Safe extraction - converts any error format to string
        setError(data)  // Will be handled safely by useSafeError
        return
      }

      // Handle success
      setError('')
    } catch (err) {
      // ✅ setError handles Error objects, strings, etc.
      setError(err instanceof Error ? err : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* ✅ error is always a string from useSafeError hook */}
      {error && <SafeError error={error} className="mb-4" />}
      <Button onClick={() => handleSubmit({})}>Submit</Button>
    </div>
  )
}

/**
 * EXAMPLE 3: Password Strength Validation
 * Shows how to display complex validation results safely
 */
export function PasswordStrengthExample() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>('')

  const handlePasswordChange = (value: string) => {
    setPassword(value)

    // ✅ validatePasswordStrength returns a specific object
    const result = validatePasswordStrength(value)

    // ✅ We extract and render only the valid boolean and errors array
    // Never render the entire result object
    if (!result.valid && result.errors.length > 0) {
      setError('Password needs: ' + result.errors.join(', '))
    } else {
      setError('')
    }
  }

  return (
    <div className="space-y-4">
      <Input
        type="password"
        value={password}
        onChange={(e) => handlePasswordChange(e.target.value)}
        placeholder="Enter password"
      />
      {/* ✅ Always rendering a string, not an object */}
      {error && <SafeError error={error} />}
    </div>
  )
}

/**
 * EXAMPLE 4: Validation Error Map
 * Shows how to safely store and render multiple field errors
 */
export function FormWithMultipleFieldsExample() {
  // ✅ Type as Record<string, string> - always strings
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateFields = (data: any) => {
    const newErrors: Record<string, string> = {}

    // ✅ Always assign strings to errors
    const emailError = validateEmail(data.email)
    if (emailError) newErrors.email = emailError

    const passwordResult = validatePasswordStrength(data.password)
    if (!passwordResult.valid) {
      // ✅ Extract message from result, don't assign entire object
      newErrors.password = 'Password must include: ' + passwordResult.errors.join(', ')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <div className="space-y-4">
      {/* ✅ All errors are strings */}
      {Object.entries(errors).map(([field, error]) => (
        <SafeError key={field} error={error} />
      ))}
    </div>
  )
}

/**
 * EXAMPLE 5: With Development Details
 * Shows how to display detailed errors in development mode
 */
export function DebugErrorExample() {
  const [error, setError] = useState<any>(null)

  return (
    <div>
      {/* ✅ SafeError handles conversion and shows details in dev mode */}
      <SafeError error={error} showDetails={true} />
    </div>
  )
}

/**
 * KEY TAKEAWAYS:
 *
 * 1. ✅ Always type error state as string or Record<string, string>
 * 2. ✅ Extract error messages before rendering
 * 3. ✅ Use extractResponseError() for API responses
 * 4. ✅ Use validateEmail(), validatePasswordStrength() for validation
 * 5. ✅ Use SafeError component or useSafeError hook
 * 6. ✅ Never render objects directly in JSX
 * 7. ✅ Always check if error exists before rendering
 *
 * WRONG: setError(apiResponse)
 * RIGHT: setError(extractResponseError(apiResponse))
 *
 * WRONG: {error} when error is an object
 * RIGHT: {error.message} or use SafeError component
 */
