'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  full_name: string
  avatar_url?: string
  user_type: 'professional' | 'client'
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  onKeyPress?: (e: React.KeyboardEvent) => void
  minHeight?: string
}

export function MentionInputFixed({
  value,
  onChange,
  placeholder = "Digite @ para mencionar alguém...",
  className = "",
  disabled = false,
  onKeyPress,
  minHeight = "80px"
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionStart, setMentionStart] = useState<number | null>(null)
  const [mentionQuery, setMentionQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Buscar usuários baseado na query
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type')
        .ilike('full_name', `%${query}%`)
        .order('full_name')
        .limit(10)

      if (error) {
        console.error('Erro ao buscar usuários:', error)
        setSuggestions([])
      } else {
        setSuggestions(data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Detectar menções no texto
  const detectMention = useCallback((text: string, cursorPosition: number) => {
    const beforeCursor = text.substring(0, cursorPosition)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      const start = beforeCursor.lastIndexOf('@')
      setMentionStart(start)
      setMentionQuery(mentionMatch[1])
      setShowSuggestions(true)
      setSelectedIndex(0)
      searchUsers(mentionMatch[1])
    } else {
      setShowSuggestions(false)
      setMentionStart(null)
      setMentionQuery('')
    }
  }, [searchUsers])

  // Lidar com mudanças no texto
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPosition = e.target.selectionStart
    
    onChange(newValue)
    detectMention(newValue, cursorPosition)
  }

  // Lidar com seleção de usuário - CORRIGIDO
  const handleUserSelect = (user: User) => {
    if (mentionStart === null) return

    // CORREÇÃO: Calcular corretamente as posições
    const beforeMention = value.substring(0, mentionStart)
    const afterMention = value.substring(mentionStart + 1 + mentionQuery.length)
    const newValue = `${beforeMention}@${user.full_name} ${afterMention}`
    
    console.log('🔧 Debug da substituição:', {
      originalValue: value,
      mentionStart,
      mentionQuery,
      beforeMention,
      afterMention,
      newValue
    })
    
    onChange(newValue)
    setShowSuggestions(false)
    setMentionStart(null)
    setMentionQuery('')
    setSelectedIndex(0)

    // Focar no textarea após a seleção
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = beforeMention.length + user.full_name.length + 2
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
      }
    }, 0)
  }

  // Lidar com navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) {
      onKeyPress?.(e)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (suggestions[selectedIndex]) {
          handleUserSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setMentionStart(null)
        setMentionQuery('')
        setSelectedIndex(0)
        break
      default:
        onKeyPress?.(e)
    }
  }

  // Calcular posição das sugestões
  const getSuggestionsPosition = () => {
    if (!textareaRef.current || !showSuggestions) return {}
    
    const rect = textareaRef.current.getBoundingClientRect()
    return {
      position: 'absolute' as const,
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 1000
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
        style={{ minHeight }}
      />
      
      {/* Sugestões de menções */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
          style={getSuggestionsPosition()}
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
              <span className="text-xs ml-2">Buscando usuários...</span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((user, index) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url} alt={`Avatar de ${user.full_name}`} />
                  <AvatarFallback>
                    {user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{user.full_name}</div>
                  <div className="text-xs text-gray-500">
                    {user.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                  </div>
                </div>
              </button>
            ))
          ) : mentionQuery ? (
            <div className="p-3 text-center text-gray-500">
              <span className="text-sm">Nenhum usuário encontrado para "{mentionQuery}"</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
