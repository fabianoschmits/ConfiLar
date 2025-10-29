# 🛡️ Sistema Anti-Fraude - Resumo Executivo

## ⚠️ **PROBLEMA**
Usuários podem criar várias contas para "farmar" pontos iniciais e sacar, tornando o sistema insustentável.

---

## ✅ **SOLUÇÃO IMPLEMENTADA**

### **REGRA DE OURO:**
```
PONTOS COMPRADOS = LIBERADOS INSTANTANEAMENTE ✅
PONTOS GANHOS = BLOQUEADOS TEMPORARIAMENTE 🔒
```

---

## 🔒 **SISTEMA DE BLOQUEIO**

### **Pontos Orgânicos (Ganhos na Plataforma):**

| Verificação | Período de Bloqueio | Limite Saque/Mês |
|-------------|---------------------|------------------|
| ❌ Nenhuma | **30 dias** | R$ 0,00 |
| 📧 Email | **30 dias** | R$ 50,00 |
| 📝 CPF | **15 dias** | R$ 200,00 |
| 📸 CPF + Selfie | **7 dias** | R$ 500,00 |
| ⭐ Premium | **0 dias** (instantâneo) | Ilimitado |

### **Pontos Comprados (Pagos com Dinheiro):**
- ✅ **LIBERADOS INSTANTANEAMENTE**
- ✅ **Podem sacar imediatamente**
- ✅ **Sem período de carência**
- ✅ **Sem limites**

---

## 📈 **DESBLOQUEIO PROGRESSIVO**

### **Exemplo: Usuário não verificado ganha 1.000 pontos**

```
Dia 0:    1.000 pontos bloqueados   🔒 (0% disponível)
Dia 7:      750 pontos bloqueados   🔒 (25% disponível = 250 pts)
Dia 15:     500 pontos bloqueados   🔒 (50% disponível = 500 pts)
Dia 22:     250 pontos bloqueados   🔒 (75% disponível = 750 pts)
Dia 30:       0 pontos bloqueados   ✅ (100% disponível = 1.000 pts)
```

### **Com CPF Verificado:**
```
Dia 0:    1.000 pontos bloqueados   🔒
Dia 3:      750 pontos bloqueados   🔒 (25%)
Dia 7:      500 pontos bloqueados   🔒 (50%)
Dia 11:     250 pontos bloqueados   🔒 (75%)
Dia 15:       0 pontos bloqueados   ✅ (100%)
```

---

## 🎯 **NÍVEIS DE VERIFICAÇÃO**

### **Nível 0: Não Verificado** ❌
```
• Bloqueio: 30 dias
• Limite diário: 1.000 pontos
• Limite saque: R$ 0,00/mês
• Indicações: Bloqueadas
```

### **Nível 1: Email Verificado** 📧
```
• Bloqueio: 30 dias
• Limite diário: 2.000 pontos
• Limite saque: R$ 50,00/mês
• Indicações: 5/mês
```

### **Nível 2: CPF Verificado** 📝
```
• Bloqueio: 15 dias
• Limite diário: 5.000 pontos
• Limite saque: R$ 200,00/mês
• Indicações: 20/mês
```

### **Nível 3: CPF + Selfie** 📸
```
• Bloqueio: 7 dias
• Limite diário: 10.000 pontos
• Limite saque: R$ 500,00/mês
• Indicações: Ilimitadas
```

### **Nível 4: Premium** ⭐
```
• Bloqueio: 0 dias (INSTANTÂNEO)
• Limite diário: Ilimitado
• Limite saque: Ilimitado
• Indicações: Ilimitadas
```

---

## 🚨 **DETECÇÃO DE FRAUDES**

### **O Sistema Detecta Automaticamente:**

1. **Múltiplas Contas**
   - Mesmo IP
   - Mesmo CPF
   - Mesmo dispositivo
   - Mesmo PIX para saque

2. **Farming de Pontos**
   - Muitas transações em pouco tempo (>100/dia)
   - Padrão robótico
   - Atividade artificial

3. **Indicações Suspeitas**
   - Muitas indicações rapidamente (>20/semana)
   - Indicados inativos
   - Indicações circulares

4. **Comportamento Suspeito**
   - Criar conta e tentar sacar imediatamente
   - Múltiplos saques para mesmo PIX
   - Padrões anormais

### **Ações Automáticas:**
- ⚠️ **Score 40-59:** Alerta (monitorar)
- 🔒 **Score 60-79:** Pontos bloqueados (investigação)
- ❌ **Score 80-100:** Conta congelada (análise manual)

---

## 💡 **INCENTIVOS PARA VERIFICAÇÃO**

### **Por que se Verificar?**

