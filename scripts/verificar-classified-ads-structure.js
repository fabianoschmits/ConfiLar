// Script para verificar estrutura da tabela classified_ads
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('🔍 Verificando estrutura da tabela classified_ads...\n')

  try {
    // Verificar se a tabela existe e obter estrutura
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'classified_ads'
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    })

    if (columnsError) {
      console.log('⚠️ Erro ao buscar colunas via RPC, tentando query direta...\n')
      
      // Tentar buscar dados diretamente para ver quais colunas existem
      const { data, error } = await supabase
        .from('classified_ads')
        .select('*')
        .limit(1)

      if (error) {
        console.error('❌ Erro ao verificar tabela:', error.message)
        return
      }

      console.log('✅ Tabela existe!')
      console.log('📊 Colunas encontradas (primeira linha):')
      if (data && data.length > 0) {
        console.log(JSON.stringify(data[0], null, 2))
      } else {
        console.log('⚠️ Tabela vazia - verificando estrutura via information_schema...')
      }
    } else {
      console.log('✅ Estrutura da tabela classified_ads:\n')
      if (columns && columns.length > 0) {
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`)
        })
      } else {
        console.log('⚠️ Nenhuma coluna encontrada')
      }
    }

    // Verificar índices
    console.log('\n🔍 Verificando índices...')
    const { data: indexes, error: indexesError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'classified_ads'
        AND schemaname = 'public';
      `
    })

    if (!indexesError && indexes && indexes.length > 0) {
      console.log('\n📊 Índices encontrados:')
      indexes.forEach(idx => {
        console.log(`  - ${idx.indexname}`)
      })
    }

    // Verificar RLS
    console.log('\n🔍 Verificando RLS (Row Level Security)...')
    const { data: rls, error: rlsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT tablename, rowsecurity
        FROM pg_tables
        WHERE tablename = 'classified_ads'
        AND schemaname = 'public';
      `
    })

    if (!rlsError && rls && rls.length > 0) {
      console.log(`RLS está ${rls[0].rowsecurity ? '✅ HABILITADO' : '❌ DESABILITADO'}`)
    }

    console.log('\n✅ Verificação concluída!')

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

main()

