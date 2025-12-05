'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface LikeUser {
  id: string
  full_name: string
  avatar_url?: string
  is_premium: boolean
  created_at: string
}

interface FloatingLikesProps {
  likeUsers: LikeUser[]
  isVisible: boolean
}

interface FloatingLike extends LikeUser {
  animationId: string
  delay: number
}

export function FloatingLikes({ likeUsers, isVisible }: FloatingLikesProps) {
  const [floatingLikes, setFloatingLikes] = useState<FloatingLike[]>([])

  useEffect(() => {
    if (!isVisible || likeUsers.length === 0) {
      setFloatingLikes([])
      return
    }

    // Selecionar 3-5 likes aleatórios
    const numToShow = Math.min(Math.max(3, Math.floor(Math.random() * 3) + 3), likeUsers.length)
    const shuffled = [...likeUsers].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, numToShow)

    // Criar likes flutuantes com delays
    const floating = selected.map((like, index) => ({
      ...like,
      animationId: `${like.id}-${Date.now()}-${index}`,
      delay: index * 500 // 500ms de delay entre cada
    }))

    setFloatingLikes(floating)

    // Criar um loop contínuo
    const interval = setInterval(() => {
      const numToShow = Math.min(Math.max(3, Math.floor(Math.random() * 3) + 3), likeUsers.length)
      const shuffled = [...likeUsers].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, numToShow)

      const floating = selected.map((like, index) => ({
        ...like,
        animationId: `${like.id}-${Date.now()}-${index}`,
        delay: index * 500
      }))

      setFloatingLikes(floating)
    }, 4000) // Reiniciar a cada 4 segundos

    return () => clearInterval(interval)
  }, [likeUsers, isVisible])

  if (!isVisible || floatingLikes.length === 0) {
    return null
  }

  return (
    <div className="fixed right-4 bottom-0 top-0 pointer-events-none z-20 w-20">
      {floatingLikes.map((like) => (
        <FloatingHeart key={like.animationId} like={like} />
      ))}
    </div>
  )
}

function FloatingHeart({ like }: { like: FloatingLike }) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Delay para iniciar a animação
    const timer = setTimeout(() => {
      setShouldRender(true)
    }, like.delay)

    return () => clearTimeout(timer)
  }, [like.delay])

  if (!shouldRender) return null

  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{
        animation: 'floatHeart 3.5s ease-out forwards',
        animationDelay: '0ms'
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Coração de fundo */}
        <div
          className={`absolute inset-0 rounded-full blur-md ${
            like.is_premium
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
              : 'bg-gradient-to-r from-red-400 to-red-600'
          }`}
          style={{ transform: 'scale(1.2)' }}
        />

        {/* Container do coração com avatar */}
        <div
          className={`relative flex items-center justify-center w-16 h-16 rounded-full ${
            like.is_premium
              ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600'
              : 'bg-gradient-to-br from-red-400 via-red-500 to-red-600'
          } shadow-lg`}
        >
          {/* Avatar do usuário */}
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarImage src={like.avatar_url || undefined} />
            <AvatarFallback className="bg-white text-xs font-bold">
              {like.full_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Ícone de coração pequeno no canto */}
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
            <Heart
              className={`h-3 w-3 ${
                like.is_premium ? 'text-yellow-500 fill-yellow-500' : 'text-red-500 fill-red-500'
              }`}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatHeart {
          0% {
            transform: translateY(0) translateX(0) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-10vh) translateX(0) scale(1);
          }
          25% {
            transform: translateY(-25vh) translateX(20px) scale(1) rotate(10deg);
          }
          50% {
            transform: translateY(-50vh) translateX(-20px) scale(0.9) rotate(-10deg);
          }
          75% {
            transform: translateY(-75vh) translateX(15px) scale(0.8) rotate(5deg);
          }
          90% {
            opacity: 0.8;
            transform: translateY(-90vh) translateX(-10px) scale(0.6);
          }
          100% {
            transform: translateY(-100vh) translateX(0) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