| Benefício | Sem CPF | Com CPF | Com Selfie |
|-----------|---------|---------|------------|
| **Desbloqueio** | 30 dias | 15 dias | 7 dias |
| **Saque Mensal** | R$ 0 | R$ 200 | R$ 500 |
| **Indicações** | 0 | 20/mês | Ilimitado |
| **Confiança** | Baixa | Média | Alta |

### **Como Verificar:**
1. **Email** - Automático no cadastro
2. **CPF** - Enviar documento
3. **Selfie** - Foto com documento
4. **Premium** - Comprar qualquer pacote de pontos

---

## 📊 **EXEMPLOS PRÁTICOS**

### **Cenário 1: Usuário Tentando Fraudar** 🚫
```
João cria 10 contas para ganhar pontos:
• Cada conta ganha 1.000 pontos iniciais
• Total: 10.000 pontos = R$ 100,00

PROBLEMA:
✗ Mesmo IP detectado
✗ Score de fraude = 90 (CRÍTICO)
✗ Todas as contas bloqueadas
✗ Pontos congelados
✗ Saque bloqueado
✗ R$ 0,00 recebido
```

### **Cenário 2: Usuário Legítimo Sem Verificação** ⏳
```
Maria usa a plataforma normalmente:
• Ganha 5.000 pontos em 1 mês
• Quer sacar R$ 50,00

RESULTADO:
⏳ Pontos bloqueados por 30 dias
⏳ Após 30 dias: pode sacar
⏳ Tempo de espera: necessário
✓ R$ 50,00 disponível após carência
```

### **Cenário 3: Usuário Verificado com CPF** ✅
```
Pedro verifica CPF e participa:
• Ganha 5.000 pontos em 1 mês
• Quer sacar R$ 50,00

RESULTADO:
⏳ Pontos bloqueados por 15 dias
✓ Após 15 dias: pode sacar até R$ 200/mês
✓ Tempo de espera: reduzido
✓ Mais confiança e limites
```

### **Cenário 4: Usuário que Compra Pontos** 💰
```
Carlos compra pacote de 10.000 pontos (R$ 100):
• Paga R$ 100,00
• Recebe 12.000 pontos (com bônus)

RESULTADO:
✅ Pontos LIBERADOS INSTANTANEAMENTE
✅ Pode sacar imediatamente
✅ Sem período de carência
✅ Sem limites
✅ Pode sacar R$ 114,00 (com bônus)
```

---

## 🎯 **VANTAGENS DO SISTEMA**

### **Para Usuários Legítimos:**
- ✅ Verificação simples e rápida
- ✅ Benefícios claros por se verificar
- ✅ Pontos comprados = instantâneos
- ✅ Sistema justo e transparente

### **Para a Plataforma:**
- ✅ Protegida contra fraudes
- ✅ Sistema sustentável
- ✅ Incentiva compra de pontos
- ✅ Incentiva verificação
- ✅ Menos custos com fraudes

### **Para o Negócio:**
- ✅ Receita de vendas de pontos (instantâneos)
- ✅ Margem de 5% em saques
- ✅ Usuários verificados = mais confiáveis
- ✅ Redução de fraudes = sustentabilidade

---

## 🔧 **IMPLEMENTAÇÃO**

### **SQL Criado:**
`scripts/create-antifraud-system.sql`

### **Tabelas:**
1. `user_verification` - Níveis de verificação
2. `point_locks` - Bloqueios temporários
3. `fraud_detection` - Detecção de fraudes

### **Funções:**
1. `add_points_with_lock()` - Adiciona pontos com bloqueio
2. `calculate_point_balances()` - Calcula saldos
3. `unlock_points_progressively()` - Desbloqueia gradualmente
4. `detect_fraudulent_patterns()` - Detecta fraudes (diário)

---

## ⚡ **PRÓXIMOS PASSOS**

### **1. Executar SQL** (Urgente)
```sql
-- No Supabase SQL Editor:
\i scripts/create-antifraud-system.sql
```

### **2. Atualizar Frontend** (Necessário)
- Mostrar pontos bloqueados vs disponíveis
- Tela de verificação de CPF
- Upload de selfie
- Explicar sistema de carência

### **3. Monitoramento** (Importante)
- Dashboard admin de fraudes
- Alertas automáticos
- Revisão semanal

---

## 🎉 **CONCLUSÃO**

### **Sistema Anti-Fraude:**
- ✅ Protege contra múltiplas contas
- ✅ Pontos comprados = instantâneos
- ✅ Pontos ganhos = carência progressiva
- ✅ Verificação incentivada
- ✅ Detecção automática
- ✅ Sistema sustentável

### **Regra Simples:**
```
PAGOU? LIBERADO! ✅
GANHOU? AGUARDE! ⏳
VERIFICOU? MAIS RÁPIDO! 🚀
```

**Sistema robusto, justo e sustentável!** 🛡️
