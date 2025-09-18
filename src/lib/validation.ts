import { z } from 'zod'

// ===================================
// SCHEMAS DE VALIDAÇÃO UNIVERSAL
// ===================================

// Schema base para dados pessoais
export const PersonalDataSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z
    .string()
    .email('Email deve ter um formato válido')
    .toLowerCase(),
  
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (99) 99999-9999')
    .optional()
    .or(z.literal('')),
  
  cpf_cnpj: z
    .string()
    .regex(/^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/, 'CPF/CNPJ deve ter formato válido')
    .optional()
    .or(z.literal('')),
  
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 16 && age <= 120
    }, 'Idade deve estar entre 16 e 120 anos')
    .optional()
    .or(z.literal('')),
})

// Schema para localização
export const LocationSchema = z.object({
  location_state: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres')
    .toUpperCase(),
  
  location_city: z
    .string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  
  neighborhood: z
    .string()
    .max(100, 'Bairro deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  address: z
    .string()
    .max(200, 'Endereço deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal(''))
})

// Schema para dados profissionais
export const ProfessionalDataSchema = z.object({
  bio: z
    .string()
    .max(500, 'Bio deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  professional_services: z
    .array(z.string())
    .max(10, 'Máximo de 10 serviços')
    .optional()
    .default([]),
  
  professional_experience_years: z
    .number()
    .int('Anos de experiência deve ser um número inteiro')
    .min(0, 'Anos de experiência não pode ser negativo')
    .max(50, 'Anos de experiência deve ser no máximo 50')
    .optional()
    .default(0),
  
  professional_certifications: z
    .array(z.string())
    .max(20, 'Máximo de 20 certificações')
    .optional()
    .default([]),
  
  whatsapp: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'WhatsApp deve estar no formato (99) 99999-9999')
    .optional()
    .or(z.literal(''))
})

// Schema completo do perfil
export const ProfileSchema = PersonalDataSchema
  .merge(LocationSchema)
  .merge(ProfessionalDataSchema)
  .extend({
    user_type: z.enum(['client', 'professional']).refine(
      (value) => ['client', 'professional'].includes(value),
      { message: 'Tipo de usuário deve ser "client" ou "professional"' }
    ),
    
    is_available: z.boolean().optional().default(true),
    
    avatar_url: z
      .string()
      .url('URL do avatar deve ser válida')
      .optional()
      .or(z.literal(''))
      .or(z.null())
  })

// Schema para autenticação
export const LoginSchema = z.object({
  email: z
    .string()
    .email('Email deve ter um formato válido')
    .toLowerCase(),
  
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export const SignUpSchema = LoginSchema.extend({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  user_type: z.enum(['client', 'professional']),
  
  confirmPassword: z
    .string()
    .min(6, 'Confirmação de senha deve ter pelo menos 6 caracteres')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
})

// Schema para alteração de senha
export const ChangePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual é obrigatória'),
  
  newPassword: z
    .string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  confirmNewPassword: z
    .string()
    .min(6, 'Confirmação da nova senha é obrigatória')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Nova senha e confirmação não coincidem',
  path: ['confirmNewPassword']
})

// Schema para mensagens
export const MessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(1000, 'Mensagem deve ter no máximo 1000 caracteres')
    .trim(),
  
  conversation_id: z
    .string()
    .uuid('ID da conversa deve ser válido')
})

