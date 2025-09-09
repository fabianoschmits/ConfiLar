import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AuthProvider } from "@/contexts/AuthContext"
import { FloatingChatProvider } from "@/contexts/FloatingChatContext"
import { NotificationProvider } from "@/components/notifications/NotificationProvider"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ServiceWorkerCleaner } from "@/components/ServiceWorkerCleaner"
import { Suspense } from "react"
import { FastPageLoading } from "@/components/ui/FastLoading"
import { FloatingChatWrapper, MetaMaskErrorSuppressor } from "@/components/layout/ClientComponents"

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Recuperar sessão no servidor para evitar tela em branco
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-TileColor" content="#9CA3AF" />
      </head>
      <body className={inter.className}>
        <ServiceWorkerCleaner />
        <MetaMaskErrorSuppressor />
        <ErrorBoundary>
          <NotificationProvider>
            <AuthProvider initialSession={session}>
              <FloatingChatProvider>
                <Suspense fallback={<FastPageLoading text="Carregando aplicação..." />}>
                  {children}
                </Suspense>
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
