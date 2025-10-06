/**
 * 🔍 VALIDAÇÃO DE DUPLICATAS
 * 
 * Funções para verificar se email ou CPF já estão cadastrados
 * ANTES de criar novos usuários.
 * 
 * ⚠️ IMPORTANTE: Esta validação NÃO afeta registros existentes,
 * apenas impede novos cadastros duplicados.
 */

import { supabase } from '@/lib/supabase'

/**
 * Verifica se um email já está cadastrado no sistema
 * @param email - Email a ser verificado
 * @returns true se o email já existe, false caso contrário
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  if (!email) return false
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .limit(1)
    .maybeSingle() // Use maybeSingle para evitar erro se não encontrar
  
  // Se encontrou um registro, o email já existe
  return !!data && !error
}

/**
 * Verifica se um CPF/CNPJ já está cadastrado no sistema
 * @param cpf - CPF/CNPJ a ser verificado (com ou sem formatação)
 * @returns true se o CPF já existe, false caso contrário
 */
export async function checkCpfExists(cpf: string): Promise<boolean> {
  if (!cpf) return false
  
  // Remover toda formatação do CPF/CNPJ (pontos, hífens, barras)
  const cleanCpf = cpf.replace(/\D/g, '')
  
  if (cleanCpf.length < 11) return false // CPF/CNPJ inválido
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('cpf_cnpj', cleanCpf)
    .limit(1)
    .maybeSingle() // Use maybeSingle para evitar erro se não encontrar
  
  // Se encontrou um registro, o CPF já existe
  return !!data && !error
}

/**
 * Verifica email e CPF de uma vez (mais eficiente)
 * @param email - Email a ser verificado
 * @param cpf - CPF/CNPJ a ser verificado (opcional)
 * @returns Objeto com emailExists e cpfExists
 */
export async function checkDuplicates(
  email: string, 
  cpf?: string | null
): Promise<{ emailExists: boolean; cpfExists: boolean }> {
  // Executar verificações em paralelo para melhor performance
  const [emailExists, cpfExists] = await Promise.all([
    checkEmailExists(email),
    cpf ? checkCpfExists(cpf) : Promise.resolve(false)
  ])
  
  return { emailExists, cpfExists }
}

/**
 * Verifica duplicatas e retorna mensagens de erro apropriadas
 * @param email - Email a ser verificado
 * @param cpf - CPF/CNPJ a ser verificado (opcional)
 * @returns Objeto com hasError e errorMessage
 */
export async function validateNoDuplicates(
  email: string,
  cpf?: string | null
): Promise<{ hasError: boolean; errorMessage: string | null }> {
  const { emailExists, cpfExists } = await checkDuplicates(email, cpf)
  
  if (emailExists && cpfExists) {
    return {
      hasError: true,
      errorMessage: 'Este email e CPF/CNPJ já estão cadastrados na plataforma'
    }
  }
  
  if (emailExists) {
    return {
      hasError: true,
      errorMessage: 'Este email já está cadastrado na plataforma'
    }
  }
  
  if (cpfExists) {
    return {
      hasError: true,
      errorMessage: 'Este CPF/CNPJ já está cadastrado na plataforma'
    }
  }
  
  return {
    hasError: false,
    errorMessage: null
  }
}

