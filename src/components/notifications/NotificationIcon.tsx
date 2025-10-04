'use client'

interface NotificationIconProps {
  type: string
  className?: string
}

export function NotificationIcon({ type, className = '' }: NotificationIconProps) {
  const getIcon = () => {
    switch (type) {
      case 'message': return '💬'
      case 'favorite': return '❤️'
      case 'recommendation': return '⭐'
      case 'review': return '⭐'
      case 'system': return '🔔'
      default: return '📢'
    }
  }

  return (
    <div className={`text-lg flex-shrink-0 w-6 h-6 flex items-center justify-center ${className}`}>
      {getIcon()}
    </div>
  )
}
