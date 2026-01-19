import { z } from "zod";

/**
 * Funções de validação padronizadas para entrada de usuário
 * Previne injeção SQL, XSS e outros ataques
 */

/**
 * Valida CPF completo (formato e dígitos verificadores)
 */
export function isValidCPF(cpf: string): boolean {
  if (!cpf || typeof cpf !== "string") return false;

  // Remove formatação
  const cleanCPF = cpf.replace(/[^\d]/g, "");

  // Deve ter 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;

  // Valida primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  // Valida segundo dígito
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

/**
 * ValidationUtils - objeto com funções de validação e formatação
 */
export const ValidationUtils = {
  isValidCPF,
  formatFullName,
};

/**
 * Formata um nome completo para capitalizar cada palavra,
 * mantendo partículas brasileiras (da, de, do, das, dos) em minúsculo.
 */
export function formatFullName(name: string): string {
  if (!name) return "";

  const particles = ["da", "de", "do", "das", "dos"];
  const words = name.toLowerCase().trim().split(/\s+/);

  const formattedWords = words.map((word, index) => {
    // Se for a primeira palavra ou não estiver na lista de partículas, capitaliza
    if (index === 0 || !particles.includes(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    // Caso contrário, mantém em minúsculo (partícula)
    return word;
  });

  return formattedWords.join(" ");
}

/**
 * Valida se uma string é um UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
}

/**
 * Valida um array de UUIDs
 */
export function validateUUIDs(uuids: string[]): string[] {
  if (!Array.isArray(uuids)) return [];
  return uuids.filter((uuid) => isValidUUID(uuid));
}

/**
 * Sanitiza uma string removendo caracteres perigosos
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (!input || typeof input !== "string") return "";

  // Remover caracteres de controle e normalizar
  let sanitized = input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .trim();

  // Limitar tamanho se especificado
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Valida e sanitiza um email
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida um número inteiro positivo
 */
export function validatePositiveInteger(value: any): boolean {
  if (typeof value === "string") {
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0 && num.toString() === value.trim();
  }
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/**
 * Valida um número dentro de um range
 */
export function validateNumberRange(
  value: any,
  min: number,
  max: number,
): boolean {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Valida uma string não vazia
 */
export function validateNonEmptyString(
  value: any,
  minLength = 1,
  maxLength?: number,
): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < minLength) return false;
  if (maxLength && trimmed.length > maxLength) return false;
  return true;
}

/**
 * Valida um array não vazio
 */
export function validateNonEmptyArray<T>(value: any): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Valida formato de código de referral
 */
export function validateReferralCode(code: string): boolean {
  if (!code || typeof code !== "string") return false;
  const codeRegex = /^[A-Z0-9]{6,12}$/;
  return codeRegex.test(code.toUpperCase().trim());
}

/**
 * Valida formato de CPF (apenas formato, não dígitos verificadores)
 */
export function validateCPFFormat(cpf: string): boolean {
  if (!cpf || typeof cpf !== "string") return false;
  // Remove formatação
  const cleanCPF = cpf.replace(/[^\d]/g, "");
  // Deve ter 11 dígitos
  return /^\d{11}$/.test(cleanCPF);
}

/**
 * Valida se uma string contém apenas caracteres alfanuméricos e espaços
 */
export function validateAlphanumericWithSpaces(
  value: string,
  maxLength?: number,
): boolean {
  if (!value || typeof value !== "string") return false;
  const regex = /^[a-zA-Z0-9\s]+$/;
  const isValid = regex.test(value);
  if (!isValid) return false;
  if (maxLength && value.length > maxLength) return false;
  return true;
}

/**
 * Valida se uma URL é segura (http/https apenas)
 */
export function validateSafeURL(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Schemas Zod para validação de formulários
 */

// Schema de Login
export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// Schema de SignUp
export const SignUpSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf_cnpj: z.string().optional(),
  referral_code: z.string().optional(),
  user_type: z.enum(["client", "professional"]).optional(),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  location_state: z.string().optional(),
  location_city: z.string().optional(),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  address_number: z.string().optional(),
  zip_code: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  bio: z.string().optional(),
  services_offered: z.array(z.string()).optional(),
  experience_years: z.string().optional(),
});

// Schema de Profile
export const ProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  user_type: z.enum(["client", "professional"]).optional(),
  location_state: z.string().optional(),
  location_city: z.string().optional(),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  address_number: z.string().optional(),
  zip_code: z.string().optional(),
  avatar_url: z.string().optional(),
  services_offered: z.array(z.string()).optional(),
  experience_years: z.string().optional(),
});
