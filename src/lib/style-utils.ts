/**
 * Style Utilities - Helpers para estilos reutilizáveis
 *
 * Funções helper para facilitar o uso dos design tokens
 * e criar estilos consistentes em todo o projeto.
 */

import { cn } from "./utils";
import { spacing, borderRadius, shadows, colors } from "./design-tokens";

// ============================================
// ESPAÇAMENTO
// ============================================

/**
 * Gera classes de padding usando design tokens
 */
export function p(scale: keyof typeof spacing) {
  return `p-${scale}`;
}

export function px(scale: keyof typeof spacing) {
  return `px-${scale}`;
}

export function py(scale: keyof typeof spacing) {
  return `py-${scale}`;
}

export function pt(scale: keyof typeof spacing) {
  return `pt-${scale}`;
}

export function pb(scale: keyof typeof spacing) {
  return `pb-${scale}`;
}

export function pl(scale: keyof typeof spacing) {
  return `pl-${scale}`;
}

export function pr(scale: keyof typeof spacing) {
  return `pr-${scale}`;
}

/**
 * Gera classes de margin usando design tokens
 */
export function m(scale: keyof typeof spacing) {
  return `m-${scale}`;
}

export function mx(scale: keyof typeof spacing) {
  return `mx-${scale}`;
}

export function my(scale: keyof typeof spacing) {
  return `my-${scale}`;
}

export function mt(scale: keyof typeof spacing) {
  return `mt-${scale}`;
}

export function mb(scale: keyof typeof spacing) {
  return `mb-${scale}`;
}

export function ml(scale: keyof typeof spacing) {
  return `ml-${scale}`;
}

export function mr(scale: keyof typeof spacing) {
  return `mr-${scale}`;
}

// ============================================
// BORDER RADIUS
// ============================================

/**
 * Gera classes de border-radius usando design tokens
 */
export function rounded(scale: keyof typeof borderRadius) {
  return `rounded-${scale}`;
}

// ============================================
// SHADOWS
// ============================================

/**
 * Gera classes de shadow usando design tokens
 */
export function shadow(scale: keyof typeof shadows) {
  return `shadow-${scale}`;
}

// ============================================
// CORES
// ============================================

/**
 * Gera classes de cor primária
 */
export function colorPrimary(scale: keyof typeof colors.primary = 500) {
  return `text-primary-${scale}`;
}

export function bgPrimary(scale: keyof typeof colors.primary = 500) {
  return `bg-primary-${scale}`;
}

export function borderPrimary(scale: keyof typeof colors.primary = 500) {
  return `border-primary-${scale}`;
}

/**
 * Gera classes de cor de sucesso
 */
export function colorSuccess(scale: keyof typeof colors.success = 500) {
  return `text-success-${scale}`;
}

export function bgSuccess(scale: keyof typeof colors.success = 500) {
  return `bg-success-${scale}`;
}

/**
 * Gera classes de cor de warning
 */
export function colorWarning(scale: keyof typeof colors.warning = 500) {
  return `text-warning-${scale}`;
}

export function bgWarning(scale: keyof typeof colors.warning = 500) {
  return `bg-warning-${scale}`;
}

/**
 * Gera classes de cor de erro
 */
export function colorError(scale: keyof typeof colors.error = 500) {
  return `text-error-${scale}`;
}

export function bgError(scale: keyof typeof colors.error = 500) {
  return `bg-error-${scale}`;
}

// ============================================
// COMPONENTES REUTILIZÁVEIS
// ============================================

/**
 * Classes padrão para cards
 */
export const cardClasses = cn(
  "bg-[var(--cl-surface)]",
  "rounded-xl",
  "border border-gray-200 dark:border-gray-800",
  "shadow-sm hover:shadow-md",
  "transition-shadow duration-200",
);

/**
 * Classes padrão para botões primários
 */
export const buttonPrimaryClasses = cn(
  "bg-primary-600 hover:bg-primary-700",
  "text-white",
  "rounded-md",
  "px-4 py-2",
  "font-medium",
  "transition-colors duration-200",
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

/**
 * Classes padrão para inputs
 */
export const inputClasses = cn(
  "w-full",
  "rounded-md",
  "border border-gray-300 dark:border-gray-700",
  "bg-[var(--cl-surface)]",
  "px-3 py-2",
  "text-sm",
  "text-gray-900 dark:text-white",
  "placeholder:text-gray-400 dark:placeholder:text-gray-500",
  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
  "transition-colors duration-200",
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

/**
 * Classes padrão para badges
 */
export const badgeClasses = {
  primary: cn(
    "bg-primary-100 dark:bg-primary-900/30",
    "text-primary-800 dark:text-primary-200",
    "border border-primary-200 dark:border-primary-800",
  ),
  success: cn(
    "bg-success-100 dark:bg-success-900/30",
    "text-success-800 dark:text-success-200",
    "border border-success-200 dark:border-success-800",
  ),
  warning: cn(
    "bg-warning-100 dark:bg-warning-900/30",
    "text-warning-800 dark:text-warning-200",
    "border border-warning-200 dark:border-warning-800",
  ),
  error: cn(
    "bg-error-100 dark:bg-error-900/30",
    "text-error-800 dark:text-error-200",
    "border border-error-200 dark:border-error-800",
  ),
};

/**
 * Classes padrão para containers
 */
export const containerClasses = cn(
  "max-w-7xl",
  "mx-auto",
  "px-4 sm:px-6 lg:px-8",
);

/**
 * Classes padrão para seções
 */
export const sectionClasses = cn("py-8 md:py-12 lg:py-16");
