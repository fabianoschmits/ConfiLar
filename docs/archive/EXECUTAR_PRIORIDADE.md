# 🎯 SCRIPTS PARA EXECUTAR NO SUPABASE - ORDEM DE PRIORIDADE

## ✅ **TODOS OS SCRIPTS EXECUTADOS COM SUCESSO!** ✅

- ✅ ~~scripts/CORRIGIR-RLS-POINT-TRANSACTIONS.sql~~ (Executado)
- ✅ ~~Tabelas e colunas necessárias já criadas~~ (Executado)
- ✅ ~~scripts/LIMPAR-RLS-POST-VIEWS.sql~~ (Executado - 3 políticas criadas)
- ✅ ~~scripts/CORRIGIR-SISTEMA-REFERRAL-PONTOS.sql~~ (Executado - 850 pts configurado)
- ✅ ~~scripts/setup-cron-delete-expired-posts.sql~~ (Executado - Cron 23:59 configurado)
- ✅ ~~scripts/setup-cron-inactive-users.sql~~ (Executado - Cron 03:00 configurado)
- ✅ ~~scripts/ADICIONAR-NOTIFICACOES-PREMIUM-POSTS.sql~~ (Executado - Notificações configuradas)
- ✅ ~~scripts/ADICIONAR-NOTIFICACAO-LEVEL-UP.sql~~ (Executado - Level up configurado)
- ✅ ~~scripts/FORCAR-ATUALIZACAO-SECURITY-ADVISOR.sql~~ (Executado - Security Advisor corrigido)

---

## 📋 **ORDEM DE EXECUÇÃO RECOMENDADA**

```
1. LIMPAR-RLS-POST-VIEWS.sql          ← AGORA (para testar like premium)
2. CORRIGIR-SISTEMA-REFERRAL-PONTOS.sql  ← DEPOIS (para referral funcionar)
3. setup-cron-delete-expired-posts.sql   ← OPACIONAL (automação)
4. setup-cron-inactive-users.sql         ← OPACIONAL (automação)
```

---

## ⚠️ **IMPORTANTE**

- Execute os scripts **um por vez** (não todos juntos)
- Verifique se cada script executou **sem erros**
- Se algum erro aparecer, me avise
- Scripts podem ser executados **mais de uma vez** (são idempotentes)

---

## 🧪 **APÓS EXECUTAR SCRIPT 1**

Teste o premium like:
1. Reinicie o servidor (`Ctrl+C` → `npm run dev`)
2. Hard refresh no navegador (`Ctrl+Shift+R`)
3. Vá para `/feed`
4. Tente dar like premium em um post
5. **Me avise se funcionou!**

---

**🎯 Foco agora: Execute o primeiro script e teste!**

