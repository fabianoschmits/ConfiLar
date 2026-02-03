/**
 * Design Tokens - Sistema de Design ConfiLar
 *
 * Este arquivo contém todos os tokens de design do sistema,
 * garantindo consistência visual em todo o projeto.
 */

// ============================================
// CORES
// ============================================

export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Primary principal
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  secondary: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981", // Success principal
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // Warning principal
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444", // Error principal
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  premium: {
    from: "#fbbf24", // Amarelo
    to: "#f59e0b", // Dourado
  },
  brand: {
    DEFAULT: "#00b0b0",
  },
} as const;

// ============================================
// ESPAÇAMENTO (Base: 4px)
// ============================================

export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
  "4xl": "6rem", // 96px
} as const;

// ============================================
// TIPOGRAFIA
// ============================================

export const typography = {
  fontFamily: {
    sans: ["Gilroy", "system-ui", "sans-serif"],
    display: ["Gilroy", "system-ui", "sans-serif"],
    mono: ["Gilroy", "Consolas", "monospace"],
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
    sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
    base: ["1rem", { lineHeight: "1.5rem" }], // 16px
    lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
    xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
    "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
    "5xl": ["3rem", { lineHeight: "1" }], // 48px
    "6xl": ["3.75rem", { lineHeight: "1" }], // 60px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  heading: {
    h1: {
      fontSize: "1.875rem", // text-3xl
      lineHeight: "2.25rem",
      fontWeight: 700, // font-bold
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "1.5rem", // text-2xl
      lineHeight: "2rem",
      fontWeight: 600, // font-semibold
      letterSpacing: "-0.025em",
    },
    h3: {
      fontSize: "1.25rem", // text-xl
      lineHeight: "1.75rem",
      fontWeight: 600, // font-semibold
    },
  },
  body: {
    fontSize: "1rem", // text-base
    lineHeight: "1.5rem",
    fontWeight: 400, // font-normal
  },
  caption: {
    fontSize: "0.875rem", // text-sm
    lineHeight: "1.25rem",
    fontWeight: 400, // font-normal
  },
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  sm: "0.375rem", // 6px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  full: "9999px",
} as const;

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
} as const;

// ============================================
// Z-INDEX HIERARCHY
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
  quickActionMenu: 90,
  modalOverlay: 100,
} as const;

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ============================================
// TRANSITIONS
// ============================================

export const transitions = {
  fast: "150ms",
  base: "200ms",
  slow: "300ms",
  slower: "500ms",
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// ============================================
// EXPORT TYPES
// ============================================

export type ColorScale = keyof typeof colors.primary;
export type SpacingScale = keyof typeof spacing;
export type BorderRadiusScale = keyof typeof borderRadius;
export type ShadowScale = keyof typeof shadows;
export type ZIndexScale = keyof typeof zIndex;
