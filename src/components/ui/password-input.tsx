'use client'

import { useState } from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function PasswordInput({ error, className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        className={cn(
          'w-full px-4 py-3 pr-12 text-black font-bold border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white',
          error && 'border-red-500 bg-red-100',
          className
        )}
        {...props}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <IconEyeOff size={16} stroke={2} className="text-yellow-400" />
        ) : (
          <IconEye size={16} stroke={2} className="text-yellow-400" />
        )}
      </button>
    </div>
  )
}
