/**
 * Constantes relacionadas a administradores
 * Centralizado para facilitar manutenção e evitar duplicação
 */

// ID do administrador principal
// TODO: Considerar mover para variável de ambiente ou tabela de configuração
export const ADMIN_USER_ID = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'

// Valores permitidos para ordenação de usuários
export const ALLOWED_USER_ORDER_BY = [
  'balance_desc',
  'balance_asc',
  'earned_desc',
  'spent_desc',
  'name_asc'
] as const

export type UserOrderBy = typeof ALLOWED_USER_ORDER_BY[number]

// Validação de order_by
export function isValidOrderBy(value: string): value is UserOrderBy {
  return ALLOWED_USER_ORDER_BY.includes(value as UserOrderBy)
}

