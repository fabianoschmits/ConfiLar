#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyAndFixPremiumCron() {
  const issues = []
  const fixes = []

  try {
    console.log('🔍 Verificando sistema de expiração premium no Supabase...\n')

    // 1. Verificar se a função existe
    console.log('1️⃣ Verificando função de desativação...')
    const { data: funcTest, error: funcError } = await supabase
      .rpc('deactivate_expired_premium_classifieds')

    if (funcError) {
      console.log('❌ Função não encontrada ou com erro:', funcError.message)
      issues.push('Função deactivate_expired_premium_classifieds não existe ou tem erro')
      
      fixes.push(`
-- =====================================================
-- CRIAR FUNÇÃO DE DESATIVAÇÃO DE ANÚNCIOS PREMIUM EXPIRADOS
-- =====================================================
CREATE OR REPLACE FUNCTION deactivate_expired_premium_classifieds()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Desativar classificados premium expirados
  UPDATE classified_ads
  SET 
    is_active = false,
    is_premium = false,
    is_featured = false,
    updated_at = NOW()
  WHERE 
    is_premium = true
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < NOW()
    AND is_active = true;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  RETURN affected_count;
END;
$$;

COMMENT ON FUNCTION deactivate_expired_premium_classifieds() IS 'Desativa anúncios premium que expiraram';
`)
    } else {
      console.log('✅ Função existe e está funcionando')
    }

    // 2. Verificar colunas necessárias
    console.log('\n2️⃣ Verificando estrutura da tabela...')
    const { data: testQuery, error: testError } = await supabase
      .from('classified_ads')
      .select('is_premium, premium_expires_at, is_active, is_featured')
      .limit(1)

    if (testError && testError.code === '42703') {
      const missingCols = []
      if (testError.message.includes('is_premium')) missingCols.push('is_premium')
      if (testError.message.includes('premium_expires_at')) missingCols.push('premium_expires_at')
      if (testError.message.includes('is_featured')) missingCols.push('is_featured')
      
      console.log(`❌ Colunas faltando: ${missingCols.join(', ')}`)
      issues.push(`Colunas faltando: ${missingCols.join(', ')}`)
      
      fixes.push(`
-- =====================================================
-- ADICIONAR COLUNAS PREMIUM FALTANTES
-- =====================================================
DO $$ 
BEGIN
`)
      
      if (missingCols.includes('is_premium')) {
        fixes.push(`
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Coluna is_premium adicionada';
  END IF;
`)
      }
      
      if (missingCols.includes('is_featured')) {
        fixes.push(`
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Coluna is_featured adicionada';
  END IF;
`)
      }
      
      if (missingCols.includes('premium_expires_at')) {
        fixes.push(`
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'premium_expires_at'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Coluna premium_expires_at adicionada';
  END IF;
`)
      }
      
      fixes.push(`END $$;`)
      
    } else if (testError) {
      console.log('⚠️  Erro ao verificar estrutura:', testError.message)
    } else {
      console.log('✅ Estrutura da tabela está correta')
    }

    // 3. Verificar anúncios premium expirados que ainda estão ativos
    console.log('\n3️⃣ Verificando anúncios premium expirados...')
    const { data: expiredAds, error: expiredError } = await supabase
      .from('classified_ads')
      .select('id, title, user_name, is_active, is_premium, premium_expires_at')
      .eq('is_premium', true)
      .eq('is_active', true)
      .not('premium_expires_at', 'is', null)

    if (expiredError) {
      console.log('⚠️  Erro ao verificar anúncios expirados:', expiredError.message)
    } else if (expiredAds && expiredAds.length > 0) {
      const now = new Date()
      const actuallyExpired = expiredAds.filter(ad => {
        if (!ad.premium_expires_at) return false
        return new Date(ad.premium_expires_at) < now
      })

      if (actuallyExpired.length > 0) {
        console.log(`⚠️  Encontrados ${actuallyExpired.length} anúncio(s) expirado(s) ainda ativos!`)
        issues.push(`${actuallyExpired.length} anúncios expirados ainda estão ativos`)
        
        console.log('\n   Anúncios que precisam ser desativados:')
        actuallyExpired.forEach(ad => {
          const expiresAt = new Date(ad.premium_expires_at)
          const hoursExpired = Math.round((now - expiresAt) / (1000 * 60 * 60))
          console.log(`   - ${ad.title} (ID: ${ad.id}) - Expirado há ${hoursExpired} horas`)
        })

        // Executar função para desativar
        console.log('\n   Executando função de desativação...')
        const { data: deactivatedCount, error: deactivateError } = await supabase
          .rpc('deactivate_expired_premium_classifieds')

        if (deactivateError) {
          console.log(`   ❌ Erro ao desativar: ${deactivateError.message}`)
        } else {
          console.log(`   ✅ ${deactivatedCount || 0} anúncio(s) desativado(s)`)
        }
      } else {
        console.log('✅ Nenhum anúncio expirado encontrado')
      }
    } else {
      console.log('✅ Nenhum anúncio premium ativo encontrado')
    }

    // 4. Tentar verificar cron jobs (pode não funcionar se não tiver acesso)
    console.log('\n4️⃣ Verificando cron jobs...')
    console.log('   ℹ️  Para verificar cron jobs, execute este SQL no Supabase Dashboard:')
    console.log('   SELECT * FROM cron.job WHERE jobname = \'deactivate-expired-premium-classifieds\';\n')

    // 5. Gerar SQL de correção se necessário
    if (issues.length > 0 || fixes.length > 0) {
      console.log('\n📝 Gerando SQL de correção...\n')
      
      let sqlFix = `-- =====================================================
-- CORREÇÕES PARA SISTEMA DE EXPIRAÇÃO PREMIUM
-- =====================================================
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

`
      
      fixes.forEach(fix => {
        sqlFix += fix + '\n\n'
      })

      // Adicionar configuração do cron se não existir
      sqlFix += `-- =====================================================
-- CONFIGURAR PG_CRON PARA EXECUTAR A CADA HORA
-- =====================================================
-- NOTA: Isso requer extensão pg_cron habilitada no Supabase
-- Se pg_cron não estiver disponível, use Vercel Cron Jobs

DO $$
BEGIN
  -- Remover job existente se houver
  PERFORM cron.unschedule('deactivate-expired-premium-classifieds');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Job não existe, tudo bem
END $$;

-- Tentar criar o job
DO $$
BEGIN
  BEGIN
    PERFORM cron.schedule(
      'deactivate-expired-premium-classifieds',
      '0 * * * *', -- A cada hora no minuto 0
      'SELECT deactivate_expired_premium_classifieds();'
    );
    RAISE NOTICE '✅ Job pg_cron criado com sucesso!';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '⚠️  pg_cron não está disponível ou job já existe.';
      RAISE NOTICE '   Código do erro: %', SQLERRM;
      RAISE NOTICE '   Use uma alternativa externa (Vercel Cron, etc.)';
  END;
END $$;

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se a função existe
SELECT 
  'Função de desativação:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'deactivate_expired_premium_classifieds'
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status;

-- Verificar cron job
SELECT 
  'Cron job:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM cron.job 
      WHERE jobname = 'deactivate-expired-premium-classifieds'
    ) THEN '✅ Configurado'
    ELSE '⚠️  Não configurado (pg_cron pode não estar disponível)'
  END as status;

-- Contar anúncios premium expirados ainda ativos
SELECT 
  'Anúncios premium expirados ainda ativos:' as info,
  COUNT(*) as total
FROM classified_ads
WHERE is_premium = true
  AND is_active = true
  AND premium_expires_at IS NOT NULL
  AND premium_expires_at < NOW();
`

      // Salvar SQL em arquivo
      const fs = require('fs')
      const path = require('path')
      const sqlPath = path.join(__dirname, 'fix-premium-expiration-system.sql')
      fs.writeFileSync(sqlPath, sqlFix, 'utf8')
      
      console.log(`✅ SQL de correção salvo em: ${sqlPath}\n`)
      console.log('📋 Resumo dos problemas encontrados:')
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`)
      })
    } else {
      console.log('\n✅ Tudo está funcionando corretamente!')
      console.log('\n💡 Para garantir que o cron está funcionando, verifique no Supabase Dashboard:')
      console.log('   - Extensões habilitadas (pg_cron)')
      console.log('   - Cron jobs ativos')
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

// Executar
if (require.main === module) {
  verifyAndFixPremiumCron()
    .then(() => {
      console.log('\n✅ Verificação concluída!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error)
      process.exit(1)
    })
}

module.exports = { verifyAndFixPremiumCron }

