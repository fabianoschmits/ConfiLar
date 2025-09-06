import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { FloatingChatProvider } from "@/contexts/FloatingChatContext"
import { NotificationProvider } from "@/components/notifications/NotificationProvider"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ServiceWorkerCleaner } from "@/components/ServiceWorkerCleaner"
import { FloatingChatWrapper } from "@/components/chat/FloatingChatWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ConfiLar - Marketplace de Serviços",
  description: "Encontre os melhores profissionais para seus serviços ou ofereça seus serviços profissionais",
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-TileColor" content="#9CA3AF" />
      </head>
      <body className={inter.className}>
        <ServiceWorkerCleaner />
        <ErrorBoundary>
          <NotificationProvider>
            <AuthProvider>
              <FloatingChatProvider>
                {children}
                <FloatingChatWrapper />
                <Toaster position="top-right" richColors />
              </FloatingChatProvider>
            </AuthProvider>
          </NotificationProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
