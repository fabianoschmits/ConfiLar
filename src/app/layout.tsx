import type { Metadata } from "next"

// Forçar todas as páginas a serem dinâmicas
export const dynamic = 'force-dynamic'
import { Inter } from "next/font/google"
import "./globals.css"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AuthProvider } from "@/contexts/AuthContext"
import { FloatingChatProviderSimple } from "@/contexts/FloatingChatContextSimple"
import { NotificationProviderSimple } from "@/components/notifications/NotificationProviderSimple"
import { AvailabilityProvider } from "@/contexts/AvailabilityContext"
// import { AutoReauthentication } from '@/components/auth/AutoReauthentication'
import { LoadingProvider } from "@/hooks/useLoading"
import { LoadingOverlayProvider } from "@/components/ui/LoadingOverlayProvider"
import { QueryProvider } from "@/lib/queryClient"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ServiceWorkerCleaner } from "@/components/ServiceWorkerCleaner"
import { Suspense } from "react"
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"
import FloatingChatWrapper from "@/components/chat/FloatingChatWrapper"
import { BanNotification } from "@/components/BanNotification"
import { DevTestButton } from "@/components/dev/DevTestButton"
import { NewNotificationSystem } from "@/components/notifications/NewNotificationSystem"
import { NotificationToastManager } from "@/components/notifications/NotificationToastManager"
import "@/utils/errorInterceptor" // Interceptor de erros
// import { AuthContextDebug } from "@/components/debug/AuthContextDebug"

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
  // Recuperar usuário no servidor para evitar tela em branco
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-TileColor" content="#9CA3AF" />
      </head>
                  <body className={inter.className}>
                    <ServiceWorkerCleaner />
                    <ErrorBoundary>
          <QueryProvider>
            <LoadingProvider>
              <AuthProvider initialSession={session}>
                {/* <AutoReauthentication> */}
                  <AvailabilityProvider>
                    <NotificationProviderSimple>
                      <FloatingChatProviderSimple>
                        <Suspense fallback={<LoadingOverlay isLoading={true} message="Carregando aplicação..." />}>
                          <BanNotification>
                            {children}
                          </BanNotification>
                        </Suspense>
                        <FloatingChatWrapper />
                        <LoadingOverlayProvider />
                        <NewNotificationSystem />
                        <NotificationToastManager />
                        {/* <DevTestButton /> */}
                        <Toaster position="top-right" richColors />
                        {/* <AuthContextDebug /> */}
                      </FloatingChatProviderSimple>
                    </NotificationProviderSimple>
                  </AvailabilityProvider>
                {/* </AutoReauthentication> */}
              </AuthProvider>
            </LoadingProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
