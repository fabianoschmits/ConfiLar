import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { createServerSupabaseClient } from '@/lib/supabase'
import { AuthProvider } from "@/contexts/AuthContext"
import { FloatingChatProvider } from "@/contexts/FloatingChatContext"
import { NotificationProvider } from "@/components/notifications/NotificationProvider"
import { AutoReauthentication } from '@/components/auth/AutoReauthentication'
import { LoadingProvider } from "@/hooks/useLoading"
import { LoadingOverlayProvider } from "@/components/ui/LoadingOverlayProvider"
import { QueryProvider } from "@/lib/queryClient"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ServiceWorkerCleaner } from "@/components/ServiceWorkerCleaner"
import { Suspense } from "react"
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"
import { FloatingChatWrapper } from "@/components/layout/ClientComponents"

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
  const supabase = createServerSupabaseClient()
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suprimir erros específicos do Ethereum
              const originalError = console.error;
              console.error = function(...args) {
                const message = args.join(' ');
                
                // Ignorar erros específicos do Ethereum
                if (
                  message.includes('Cannot redefine property: ethereum') ||
                  message.includes('evmAsk.js') ||
                  message.includes('ethereum') && message.includes('redefine')
                ) {
                  return; // Não mostrar o erro
                }
                
                // Mostrar outros erros normalmente
                originalError.apply(console, args);
              };
              
              // Suprimir erros não capturados relacionados ao Ethereum
              window.addEventListener('error', function(event) {
                if (
                  event.message && (
                    event.message.includes('Cannot redefine property: ethereum') ||
                    event.message.includes('evmAsk.js') ||
                    event.message.includes('ethereum') && event.message.includes('redefine')
                  )
                ) {
                  event.preventDefault();
                  return false;
                }
              });
            `
          }}
        />
      </head>
                  <body className={inter.className}>
                    <ServiceWorkerCleaner />
                    <ErrorBoundary>
          <QueryProvider>
            <LoadingProvider>
              <NotificationProvider>
                <AuthProvider initialSession={session}>
                  <AutoReauthentication>
                    <FloatingChatProvider>
                      <Suspense fallback={<LoadingOverlay isLoading={true} message="Carregando aplicação..." />}>
                        {children}
                      </Suspense>
                      <FloatingChatWrapper />
                      <LoadingOverlayProvider />
                      <Toaster position="top-right" richColors />
                    </FloatingChatProvider>
                  </AutoReauthentication>
                </AuthProvider>
              </NotificationProvider>
            </LoadingProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
