import { RequestMonitor } from '@/components/admin/RequestMonitor'

export default function AdminMonitorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Monitor de Requisições
          </h1>
          <p className="text-gray-600">
            Detecção de loops e monitoramento de requisições ao Supabase
          </p>
        </div>
        
        <RequestMonitor />
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">🔍 O que este monitor detecta:</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <strong>Loops de Notificações:</strong> Usuários com muitas notificações repetidas
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <strong>Spikes de Requisições:</strong> Aumentos súbitos no número de requisições
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <strong>Padrões Suspeitos:</strong> Mesmo título/mensagem repetido muitas vezes
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <strong>Usuários Problemáticos:</strong> Usuários com mais de 100 requisições por hora
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">🛠️ Ações Recomendadas:</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              <div>
                <strong>Limpar Notificações:</strong> Use a ferramenta em /admin/notificacoes para limpar notificações em massa
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              <div>
                <strong>Executar Script SQL:</strong> Use o script monitor-requisicoes-loops.sql no Supabase SQL Editor
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              <div>
                <strong>Monitorar Logs:</strong> Verifique o console do navegador para erros de JavaScript
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
