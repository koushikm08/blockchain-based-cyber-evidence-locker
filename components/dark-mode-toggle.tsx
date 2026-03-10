'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative w-10 h-10 p-0 rounded-full border border-border hover:border-primary/50 transition-all duration-300 hover-scale focus-ring"
      aria-label="Toggle dark mode"
    >
      <div className="relative w-full h-full">
        {/* Sun Icon */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${
          isDark 
            ? 'opacity-0 scale-50 rotate-90' 
            : 'opacity-100 scale-100 rotate-0'
        }`}>
          <Sun className="w-5 h-5 text-amber-500 drop-shadow-sm" />
        </div>
        
        {/* Moon Icon */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${
          isDark 
            ? 'opacity-100 scale-100 rotate-0' 
            : 'opacity-0 scale-50 -rotate-90'
        }`}>
          <Moon className="w-5 h-5 text-blue-300 drop-shadow-sm" />
        </div>
        
        {/* Animated ring for sun */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out ${
          isDark 
            ? 'opacity-0 scale-0' 
            : 'opacity-50 scale-150 border-2 border-amber-300'
        }`} />
        
        {/* Animated glow for moon */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out ${
          isDark 
            ? 'opacity-25 scale-125 shadow-[0_0_20px_rgba(96,165,250,0.3)]' 
            : 'opacity-0 scale-0'
        }`} />
      </div>
    </Button>
  )
}