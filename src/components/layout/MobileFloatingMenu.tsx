'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { User, UserPlus, Menu, X } from 'lucide-react'

export function MobileFloatingMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const handleLogin = () => {
    window.location.href = '/auth'
  }

  const handleRegister = () => {
    window.location.href = '/cadastro'
  }

  return (
    <>
      {/* Botão flutuante */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Menu expandido */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 md:hidden">
          <Card className="w-64 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4 space-y-3">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900">Acesse sua conta</h3>
                <p className="text-sm text-gray-600">Entre ou crie uma conta</p>
              </div>
              
              <Button
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-primary/90 text-white"
                size="lg"
              >
                <User className="h-4 w-4 mr-2" />
                Fazer Login
              </Button>
              
              <Button
                onClick={handleRegister}
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/5"
                size="lg"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay para fechar o menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
