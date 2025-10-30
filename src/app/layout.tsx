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
import { ToasterWithSounds } from "@/components/ui/ToasterWithSounds"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ServiceWorkerCleaner } from "@/components/ServiceWorkerCleaner"
import { Suspense } from "react"
import { LoadingOverlay } from "@/components/ui/LoadingOverlay"
import FloatingChatWrapper from "@/components/chat/FloatingChatWrapper"
import { BanNotification } from "@/components/BanNotification"
import { DevTestButton } from "@/components/dev/DevTestButton"
import { NewNotificationSystem } from "@/components/notifications/NewNotificationSystem"
import { CookieConsentBanner } from "@/components/lgpd/CookieConsentBanner"
import { PWAManager } from "@/components/pwa/PWAManager"
import { ThemeProvider } from "@/components/theme-provider"
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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Script inline para prevenir FOUC (Flash of Unstyled Content) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('confilar-theme');
                  if (theme) {
                    try {
                      var themeData = JSON.parse(theme);
                      theme = themeData.theme || theme;
                    } catch(e) {
                      // Se não for JSON, usar o valor direto
                    }
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } else {
                    // Tema padrão: light
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {
                  console.error('Erro ao carregar tema:', e);
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/imagens/logo/confilarlogo5.png" />
        <meta name="msapplication-TileImage" content="/imagens/logo/confilarlogo5.png" />
        <meta name="msapplication-TileColor" content="#9CA3AF" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
          storageKey="confilar-theme"
          forcedTheme={undefined}
          enableColorScheme={true}
          nonce={undefined}
        >
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
                          <CookieConsentBanner />
                          <PWAManager />
                          {/* <DevTestButton /> */}
                          <ToasterWithSounds position="top-right" richColors />
                          {/* <AuthContextDebug /> */}
                        </FloatingChatProviderSimple>
                      </NotificationProviderSimple>
                    </AvailabilityProvider>
                  {/* </AutoReauthentication> */}
                </AuthProvider>
              </LoadingProvider>
            </QueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
