'use client'

import React, { useState } from 'react'
import { MentionInput } from '@/components/ui/MentionInput'
import { supabase } from '@/lib/supabase'

export function MentionDebug() {
  const [text, setText] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testSupabaseConnection = async () => {
    setLoading(true)
    try {
      console.log('🔍 Testando conexão com Supabase...')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type')
        .limit(5)

      if (error) {
        console.error('❌ Erro na consulta:', error)
      } else {
        console.log('✅ Usuários encontrados:', data)
        setUsers(data || [])
      }
    } catch (error) {
      console.error('❌ Erro geral:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Debug do Sistema de Menções</h2>
      
      <div className="space-y-2">
        <button 
          onClick={testSupabaseConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Conexão Supabase'}
        </button>
        
        {users.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800">Usuários encontrados:</h3>
            <ul className="mt-2 space-y-1">
              {users.map(user => (
                <li key={user.id} className="text-sm text-green-700">
                  {user.full_name} ({user.user_type})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Teste do MentionInput:</label>
        <MentionInput
          value={text}
          onChange={setText}
          placeholder="Digite @ para testar..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          minHeight="100px"
        />
        <div className="text-sm text-gray-600">
          Texto atual: "{text}"
        </div>
      </div>
    </div>
  )
}
