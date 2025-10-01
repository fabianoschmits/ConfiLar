#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Função para listar tabelas
async function listTables() {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')
    
    if (error) throw error
    
    return {
      tables: data?.map(t => t.table_name) || [],
      count: data?.length || 0
    }
  } catch (error) {
    throw new Error(`Erro ao listar tabelas: ${error.message}`)
  }
}

// Função para executar SQL
async function executeSQL(query) {
  try {
    // Para comandos DDL, usar rpc se disponível
    if (query.toLowerCase().includes('create') || 
        query.toLowerCase().includes('alter') || 
        query.toLowerCase().includes('drop')) {
      
      // Tentar executar via rpc
      const { data, error } = await supabase.rpc('exec', { sql: query })
      
      if (error) {
        // Se rpc não funcionar, retornar instruções
        return {
          success: false,
          message: 'Execute este SQL no Supabase SQL Editor:',
          sql: query,
          instructions: [
            '1. Acesse https://supabase.com/dashboard',
            '2. Vá para SQL Editor',
            '3. Cole e execute o SQL acima'
          ]
        }
      }
      
      return {
        success: true,
        data: data,
        message: 'SQL executado com sucesso'
      }
    }
    
    // Para consultas SELECT, usar query normal
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('*')
      .limit(1)
    
    if (error) throw error
    
    return {
      success: true,
      data: data,
      message: 'Consulta executada com sucesso'
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Erro ao executar SQL: ${error.message}`,
      sql: query,
      instructions: [
        'Execute este SQL manualmente no Supabase SQL Editor:',
        '1. Acesse https://supabase.com/dashboard',
        '2. Vá para SQL Editor',
        '3. Cole e execute o SQL'
      ]
    }
  }
}

// Função para obter informações da tabela
async function getTableInfo(tableName) {
  try {
    // Obter colunas
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', tableName)
      .eq('table_schema', 'public')
    
    if (columnsError) throw columnsError
    
    // Obter índices
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('indexname, indexdef')
      .like('tablename', tableName)
    
    if (indexesError) throw indexesError
    
    return {
      tableName,
      columns: columns || [],
      indexes: indexes || [],
      columnCount: columns?.length || 0,
      indexCount: indexes?.length || 0
    }
  } catch (error) {
    throw new Error(`Erro ao obter informações da tabela ${tableName}: ${error.message}`)
  }
}

// Função para obter dados da tabela
async function getTableData(tableName, limit = 10) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit)
    
    if (error) throw error
    
    return {
      tableName,
      data: data || [],
      count: data?.length || 0,
      hasMore: data?.length === limit
    }
  } catch (error) {
    throw new Error(`Erro ao obter dados da tabela ${tableName}: ${error.message}`)
  }
}

// Função para buscar tabelas
async function searchTables(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .ilike('table_name', `%${searchTerm}%`)
      .order('table_name')
    
    if (error) throw error
    
    return {
      tables: data?.map(t => t.table_name) || [],
      count: data?.length || 0,
      searchTerm
    }
  } catch (error) {
    throw new Error(`Erro ao buscar tabelas: ${error.message}`)
  }
}

// Processar comandos via stdin
process.stdin.on('data', async (data) => {
  try {
    const input = JSON.parse(data.toString())
    const { method, params } = input
    
    let result
    
    switch (method) {
      case 'list_tables':
        result = await listTables()
        break
        
      case 'execute_sql':
        result = await executeSQL(params.query)
        break
        
      case 'get_table_info':
        result = await getTableInfo(params.tableName)
        break
        
      case 'get_table_data':
        result = await getTableData(params.tableName, params.limit)
        break
        
      case 'search_tables':
        result = await searchTables(params.searchTerm)
        break
        
      default:
        result = { error: `Método não encontrado: ${method}` }
    }
    
    console.log(JSON.stringify(result))
  } catch (error) {
    console.log(JSON.stringify({ error: error.message }))
  }
})

// Manter o processo vivo
process.stdin.resume()