// Schema para anúncios classificados
export const ClassifiedAdSchema = z.object({
  title: z
    .string()
    .min(10, 'Título deve ter pelo menos 10 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  
  description: z
    .string()
    .min(20, 'Descrição deve ter pelo menos 20 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  
  category: z
    .string()
    .min(1, 'Categoria é obrigatória'),
  
  location_state: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres')
    .toUpperCase(),
  
  location_city: z
    .string()
    .min(2, 'Cidade é obrigatória'),
  
  price_range: z
    .string()
    .optional()
    .or(z.literal(''))
})

// Schema para avaliações
export const ReviewSchema = z.object({
  rating: z
    .number()
    .int('Avaliação deve ser um número inteiro')
    .min(1, 'Avaliação deve ser pelo menos 1 estrela')
    .max(5, 'Avaliação deve ser no máximo 5 estrelas'),
  
  comment: z
    .string()
    .min(10, 'Comentário deve ter pelo menos 10 caracteres')
    .max(500, 'Comentário deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  pros: z
    .array(z.string().max(100))
    .max(5, 'Máximo de 5 pontos positivos')
    .optional()
    .default([]),
  
  cons: z
    .array(z.string().max(100))
    .max(5, 'Máximo de 5 pontos negativos')
    .optional()
    .default([])
})

// ===================================
// TIPOS TYPESCRIPT DERIVADOS
// ===================================

export type PersonalData = z.infer<typeof PersonalDataSchema>
export type Location = z.infer<typeof LocationSchema>
export type ProfessionalData = z.infer<typeof ProfessionalDataSchema>
export type ProfileData = z.infer<typeof ProfileSchema>
export type LoginData = z.infer<typeof LoginSchema>
export type SignUpData = z.infer<typeof SignUpSchema>
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>
export type MessageData = z.infer<typeof MessageSchema>
export type ClassifiedAdData = z.infer<typeof ClassifiedAdSchema>
export type ReviewData = z.infer<typeof ReviewSchema>

// ===================================
// HOOKS DE VALIDAÇÃO
// ===================================

export function useValidation<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown): { data: T | null; errors: string[]; isValid: boolean } => {
      const result = schema.safeParse(data)
      
      if (result.success) {
        return {
          data: result.data,
          errors: [],
          isValid: true
        }
      }
      
      return {
        data: null,
        errors: result.error.issues.map(error => error.message),
        isValid: false
      }
    },
    
    validateField: (field: string, value: unknown): { error: string | null; isValid: boolean } => {
      try {
        // Para validar um campo específico, criamos um schema parcial
        const shape = (schema as any).shape
        if (shape && shape[field]) {
          const fieldSchema = shape[field]
          const result = fieldSchema.safeParse(value)
          
          if (result.success) {
            return { error: null, isValid: true }
          }
          
          return {
            error: result.error.issues[0]?.message || 'Erro de validação',
            isValid: false
          }
        }
        
        return { error: null, isValid: true }
      } catch {
        return { error: 'Erro de validação', isValid: false }
      }
    }
  }
}

// ===================================
// UTILITÁRIOS DE VALIDAÇÃO
// ===================================

export const ValidationUtils = {
  // Validar CPF
  isValidCPF: (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/[^\d]/g, '')
    
    if (cleanCPF.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    
    return remainder === parseInt(cleanCPF.charAt(10))
  },
  
  // Validar CNPJ
  isValidCNPJ: (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '')
    
    if (cleanCNPJ.length !== 14) return false
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false
    
    let length = cleanCNPJ.length - 2
    let numbers = cleanCNPJ.substring(0, length)
    const digits = cleanCNPJ.substring(length)
    let sum = 0
    let pos = length - 7
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--
      if (pos < 2) pos = 9
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (result !== parseInt(digits.charAt(0))) return false
    
    length = length + 1
    numbers = cleanCNPJ.substring(0, length)
    sum = 0
    pos = length - 7
    
    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--
      if (pos < 2) pos = 9
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    return result === parseInt(digits.charAt(1))
  },
  
  // Formatar telefone
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/)
    
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    
    return phone
  },
  
  // Formatar CPF
  formatCPF: (cpf: string): string => {
    const cleaned = cpf.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/)
    
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`
    }
    
    return cpf
  },
  
  // Formatar CNPJ
  formatCNPJ: (cnpj: string): string => {
    const cleaned = cnpj.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/)
    
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`
    }
    
    return cnpj
  }
}

// Schema customizado com validação de CPF/CNPJ
export const CPFCNPJSchema = z
  .string()
  .refine((value) => {
    if (!value) return true // Opcional
    
    const cleaned = value.replace(/[^\d]/g, '')
    
    if (cleaned.length === 11) {
      return ValidationUtils.isValidCPF(value)
    }
    
    if (cleaned.length === 14) {
      return ValidationUtils.isValidCNPJ(value)
    }
    
    return false
  }, 'CPF ou CNPJ inválido')

// Aplicar validação de CPF/CNPJ ao schema do perfil
export const EnhancedProfileSchema = ProfileSchema.extend({
  cpf_cnpj: CPFCNPJSchema.optional().or(z.literal(''))
})
