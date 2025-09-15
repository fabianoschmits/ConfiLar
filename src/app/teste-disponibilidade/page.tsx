'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { AvailabilityToggle } from '@/components/ui/AvailabilityToggle'
import { AvailabilityIndicator } from '@/components/ui/AvailabilityIndicator'
import { MainLayout } from '@/components/layout/MainLayout'

export default function TesteDisponibilidadePage() {
  const { user, profile, loading } = useAuthContext()

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-yellow-400 flex items-center justify-center">
          <div className="text-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
            <h3 className="text-xl font-black text-black mb-2">CARREGANDO...</h3>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user || !profile) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-yellow-400 flex items-center justify-center">
          <div className="text-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
            <h3 className="text-xl font-black text-black mb-2">VOCÊ PRECISA ESTAR LOGADO</h3>
            <p className="text-black font-bold">Faça login para testar a disponibilidade</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-yellow-400 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
            <h1 className="text-3xl font-black text-black mb-6">TESTE DE DISPONIBILIDADE</h1>
            
            <div className="space-y-6">
              {/* Informações do usuário */}
              <div className="bg-gray-100 border-2 border-black p-4">
                <h2 className="text-xl font-black text-black mb-4">INFORMAÇÕES DO USUÁRIO</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-black">Nome:</span>
                    <p className="text-gray-700">{profile.full_name || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-black">Email:</span>
                    <p className="text-gray-700">{profile.email}</p>
                  </div>
                  <div>
                    <span className="font-bold text-black">Tipo:</span>
                    <p className="text-gray-700">{profile.user_type}</p>
                  </div>
                  <div>
                    <span className="font-bold text-black">ID:</span>
                    <p className="text-gray-700 text-xs">{profile.id}</p>
                  </div>
                </div>
              </div>

              {/* Estado atual da disponibilidade */}
              <div className="bg-blue-100 border-2 border-black p-4">
                <h2 className="text-xl font-black text-black mb-4">ESTADO ATUAL</h2>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-black">Disponibilidade no banco:</span>
                  <AvailabilityIndicator 
                    isAvailable={profile.is_available || false} 
                    size="lg" 
                    showText={true}
                  />
                </div>
              </div>

              {/* Controles de disponibilidade */}
              <div className="bg-green-100 border-2 border-black p-4">
                <h2 className="text-xl font-black text-black mb-4">CONTROLES</h2>
                <div className="space-y-4">
                  <div>
                    <span className="font-bold text-black mb-2 block">Toggle Padrão:</span>
                    <AvailabilityToggle size="lg" showLabel={true} />
                  </div>
                  
                  <div>
                    <span className="font-bold text-black mb-2 block">Toggle Compacto:</span>
                    <AvailabilityToggle size="sm" showLabel={true} />
                  </div>
                </div>
              </div>

              {/* Debug */}
              <div className="bg-yellow-100 border-2 border-black p-4">
                <h2 className="text-xl font-black text-black mb-4">DEBUG</h2>
                <div className="bg-black text-green-400 p-4 font-mono text-sm">
                  <pre>{JSON.stringify({
                    userId: user.id,
                    profileId: profile.id,
                    isAvailable: profile.is_available,
                    updatedAt: profile.updated_at
                  }, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
