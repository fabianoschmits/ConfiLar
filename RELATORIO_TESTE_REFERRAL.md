# 📊 Relatório de Teste do Sistema de Indicação

## 🧪 Teste Realizado
**Data:** 2025-01-04  
**Código de Referral Testado:** `FABIAN4540`  
**Método:** Script de teste automatizado usando Service Role Key

## ✅ Resultados Positivos

### 1. Validação do Código de Referral
- ✅ Código `FABIAN4540` **existe e é válido**
- ✅ Referrer identificado: **Fabiano schmits** (ID: `9f161f13-0e85-4c2e-bf45-1fe0eaf0ac9a`)
- ✅ Email: `fabiano39@gmail.com`
- ✅ Sistema de validação funcionando corretamente

### 2. Criação de Usuários de Teste
- ✅ 3 usuários fake criados com sucesso
- ✅ Perfis criados corretamente
- ✅ Usuários disponíveis para teste:
  1. `teste-referral-1762137222850-1@confilar-test.com` / `Teste123!@#`
  2. `teste-referral-1762137222850-2@confilar-test.com` / `Teste123!@#`
  3. `teste-referral-1762137222850-3@confilar-test.com` / `Teste123!@#`

## ❌ Problemas Identificados

### 1. **Erro no Trigger de Referrals**
**Problema:** 
```
❌ Erro ao criar referral: record "new" has no field "first_review_made"
```

**Causa:**
- A tabela `referrals` possui a coluna `first_service_hired`
- O trigger `award_referral_points_trigger()` está tentando acessar `first_review_made`
- Incompatibilidade entre estrutura da tabela e código do trigger

**Impacto:**
- ❌ Referrals não podem ser criados (erro no INSERT)
- ❌ Sistema de pontos de indicação não funciona
- ❌ Milestones de indicação não são registrados

### 2. **Estatísticas Não Atualizadas**
- Total de indicações: 0 (deveria ser 3 após criar referrals)
- Indicações ativas: 0

## 🔧 Solução Recomendada

### Passo 1: Corrigir Estrutura da Tabela
Execute no **Supabase SQL Editor**:

```sql
-- Opção 1: Renomear coluna existente (RECOMENDADO)
ALTER TABLE public.referrals 
RENAME COLUMN first_service_hired TO first_review_made;

-- OU Opção 2: Criar nova coluna se não existir
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS first_review_made BOOLEAN DEFAULT FALSE;
```

### Passo 2: Atualizar Trigger
Execute o script completo: `scripts/fix-referral-trigger.sql`

Ou execute manualmente:

```sql
CREATE OR REPLACE FUNCTION award_referral_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Novo cadastro via referral: 200 pontos
  IF TG_OP = 'INSERT' THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      200,
      'referral_signup',
      'Nova indicação se cadastrou',
      NEW.id
    );
  END IF;
  
  -- Perfil completado: 150 pontos
  IF TG_OP = 'UPDATE' AND NEW.profile_completed = TRUE AND OLD.profile_completed = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      150,
      'referral_profile_completed',
      'Indicação completou o perfil',
      NEW.id
    );
  END IF;
  
  -- Primeiro post: 100 pontos
  IF TG_OP = 'UPDATE' AND NEW.first_post_made = TRUE AND OLD.first_post_made = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      100,
      'referral_first_post',
      'Indicação fez o primeiro post',
      NEW.id
    );
  END IF;
  
  -- Primeira avaliação: 100 pontos
  IF TG_OP = 'UPDATE' AND NEW.first_review_made = TRUE AND OLD.first_review_made = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      100,
      'referral_first_review',
      'Indicação fez primeira avaliação',
      NEW.id
    );
  END IF;
  
  -- 30 dias ativo: 300 pontos
  IF TG_OP = 'UPDATE' AND NEW.active_30_days = TRUE AND OLD.active_30_days = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      300,
      'referral_active_30_days',
      'Indicação ativa por 30 dias',
      NEW.id
    );
    
    UPDATE public.referrals
    SET 
      status = 'completed',
      completed_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Passo 3: Recriar Trigger
```sql
DROP TRIGGER IF EXISTS on_referral_milestones ON public.referrals;
CREATE TRIGGER on_referral_milestones
  AFTER INSERT OR UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION award_referral_points_trigger();
```

## 📝 Verificação do Fluxo Completo

Após aplicar as correções, o fluxo deve funcionar assim:

1. ✅ Usuário acessa link com código `FABIAN4540`
2. ✅ Código é salvo no localStorage
3. ✅ Usuário se cadastra
4. ✅ Referral é criado automaticamente
5. ✅ 200 pontos são creditados ao referrer (Fabiano)
6. ✅ Quando indicado completa perfil → +150 pontos
7. ✅ Quando indicado faz primeiro post → +100 pontos
8. ✅ Quando indicado faz primeira avaliação → +100 pontos
9. ✅ Quando indicado fica 30 dias ativo → +300 pontos

**Total máximo por indicação:** 850 pontos

## 🧹 Limpeza dos Usuários de Teste

Após concluir os testes, você pode deletar os usuários fake:

```sql
-- Deletar usuários de teste (substitua os IDs pelos IDs reais)
DELETE FROM auth.users 
WHERE email LIKE '%confilar-test.com';
```

## ✅ Checklist de Correção

- [ ] Executar SQL para renomear/criar coluna `first_review_made`
- [ ] Executar script `fix-referral-trigger.sql`
- [ ] Recriar trigger `on_referral_milestones`
- [ ] Testar criação de referral novamente
- [ ] Verificar se pontos são creditados corretamente
- [ ] Verificar se estatísticas são atualizadas

## 📌 Arquivos Criados

1. `scripts/test-referral-system.js` - Script de teste completo
2. `scripts/fix-referral-trigger.sql` - Script de correção SQL
3. `scripts/test-referral-fix.js` - Script de verificação de correções

---

**Status Atual:** ⚠️ Sistema parcialmente funcional - requer correção no trigger

**Próximo Passo:** Executar correções SQL e retestar
