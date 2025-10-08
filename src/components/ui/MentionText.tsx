'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface MentionTextProps {
  text: string
  className?: string
}

export function MentionText({ text, className = "" }: MentionTextProps) {
  const router = useRouter()

  // Função para lidar com clique na menção
  const handleMentionClick = async (e: React.MouseEvent, username: string) => {
    e.preventDefault()
    
    console.log('🔍 Clicou na menção:', username)
    
    try {
      // Buscar o usuário pelo nome completo
      const url = `/api/users/search?name=${encodeURIComponent(username)}`
      console.log('📡 Fazendo requisição:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('📥 Resposta da API:', data)
      
      if (data.userId) {
        console.log('✅ Redirecionando para:', `/perfil/${data.userId}`)
        router.push(`/perfil/${data.userId}`)
      } else {
        console.error('❌ Usuário não encontrado:', username)
        alert(`Usuário "${username}" não encontrado`)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error)
      alert('Erro ao buscar usuário. Tente novamente.')
    }
  }

  // Função para renderizar texto com menções destacadas
  const renderTextWithMentions = (text: string) => {
    // Regex para encontrar menções (@nome ou @nome sobrenome)
    const mentionRegex = /(@[a-zA-ZÀ-ÿ]+(?:\s+[a-zA-ZÀ-ÿ]+)?)/g
    const parts = text.split(mentionRegex)
    
    return parts.map((part, index) => {
      if (part.match(mentionRegex)) {
        const username = part.substring(1).trim()
        
        return (
          <a
            key={index}
            href="#"
            onClick={(e) => handleMentionClick(e, username)}
            className="text-blue-600 font-bold hover:text-blue-800 transition-colors cursor-pointer inline-block"
            title={`Ver perfil de ${username}`}
          >
            {part}
          </a>
        )
      }
      
      return part
    })
  }

  return (
    <span className={className}>
      {renderTextWithMentions(text)}
    </span>
  )
}
