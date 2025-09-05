'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react'

interface TableInfo {
  name: string
  exists: boolean
  columns?: string[]
  count?: number
  error?: string
}

export function DatabaseChecker() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkTables = async () => {
    setLoading(true)
    setError(null)
    
    const tablesToCheck = [
      'classified_ads',
      'professional_services', 
      'service_categories',
      'profiles'
    ]

    const results: TableInfo[] = []

    for (const tableName of tablesToCheck) {
      try {
        // Verificar se a tabela existe
        const { data: tableExists, error: tableError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .single()

        if (tableError && tableError.code !== 'PGRST116') {
          results.push({
            name: tableName,
            exists: false,
            error: tableError.message
          })
          continue
        }

        const exists = !!tableExists

        if (exists) {
          // Se a tabela existe, verificar colunas e contagem
          try {
            const { data: columns, error: columnsError } = await supabase
              .from('information_schema.columns')
              .select('column_name')
              .eq('table_schema', 'public')
              .eq('table_name', tableName)

            const { count, error: countError } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true })

            results.push({
              name: tableName,
              exists: true,
              columns: columns?.map(c => c.column_name) || [],
              count: count || 0,
              error: columnsError?.message || countError?.message
            })
          } catch (err) {
            results.push({
              name: tableName,
              exists: true,
              error: `Erro ao verificar dados: ${err}`
            })
          }
        } else {
          results.push({
            name: tableName,
            exists: false
          })
        }
      } catch (err) {
        results.push({
          name: tableName,
          exists: false,
          error: `Erro: ${err}`
        })
      }
    }

    setTables(results)
    setLoading(false)
  }

  useEffect(() => {
    checkTables()
  }, [])

  const getStatusIcon = (table: TableInfo) => {
    if (table.error) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    if (table.exists) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (table: TableInfo) => {
    if (table.error) return <Badge variant="secondary">Erro</Badge>
    if (table.exists) return <Badge variant="default">Existe</Badge>
    return <Badge variant="destructive">Não Existe</Badge>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Verificação do Banco de Dados - Classificados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkTables} disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar Novamente'}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid gap-4">
          {tables.map((table) => (
            <Card key={table.name} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(table)}
                    <h3 className="font-semibold">{table.name}</h3>
                  </div>
                  {getStatusBadge(table)}
                </div>

                {table.error && (
                  <p className="text-sm text-red-600 mb-2">{table.error}</p>
                )}

                {table.exists && (
                  <div className="space-y-2">
                    {table.count !== undefined && (
                      <p className="text-sm text-gray-600">
                        <strong>Registros:</strong> {table.count}
                      </p>
                    )}
                    {table.columns && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Colunas:</strong>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {table.columns.map((column) => (
                            <Badge key={column} variant="outline" className="text-xs">
                              {column}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Próximos Passos:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Se <code>classified_ads</code> não existe, execute o script SQL para criá-la</li>
            <li>• Se <code>professional_services</code> não existe, verifique se há dados na tabela <code>profiles</code></li>
            <li>• Se as tabelas existem mas estão vazias, crie alguns dados de teste</li>
            <li>• Verifique se o Realtime está habilitado no Supabase Dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
