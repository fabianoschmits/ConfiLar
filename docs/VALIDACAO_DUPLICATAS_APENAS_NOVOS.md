# 🔒 Impedir Duplicatas APENAS em Novos Usuários

## 📋 Situação

- ✅ **Duplicatas existentes:** Continuam no banco (não serão removidas)
- ✅ **Novos cadastros:** Serão validados para evitar duplicatas
- ❌ **Constraints UNIQUE:** NÃO serão usados (pois afetariam registros antigos)

## ✅ Solução: Validação no Código

A validação será feita **antes de inserir** no banco, verificando se email/CPF já existe.

---

## 🚀 Implementação

### **Opção 1: Adicionar função de validação (Recomendado)**

Crie o arquivo `src/lib/checkDuplicates.ts`:

```typescript
import { createClient } from '@/lib/supabase/client'

export async function checkEmailExists(email: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .limit(1)
    .single()
  
  // Se encontrou um registro, o email já existe
  return !!data && !error
}

export async function checkCpfExists(cpf: string): Promise<boolean> {
  const supabase = createClient()
  
  // Remover formatação do CPF
  const cleanCpf = cpf.replace(/\D/g, '')
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('cpf_cnpj', cleanCpf)
    .limit(1)
    .single()
  
  // Se encontrou um registro, o CPF já existe
  return !!data && !error
}

export async function checkDuplicates(
  email: string, 
  cpf?: string
): Promise<{ emailExists: boolean; cpfExists: boolean }> {
  const [emailExists, cpfExists] = await Promise.all([
    checkEmailExists(email),
    cpf ? checkCpfExists(cpf) : Promise.resolve(false)
  ])
  
  return { emailExists, cpfExists }
}
```

---

### **Opção 2: Modificar o formulário de cadastro**

Atualize `src/components/forms/SimpleRegistrationForm.tsx`:

```typescript
import { checkDuplicates } from '@/lib/checkDuplicates'

const onSubmit = async (data: RegistrationFormData) => {
  setIsLoading(true)
  
  try {
    // ✅ NOVA VALIDAÇÃO: Verificar duplicatas ANTES de cadastrar
    const { emailExists, cpfExists } = await checkDuplicates(
      data.email,
      data.cpf_cnpj
    )
    
    if (emailExists) {
      toast.error('❌ Este email já está cadastrado na plataforma')
      setIsLoading(false)
      return
    }
    
    if (cpfExists) {
      toast.error('❌ Este CPF/CNPJ já está cadastrado na plataforma')
      setIsLoading(false)
      return
    }
    
    // Continuar com o cadastro normal...
    const { error } = await signUp({
      email: data.email,
      password: data.password,
      // ... resto dos campos
    })
    
    // ... resto do código
  } catch (error) {
    console.error('Erro no cadastro:', error)
    toast.error('Erro inesperado ao criar conta')
    setIsLoading(false)
  }
}
```

---

### **Opção 3: Validação em Tempo Real (UX melhor)**

Adicionar validação enquanto o usuário digita:

```typescript
const [emailError, setEmailError] = useState<string | null>(null)
const [cpfError, setCpfError] = useState<string | null>(null)

// Debounce para evitar muitas requisições
const validateEmailDebounced = useMemo(
  () =>
    debounce(async (email: string) => {
      if (!email) return
      
      const exists = await checkEmailExists(email)
      if (exists) {
        setEmailError('Email já cadastrado')
      } else {
        setEmailError(null)
      }
    }, 500),
  []
)

const validateCpfDebounced = useMemo(
  () =>
    debounce(async (cpf: string) => {
      if (!cpf) return
      
      const exists = await checkCpfExists(cpf)
      if (exists) {
        setCpfError('CPF já cadastrado')
      } else {
        setCpfError(null)
      }
    }, 500),
  []
)

// No campo de email
<input
  {...register('email')}
  onChange={(e) => {
    register('email').onChange(e)
    validateEmailDebounced(e.target.value)
  }}
/>
{emailError && <span className="text-red-500">{emailError}</span>}
```

---

## 📊 Comparação das Soluções

| Método | Vantagens | Desvantagens |
|--------|-----------|--------------|
| **Validação no código** | ✅ Mantém duplicatas antigas<br>✅ Flexível<br>✅ Mensagens customizadas | ⚠️ Requer modificar código<br>⚠️ Pode ser contornado via API direta |
| **Constraints UNIQUE** | ✅ Garantia do banco<br>✅ Impossível contornar | ❌ Bloqueia duplicatas existentes<br>❌ Precisa limpar dados primeiro |
| **Validação em tempo real** | ✅ UX melhor<br>✅ Feedback imediato | ⚠️ Mais requisições ao banco |

---

## 🔧 Implementação Passo a Passo

### **Passo 1: Criar arquivo de validação**
```bash
# Crie o arquivo
touch src/lib/checkDuplicates.ts
```

Copie o código da **Opção 1** acima.

---

### **Passo 2: Adicionar índices no banco (Performance)**

Execute no Supabase SQL Editor:

```sql
-- Criar índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower 
ON profiles(LOWER(email));

CREATE INDEX IF NOT EXISTS idx_profiles_cpf_cnpj 
ON profiles(cpf_cnpj) 
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != '';
```

Esses índices tornam a verificação de duplicatas **muito mais rápida**.

---

### **Passo 3: Atualizar formulários**

Adicione a validação em todos os lugares onde novos usuários são criados:

1. ✅ `src/components/forms/SimpleRegistrationForm.tsx`
2. ✅ `src/components/forms/BasicSignupForm.tsx`
3. ✅ `src/app/onboarding/page.tsx`
4. ✅ Qualquer outro formulário de cadastro

---

## ✅ Resultado Final

### **Antes:**
```typescript
// ❌ Cadastrava sem verificar
await supabase.from('profiles').insert({ email: 'test@test.com' })
```

### **Depois:**
```typescript
// ✅ Verifica antes de cadastrar
const exists = await checkEmailExists('test@test.com')
if (exists) {
  toast.error('Email já cadastrado')
  return
}
await supabase.from('profiles').insert({ email: 'test@test.com' })
```

---

## 📝 Observações Importantes

### ⚠️ **Duplicatas Antigas**
- Continuarão existindo no banco
- Não serão afetadas pela validação nova
- Se quiser limpar depois, pode executar os scripts de limpeza separadamente

### ✅ **Novos Cadastros**
- Serão validados antes de inserir
- Email duplicado = cadastro bloqueado
- CPF duplicado = cadastro bloqueado
- Mensagem clara para o usuário

### 🔒 **Segurança**
- A validação está no código, não no banco
- Se alguém acessar o banco direto, pode inserir duplicatas
- Para segurança total, use constraints UNIQUE + limpeza de duplicatas

---

## 🎯 Resumo

1. **Criar:** `src/lib/checkDuplicates.ts` com funções de validação
2. **Executar:** SQL para criar índices (performance)
3. **Atualizar:** Formulários de cadastro com validação
4. **Testar:** Tentar cadastrar email/CPF duplicado

**Status:** ✅ Duplicatas antigas mantidas, novos cadastros validados

