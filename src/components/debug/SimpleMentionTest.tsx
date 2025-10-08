'use client'

import React, { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'
import { MentionText } from '@/components/ui/MentionText'

interface User {
  id: string
  full_name: string
  avatar_url?: string
  user_type: 'professional' | 'client'
}

export function SimpleMentionTest() {
  const [text, setText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [mentionQuery, setMentionQuery] = useState('')
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const addDebugInfo = (info: string) => {
    console.log('🐛 DEBUG:', info)
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`])
  }

  // Buscar usuários
  const searchUsers = useCallback(async (query: string) => {
    addDebugInfo(`Buscando usuários para: "${query}"`)
    
    if (!query.trim()) {
      setSuggestions([])
      addDebugInfo('Query vazia, limpando sugestões')
      return
    }

    setIsLoading(true)
    try {
      addDebugInfo('Fazendo consulta ao Supabase...')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type')
        .ilike('full_name', `%${query}%`)
        .order('full_name')
        .limit(10)

      if (error) {
        addDebugInfo(`❌ Erro: ${error.message}`)
        console.error('Erro ao buscar usuários:', error)
        setSuggestions([])
      } else {
        addDebugInfo(`✅ Encontrados ${data?.length || 0} usuários`)
        console.log('Usuários encontrados:', data)
        setSuggestions(data || [])
      }
    } catch (error) {
      addDebugInfo(`❌ Erro geral: ${error}`)
      console.error('Erro ao buscar usuários:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Detectar menções
  const detectMention = useCallback((text: string, cursorPosition: number) => {
    addDebugInfo(`Detectando menção - Texto: "${text}", Cursor: ${cursorPosition}`)
    
    const beforeCursor = text.substring(0, cursorPosition)
    addDebugInfo(`Texto antes do cursor: "${beforeCursor}"`)
    
    // Testar diferentes regex
    const regex1 = /@(\w*)$/  // Original
    const regex2 = /@([^\s]*)$/  // Mais permissiva
    const regex3 = /@(.*?)$/  // Muito permissiva
    
    const match1 = beforeCursor.match(regex1)
    const match2 = beforeCursor.match(regex2)
    const match3 = beforeCursor.match(regex3)
    
    addDebugInfo(`Regex 1 (@\\w*): ${match1 ? `"${match1[1]}"` : 'null'}`)
    addDebugInfo(`Regex 2 (@[^\\s]*): ${match2 ? `"${match2[1]}"` : 'null'}`)
    addDebugInfo(`Regex 3 (@.*?): ${match3 ? `"${match3[1]}"` : 'null'}`)
    
    const mentionMatch = match1 || match2 || match3
    
    if (mentionMatch) {
      const start = beforeCursor.lastIndexOf('@')
      addDebugInfo(`✅ Menção detectada! Início: ${start}, Query: "${mentionMatch[1]}"`)
      
      setMentionQuery(mentionMatch[1])
      setShowSuggestions(true)
      searchUsers(mentionMatch[1])
    } else {
      addDebugInfo('❌ Nenhuma menção detectada')
      setMentionQuery('')
      setShowSuggestions(false)
    }
  }, [searchUsers])

  // Lidar com mudanças no texto
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPosition = e.target.selectionStart
    
    addDebugInfo(`Texto alterado: "${newValue}"`)
    
    setText(newValue)
    detectMention(newValue, cursorPosition)
  }

  // Selecionar usuário
  const handleUserSelect = (user: User) => {
    addDebugInfo(`Usuário selecionado: ${user.full_name}`)
    
    // Encontrar a posição do @ e substituir corretamente
    const beforeMention = text.substring(0, text.lastIndexOf('@'))
    const afterMention = text.substring(text.lastIndexOf('@') + 1 + mentionQuery.length)
    const newText = `${beforeMention}@${user.full_name} ${afterMention}`
    
    addDebugInfo(`Antes: "${beforeMention}", Depois: "${afterMention}", Novo: "${newText}"`)
    
    setText(newText)
    setShowSuggestions(false)
    
    // Focar no textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newText.length, newText.length)
      }
    }, 0)
  }

  // Testar busca manual
  const testManualSearch = async () => {
    addDebugInfo('🧪 Teste manual de busca...')
    await searchUsers('Fabiano')
  }

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">🧪 Teste Simples do Sistema de Menções</h2>
      
      {/* Debug Info */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">🐛 Debug Info:</h3>
        <div className="space-y-1 text-sm">
          {debugInfo.map((info, index) => (
            <div key={index} className="text-gray-700">{info}</div>
          ))}
        </div>
      </div>

      {/* Controles de Teste */}
      <div className="flex space-x-2">
        <button 
          onClick={testManualSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🧪 Teste Manual
        </button>
        <button 
          onClick={() => setText('')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          🗑️ Limpar
        </button>
      </div>

      {/* Campo de Teste */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Teste do MentionInput:</label>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder="Digite @ para testar..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-sm text-gray-600">
          Texto atual: "{text}"
        </div>
        
        {/* Preview das menções */}
        {text && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview das menções:</h4>
            <div className="text-sm">
              <MentionText text={text} />
            </div>
          </div>
        )}
      </div>

      {/* Sugestões via Portal */}
      {showSuggestions && createPortal(
        <div className="fixed bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[99999]"
             style={{
               top: '50%',
               left: '50%',
               transform: 'translate(-50%, -50%)',
               width: '300px'
             }}>
          <div className="p-2 bg-gray-50 border-b">
            <h4 className="font-semibold text-sm">Sugestões:</h4>
          </div>
          <div className="max-h-60 overflow-y-auto">
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
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user.full_name}</div>
                    <div className="text-xs text-gray-500">
                      {user.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                <span className="text-sm">Nenhum usuário encontrado</span>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Instruções */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Instruções:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Digite @ no campo de texto</li>
          <li>2. Digite algumas letras (ex: @Fab)</li>
          <li>3. Verifique se aparecem sugestões</li>
          <li>4. Clique em um usuário para selecionar</li>
          <li>5. Observe as informações de debug</li>
        </ul>
      </div>
    </div>
  )
}
