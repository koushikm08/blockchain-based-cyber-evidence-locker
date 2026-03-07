/**
 * Frontend validation utilities with safe error extraction
 * Ensures all rendered values are strings, never objects
 */

export interface ValidationResult {
  valid: boolean
  message: string
}

export interface PasswordStrengthResult {
  valid: boolean
  errors: string[]
  strength: number
  label: string
}

/**
 * Safely extract error message from validation result
 * Always returns a string, never an object
 */
export const extractErrorMessage = (
  result: ValidationResult | PasswordStrengthResult | string | null | undefined
): string => {
  // If already a string, return it
  if (typeof result === 'string') {
    return result
  }

  // If null or undefined, return empty string
  if (!result) {
    return ''
  }

  // If it's an object with a message property, extract it
  if (typeof result === 'object' && 'message' in result) {
    const message = (result as any).message
    return typeof message === 'string' ? message : ''
  }

  // Fallback: return empty string if extraction fails
  return ''
}

/**
 * Safely extract error message from API response
 * Prevents rendering of error objects
 */
export const extractResponseError = (response: any): string => {
  if (!response) return 'An error occurred'

  // If it's already a string, return it
  if (typeof response === 'string') {
    return response
  }

  // Extract message from object response
  if (typeof response === 'object') {
    if (response.message && typeof response.message === 'string') {
      return response.message
    }

    if (response.error && typeof response.error === 'string') {
      return response.error
    }

    if (response.errors && Array.isArray(response.errors)) {
      return response.errors
        .map((e: any) => (typeof e === 'string' ? e : e.message || 'Unknown error'))
        .join(', ')
    }
  }

  // Fallback
  return 'An error occurred'
}

/**
 * Validate email - always returns string or empty
 * @param email Email to validate
 * @returns Error message (empty string if valid)
 */
export const validateEmail = (email: string): string => {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? '' : 'Enter a valid email'
}

/**
 * Validate password strength with detailed feedback
 * Always returns an object, never undefined
 */
export const validatePasswordStrength = (password: string): PasswordStrengthResult => {
  if (!password) {
    return { valid: false, errors: [], strength: 0, label: 'None' }
  }

  const errors: string[] = []
  let strength = 0

  if (password.length >= 8) strength += 25
  else errors.push('At least 8 characters')

  if (/[a-z]/.test(password)) strength += 25
  else errors.push('Lowercase letter')

  if (/[A-Z]/.test(password)) strength += 25
  else errors.push('Uppercase letter')

  if (/[0-9]/.test(password)) strength += 12.5
  else errors.push('Number')

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 12.5
  else errors.push('Special character')

  let label = 'Weak'
  if (strength >= 75) label = 'Strong'
  else if (strength >= 50) label = 'Medium'

  return { valid: errors.length === 0, errors, strength, label }
}
