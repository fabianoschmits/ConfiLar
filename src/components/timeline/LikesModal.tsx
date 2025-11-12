'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useReactionUsers } from '@/hooks/useReactions'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

interface LikesModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
}

export function LikesModal({ isOpen, onClose, postId }: LikesModalProps) {
  const { reactionUsers, isLoading } = useReactionUsers(postId)

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-md max-h-[80vh] bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Curtidas
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : reactionUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Ninguém curtiu este post ainda
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {reactionUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/perfil/${user.user_id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-inherit no-underline"
                >
                  <Avatar className="w-10 h-10 border-2 border-gray-200 dark:border-gray-800">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate hover:opacity-80 transition-opacity">
                      {user.full_name || user.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

