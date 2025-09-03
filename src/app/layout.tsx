import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/components/notifications/NotificationProvider"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { PWAInitializer } from "@/components/pwa/PWAInitializer"

// 🧹 LIMPEZA AUTOMÁTICA DO SERVICE WORKER ANTIGO
// Desregistra todos os Service Workers antigos quando o usuário acessa o site
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => {
      reg.unregister();
      console.log("🧹 Service Worker removido:", reg);
    });
  });
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ConfiLar - Marketplace de Serviços",
  description: "Encontre os melhores profissionais para seus serviços ou ofereça seus serviços profissionais",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ConfiLar"
  },
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ConfiLar" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-TileColor" content="#9CA3AF" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <NotificationProvider>
            <AuthProvider>
              <PWAInitializer />
              {children}
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </NotificationProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
