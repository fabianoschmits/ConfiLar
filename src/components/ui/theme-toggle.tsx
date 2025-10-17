'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    // A preferência é automaticamente salva no localStorage pelo next-themes
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-5 w-5" />
        <span className="sr-only">Alternar tema</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500 transition-all hover:rotate-180" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300 transition-all hover:rotate-12" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}

