'use client'

import React, { useState, useEffect } from 'react'
import { X, MessageCircle, Heart, Star, Shield, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationToastProps {
  notification: {
    id: string
    title: string
    message: string
    type: string
    created_at: Date | string
  }
  onClose: () => void
  position?: 'top' | 'bottom'
}

export function NotificationToast({ notification, onClose, position = 'top' }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Mostrar notificação
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Auto-fechar após 4 segundos
    const hideTimer = setTimeout(() => {
      handleClose()
    }, 4000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4" />
      case 'favorite':
        return <Heart className="w-4 h-4" />
      case 'recommendation':
        return <Star className="w-4 h-4" />
      case 'review':
        return <Star className="w-4 h-4" />
      case 'system':
        return <Shield className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'favorite':
        return 'bg-pink-50 border-pink-200 text-pink-900'
      case 'recommendation':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'review':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'system':
        return 'bg-gray-50 border-gray-200 text-gray-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  return (
    <div
      className={cn(
        "fixed z-[200] transition-all duration-500 ease-out",
        position === 'top' ? "top-20" : "bottom-24",
        "left-1/2 transform -translate-x-1/2",
        "w-80 max-w-[calc(100vw-2rem)]",
        isVisible && !isExiting 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-[-120%] opacity-0 scale-95"
      )}
    >
      <div
        className={cn(
          "bg-white border rounded-lg shadow-lg p-4 relative",
          getNotificationColor(notification.type)
        )}
      >
        {/* Botão de fechar */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Conteúdo da notificação */}
        <div className="flex items-start gap-3 pr-6">
          {/* Ícone */}
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight">
              {notification.title}
            </h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-[4000ms] ease-linear"
            style={{ 
              width: '100%',
              animation: 'shrink 4s linear forwards'
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Hook para gerenciar notificações toast
export function useNotificationToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    notification: any
  }>>([])

  const addToast = (notification: any) => {
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setToasts(prev => [...prev, { id: toastId, notification }])
  }

  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId))
  }

  return {
    toasts,
    addToast,
    removeToast
  }
}
