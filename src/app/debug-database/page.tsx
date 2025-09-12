'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface TableInfo {
  name: string
  exists: boolean
  error?: string
  rowCount?: number
}

export default function DebugDatabasePage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)

  const requiredTables = [
    'listings',
    'profiles', 
    'favorites',
    'notification_preferences',
    'messages',
    'reviews',
    'categories'
  ]

  useEffect(() => {
    checkTables()
  }, [])

  const checkTables = async () => {
    setLoading(true)
    const results: TableInfo[] = []

    for (const tableName of requiredTables) {
      try {
        // Tentar fazer uma query simples para verificar se a tabela existe
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (error) {
          results.push({
            name: tableName,
            exists: false,
            error: error.message
          })
        } else {
          results.push({
            name: tableName,
            exists: true,
            rowCount: count || 0
          })
        }
      } catch (err: any) {
        results.push({
          name: tableName,
          exists: false,
          error: err.message
        })
      }
    }

    setTables(results)
    setLoading(false)
  }

  const createMissingTables = async () => {
    setLoading(true)
    
    try {
      // Criar tabela listings se não existir
      const { error: listingsError } = await supabase.rpc('create_listings_table')
      if (listingsError) {
        console.log('Listings table creation error:', listingsError)
      }

      // Criar tabela profiles se não existir
      const { error: profilesError } = await supabase.rpc('create_profiles_table')
      if (profilesError) {
        console.log('Profiles table creation error:', profilesError)
      }

      // Criar tabela favorites se não existir
      const { error: favoritesError } = await supabase.rpc('create_favorites_table')
      if (favoritesError) {
        console.log('Favorites table creation error:', favoritesError)
      }

      toast.success('Tentativa de criação das tabelas concluída')
      await checkTables()
    } catch (error) {
      console.error('Erro ao criar tabelas:', error)
      toast.error('Erro ao criar tabelas')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('count')
        .limit(1)

      if (error) {
        toast.error(`Erro de conexão: ${error.message}`)
      } else {
        toast.success('Conexão com Supabase funcionando!')
      }
    } catch (error: any) {
      toast.error(`Erro de conexão: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Debug do Banco de Dados
            </h1>
            <p className="text-gray-600">
              Verificação do status das tabelas do Supabase
            </p>
          </div>

          <div className="flex gap-4 mb-8 justify-center">
            <Button onClick={testConnection} variant="outline">
              Testar Conexão
            </Button>
            <Button onClick={checkTables} variant="outline">
              Verificar Tabelas
            </Button>
            <Button onClick={createMissingTables} className="bg-blue-600 hover:bg-blue-700">
              Criar Tabelas Faltantes
            </Button>
          </div>

          <div className="space-y-4">
            {tables.map((table) => (
              <Card key={table.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {table.exists ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {table.name}
                        </h3>
                        {table.exists ? (
                          <p className="text-sm text-gray-600">
                            {table.rowCount} registros
                          </p>
                        ) : (
                          <p className="text-sm text-red-600">
                            {table.error || 'Tabela não encontrada'}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={table.exists ? "default" : "destructive"}
                      className={table.exists ? "bg-green-100 text-green-800" : ""}
                    >
                      {table.exists ? "Existe" : "Não Existe"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Informações de Debug */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Informações de Debug
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oolqodaehouaidxuowtw.supabase.co'}</p>
                <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado'}</p>
                <p><strong>Service Role Key:</strong> {process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurado' : 'Não configurado'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}