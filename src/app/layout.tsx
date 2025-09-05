import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
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
        <div className="min-h-screen w-full bg-[#fff8f0] relative">
          {/* Soft Warm Pastel Texture */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 80%, rgba(255, 182, 153, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 244, 214, 0.5) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(255, 182, 153, 0.1) 0%, transparent 50%)`,
            }}
          />
          {/* Your Content/Components */}
          <div className="relative z-10">
            <ServiceWorkerCleaner />
            <ErrorBoundary>
              <NotificationProvider>
                <AuthProvider>
                  {children}
                  <FloatingChatWrapper />
                  <Toaster position="top-right" richColors />
                </AuthProvider>
              </NotificationProvider>
            </ErrorBoundary>
          </div>
        </div>
      </body>
    </html>
  )
}
