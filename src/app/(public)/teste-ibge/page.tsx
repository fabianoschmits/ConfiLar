'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EstadoCombobox, CidadeCombobox } from '@/components/ui/LocationComboboxes'
import { useIBGE } from '@/hooks/useIBGE'
import { ibgeService } from '@/lib/ibge'

export default function TesteIBGEPage() {
  const [estadoSelecionado, setEstadoSelecionado] = useState('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState('')
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null)
  const [cacheCleared, setCacheCleared] = useState(false)
  
  const { 
    estados, 
    cidades, 
    loading, 
    error, 
    checkHealth, 
    clearCache 
  } = useIBGE()

  const handleHealthCheck = async () => {
    const status = await checkHealth()
    setHealthStatus(status)
  }

  const handleClearCache = () => {
    clearCache()
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste da API do IBGE
          </h1>
          <p className="text-gray-600">
            Página para testar a integração com a API do Instituto Brasileiro de Geografia e Estatística
          </p>
        </div>

        {/* Status da API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status da API
              <div className="flex gap-2">
                <Button 
                  onClick={handleHealthCheck}
                  variant="outline"
                  size="sm"
                >
                  Verificar Saúde
                </Button>
                <Button 
                  onClick={handleClearCache}
                  variant="outline"
                  size="sm"
                >
                  Limpar Cache
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Status:</span>
              {healthStatus === null && (
                <Badge variant="secondary">Não verificado</Badge>
              )}
              {healthStatus === true && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✅ Funcionando
                </Badge>
              )}
              {healthStatus === false && (
                <Badge variant="destructive">❌ Erro na API</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-medium">Cache:</span>
              {cacheCleared ? (
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  Cache limpo!
                </Badge>
              ) : (
                <Badge variant="secondary">Ativo</Badge>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">Erro: {error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Total de Estados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : estados.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Cidades do Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estadoSelecionado ? (loading ? '...' : cidades.length) : '-'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Estado Selecionado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {estadoSelecionado || '-'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teste dos Comboboxes */}
        <Card>
          <CardHeader>
            <CardTitle>Teste dos Comboboxes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <EstadoCombobox
                value={estadoSelecionado}
                onValueChange={setEstadoSelecionado}
                placeholder="Selecione um estado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade
              </label>
              <CidadeCombobox
                value={cidadeSelecionada}
                onValueChange={setCidadeSelecionada}
                estadoSigla={estadoSelecionado}
                placeholder="Selecione uma cidade"
                disabled={!estadoSelecionado}
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Seleção Atual:</h4>
              <p><strong>Estado:</strong> {estadoSelecionado || 'Nenhum selecionado'}</p>
              <p><strong>Cidade:</strong> {cidadeSelecionada || 'Nenhuma selecionada'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Estados */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Estados ({estados.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando estados...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {estados.map((estado) => (
                  <div
                    key={estado.sigla}
                    className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => setEstadoSelecionado(estado.sigla)}
                  >
                    <div className="font-medium">{estado.sigla}</div>
                    <div className="text-sm text-gray-600 truncate" title={estado.nome}>
                      {estado.nome}
                    </div>
                    <div className="text-xs text-gray-500">{estado.regiao}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Cidades */}
        {estadoSelecionado && (
          <Card>
            <CardHeader>
              <CardTitle>
                Cidades de {estados.find(e => e.sigla === estadoSelecionado)?.nome} ({cidades.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando cidades...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {cidades.map((cidade) => (
                    <div
                      key={cidade.id}
                      className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => setCidadeSelecionada(cidade.nome)}
                    >
                      <div className="font-medium truncate" title={cidade.nome}>
                        {cidade.nome}
                      </div>
                      <div className="text-xs text-gray-500">{cidade.estadoSigla}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}




