import type { Metadata } from "next";

// Forçar todas as páginas a serem dinâmicas
export const dynamic = "force-dynamic";
import "./globals.css";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AuthProvider } from "@/contexts/AuthContext";
import { FloatingChatProviderSimple } from "@/contexts/FloatingChatContextSimple";
import { NotificationProviderSimple } from "@/components/notifications/NotificationProviderSimple";
import { AvailabilityProvider } from "@/contexts/AvailabilityContext";
// import { AutoReauthentication } from '@/components/auth/AutoReauthentication'
import { LoadingProvider } from "@/hooks/useLoading";
import { LoadingOverlayProvider } from "@/components/ui/LoadingOverlayProvider";
import { QueryProvider } from "@/lib/queryClient";
import { ToasterWithSounds } from "@/components/ui/ToasterWithSounds";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ServiceWorkerCleaner } from "@/components/ServiceWorkerCleaner";
import { Suspense } from "react";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import FloatingChatWrapper from "@/components/chat/FloatingChatWrapper";
import { BanNotification } from "@/components/BanNotification";
import { NewNotificationSystem } from "@/components/notifications/NewNotificationSystem";
import { CookieConsentBanner } from "@/components/lgpd/CookieConsentBanner";
import { PWAManager } from "@/components/pwa/PWAManager";
import { ThemeProvider } from "@/components/theme-provider";
import { OfflineProvider } from "@/components/offline/OfflineProvider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { HelpChatProvider } from "@/contexts/HelpChatContext";
import HelpChatWindow from "@/components/help/HelpChatWindow";
import HelpChatButton from "@/components/help/HelpChatButton";
import { FontSizeApplier } from "@/components/ui/FontSizeApplier";
import { SidebarProvider } from "@/contexts/SidebarContext";
import "@/utils/errorInterceptor"; // Interceptor de erros
// import { AuthContextDebug } from "@/components/debug/AuthContextDebug"

export const metadata: Metadata = {
  title: "ConfiLar - Marketplace de Serviços",
  description:
    "Encontre os melhores profissionais para seus serviços ou ofereça seus serviços profissionais",
  icons: {
    icon: "/imagens/logo/Logo azul - sem fundo - Vertical.png",
    shortcut: "/imagens/logo/Logo azul - sem fundo - Vertical.png",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Recuperar usuário no servidor para evitar tela em branco
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Carregar mensagens de tradução
  const locale = await getLocale();
  const messages = await getMessages();

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
        <link
          rel="apple-touch-icon"
          href="/imagens/logo/Logo branco - fundo verde - Vertical.png"
        />
        <meta
          name="msapplication-TileImage"
          content="/imagens/logo/Logo branco - fundo verde - Vertical.png"
        />
        <meta name="msapplication-TileColor" content="#9CA3AF" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans bg-gray-50 dark:bg-black">
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
              <NextIntlClientProvider messages={messages}>
                <LocaleProvider>
                  <OfflineProvider>
                    <LoadingProvider>
                      <SidebarProvider>
                        <AuthProvider initialSession={session}>
                          <FontSizeApplier />
                          {/* <AutoReauthentication> */}
                          <AvailabilityProvider>
                            <FloatingChatProviderSimple>
                              <NotificationProviderSimple>
                                <HelpChatProvider>
                                  <TutorialProvider>
                                    <Suspense
                                      fallback={
                                        <LoadingOverlay
                                          isLoading={true}
                                          message="Carregando aplicação..."
                                        />
                                      }
                                    >
                                      <BanNotification>
                                        {children}
                                      </BanNotification>
                                    </Suspense>
                                    <FloatingChatWrapper />
                                    <LoadingOverlayProvider />
                                    <NewNotificationSystem />
                                    <CookieConsentBanner />
                                    <PWAManager />
                                    <TutorialOverlay />
                                    <HelpChatWindow />
                                    <ToasterWithSounds
                                      position="top-right"
                                      richColors
                                    />
                                  </TutorialProvider>
                                </HelpChatProvider>
                              </NotificationProviderSimple>
                            </FloatingChatProviderSimple>
                          </AvailabilityProvider>
                          {/* </AutoReauthentication> */}
                        </AuthProvider>
                      </SidebarProvider>
                    </LoadingProvider>
                  </OfflineProvider>
                </LocaleProvider>
              </NextIntlClientProvider>
            </QueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
