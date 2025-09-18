import { NotificationRealtimeTest } from '@/components/test/NotificationRealtimeTest'

export default function TesteNotificacoesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste de Notificações em Tempo Real
          </h1>
          <p className="text-gray-600">
            Verifique se as notificações estão funcionando corretamente em tempo real
          </p>
        </div>
        
        <NotificationRealtimeTest />
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Como Testar:</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <strong>Verifique o Status:</strong> O indicador deve mostrar "Conectado" (verde)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <strong>Teste para Mim:</strong> Clique no botão para enviar uma notificação para você mesmo
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <strong>Verifique o Sino:</strong> O contador no sino deve aumentar imediatamente
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <strong>Teste para Outro:</strong> Envie uma notificação para outro usuário (se houver)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
              <div>
                <strong>Abra o Menu:</strong> Clique no sino para ver as notificações em tempo real
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
