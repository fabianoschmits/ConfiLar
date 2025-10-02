'use client'

import { NotificationProvider } from './DemoNotificationSystem'
import { DemoNotificationBell } from './DemoNotificationBell'

interface NotificationIntegrationProps {
  children: React.ReactNode
}

export function NotificationIntegration({ children }: NotificationIntegrationProps) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  )
}

export { DemoNotificationBell }



