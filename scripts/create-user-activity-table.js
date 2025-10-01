const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUserActivityTable() {
  console.log('🚀 Criando tabela user_activity no Supabase...')
  
  try {
    // SQL para criar a tabela
    const sql = `
      -- Criar tabela de atividade do usuário
      CREATE TABLE IF NOT EXISTS user_activity (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_online BOOLEAN DEFAULT true,
        status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline', 'inactive')),
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar índices para performance
      CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON user_activity(last_seen);
      CREATE INDEX IF NOT EXISTS idx_user_activity_is_online ON user_activity(is_online);
      CREATE INDEX IF NOT EXISTS idx_user_activity_status ON user_activity(status);

      -- Criar trigger para atualizar updated_at
      CREATE OR REPLACE FUNCTION update_user_activity_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_update_user_activity_updated_at
        BEFORE UPDATE ON user_activity
        FOR EACH ROW
        EXECUTE FUNCTION update_user_activity_updated_at();

      -- Habilitar RLS
      ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

      -- Criar políticas RLS
      CREATE POLICY "Users can view their own activity" ON user_activity
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can update their own activity" ON user_activity
        FOR UPDATE USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert their own activity" ON user_activity
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `

    // Executar SQL
    const { data, error } = await supabase.rpc('exec', { sql })
    
    if (error) {
      console.error('❌ Erro ao criar tabela:', error)
      return
    }

    console.log('✅ Tabela user_activity criada com sucesso!')
    
    // Inserir dados iniciais para usuários existentes
    console.log('📊 Inserindo dados iniciais para usuários existentes...')
    
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1000)

    if (usersError) {
      console.log('⚠️ Não foi possível buscar usuários existentes:', usersError.message)
    } else if (users && users.length > 0) {
      const insertData = users.map(user => ({
        user_id: user.id,
        last_seen: new Date().toISOString(),
        is_online: true,
        status: 'online',
        last_activity: new Date().toISOString()
      }))

      const { error: insertError } = await supabase
        .from('user_activity')
        .upsert(insertData, { onConflict: 'user_id' })

      if (insertError) {
        console.log('⚠️ Erro ao inserir dados iniciais:', insertError.message)
      } else {
        console.log(`✅ Dados iniciais inseridos para ${users.length} usuários`)
      }
    }

    console.log('🎉 Sistema de status de conectividade configurado com sucesso!')
    
  } catch (err) {
    console.error('❌ Erro geral:', err)
  }
}

// Executar
createUserActivityTable()
