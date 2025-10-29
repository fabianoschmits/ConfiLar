#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRelationships() {
  console.log('🔧 Corrigindo relacionamentos no banco de dados...\n')

  try {
    // 1. Verificar estrutura atual da tabela points_transfers
    console.log('📊 Verificando estrutura da tabela points_transfers...')
    
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'points_transfers' })

    if (tableError) {
      console.log('⚠️ Não foi possível obter informações da tabela:', tableError.message)
    } else {
      console.log('✅ Estrutura da tabela obtida')
    }

    // 2. Tentar criar as foreign keys necessárias
    console.log('\n🔗 Criando foreign keys...')
    
    const foreignKeys = [
      {
        table: 'points_transfers',
        column: 'from_user_id',
        references: 'profiles(id)',
        name: 'points_transfers_from_user_id_fkey'
      },
      {
        table: 'points_transfers', 
        column: 'to_user_id',
        references: 'profiles(id)',
        name: 'points_transfers_to_user_id_fkey'
      },
      {
        table: 'points_withdrawals',
        column: 'user_id', 
        references: 'profiles(id)',
        name: 'points_withdrawals_user_id_fkey'
      },
      {
        table: 'points_purchases',
        column: 'user_id',
        references: 'profiles(id)', 
        name: 'points_purchases_user_id_fkey'
      }
    ]

    for (const fk of foreignKeys) {
      try {
        console.log(`   Criando FK: ${fk.name}...`)
        
        const { error: fkError } = await supabase
          .rpc('create_foreign_key', {
            table_name: fk.table,
            column_name: fk.column,
            referenced_table: fk.references.split('(')[0],
            referenced_column: fk.references.split('(')[1].replace(')', ''),
            constraint_name: fk.name
          })

        if (fkError) {
          console.log(`   ⚠️ ${fk.name}: ${fkError.message}`)
        } else {
          console.log(`   ✅ ${fk.name}: Criada com sucesso`)
        }
      } catch (error) {
        console.log(`   ❌ ${fk.name}: ${error.message}`)
      }
    }

    // 3. Testar os relacionamentos após a correção
    console.log('\n🧪 Testando relacionamentos...')
    
    const { data: testData, error: testError } = await supabase
      .from('points_transfers')
      .select(`
        *,
        from_user:profiles!points_transfers_from_user_id_fkey(id, full_name, avatar_url),
        to_user:profiles!points_transfers_to_user_id_fkey(id, full_name, avatar_url)
      `)
      .limit(1)

    if (testError) {
      console.log('❌ Relacionamentos ainda com problema:', testError.message)
    } else {
      console.log('✅ Relacionamentos funcionando!')
    }

    // 4. Alternativa: Criar views que funcionem
    console.log('\n📋 Criando views alternativas...')
    
    const viewQueries = [
      {
        name: 'points_transfers_with_users',
        query: `
          CREATE OR REPLACE VIEW points_transfers_with_users AS
          SELECT 
            pt.*,
            from_profile.full_name as from_user_name,
            from_profile.avatar_url as from_user_avatar,
            to_profile.full_name as to_user_name, 
            to_profile.avatar_url as to_user_avatar
          FROM points_transfers pt
          LEFT JOIN profiles from_profile ON pt.from_user_id = from_profile.id
          LEFT JOIN profiles to_profile ON pt.to_user_id = to_profile.id
        `
      }
    ]

    for (const view of viewQueries) {
      try {
        console.log(`   Criando view: ${view.name}...`)
        
        const { error: viewError } = await supabase
          .rpc('exec_sql', { sql: view.query })

        if (viewError) {
          console.log(`   ⚠️ ${view.name}: ${viewError.message}`)
        } else {
          console.log(`   ✅ ${view.name}: Criada com sucesso`)
        }
      } catch (error) {
        console.log(`   ❌ ${view.name}: ${error.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar o script
fixRelationships()
  .then(() => {
    console.log('\n✅ Correção concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })


