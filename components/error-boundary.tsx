'use client'

import React, { ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component that catches rendering errors
 * and displays a user-friendly error message
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.retry) ?? (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-destructive mt-1 shrink-0" />
                  <div className="flex-1">
                    <h2 className="font-semibold text-foreground mb-2">
                      Something went wrong
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {this.state.error.message || 'An unexpected error occurred'}
                    </p>
                    <Button
                      onClick={this.retry}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

/**
 * Safe error display component with null checks
 * Prevents "objects are not valid as React child" errors
 */
export const SafeError: React.FC<{
  error: any
  className?: string
  showDetails?: boolean
}> = ({ error, className = 'text-destructive text-sm', showDetails = false }) => {
  // Safely extract error message
  let message = ''

  if (typeof error === 'string') {
    message = error
  } else if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      message = error.message
    } else if ('error' in error && typeof error.error === 'string') {
      message = error.error
    } else {
      message = 'An error occurred'
    }
  }

  if (!message) return null

  return (
    <div className={className}>
      {message}
      {showDetails && process.env.NODE_ENV === 'development' && error && (
        <details className="mt-2 text-xs opacity-70">
          <summary>Error details</summary>
          <pre className="mt-1 bg-background p-2 rounded overflow-auto">
            {typeof error === 'object'
              ? JSON.stringify(error, null, 2)
              : String(error)}
          </pre>
        </details>
      )}
    </div>
  )
}

/**
 * Hook for safe error handling in components
 */
export const useSafeError = (
  initialError: string = ''
): [string, (error: any) => void] => {
  const [error, setErrorState] = React.useState<string>(initialError)

  const setError = (value: any) => {
    // Safely convert any error type to string
    if (typeof value === 'string') {
      setErrorState(value)
    } else if (value instanceof Error) {
      setErrorState(value.message)
    } else if (typeof value === 'object' && value !== null) {
      if ('message' in value && typeof value.message === 'string') {
        setErrorState(value.message)
      } else if ('error' in value && typeof value.error === 'string') {
        setErrorState(value.error)
      } else {
        setErrorState('An error occurred')
      }
    } else {
      setErrorState('')
    }
  }

  return [error, setError]
}
