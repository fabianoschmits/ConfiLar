// ============================================
// TIPOS PARA SISTEMA DE ECONOMIA - FASE 2
// ============================================

export type PaymentMethod = "pix" | "card" | "boleto";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded";
export type TransferStatus = "completed" | "cancelled" | "reversed";
export type PixKeyType = "cpf" | "cnpj" | "email" | "phone" | "random";
export type StoreItemCategory =
  | "badge"
  | "feature"
  | "highlight"
  | "verification"
  | "boost";

// ============================================
// PACOTES DE PONTOS
// ============================================

export interface PointsPackage {
  id: string;
  name: string;
  description?: string;
  slug: string;
  price_brl: number;
  points: number;
  bonus_percentage: number;
  total_points: number;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePointsPurchaseRequest {
  package_id: string;
  payment_method: PaymentMethod;
}

// ============================================
// COMPRAS DE PONTOS
// ============================================

export interface PointsPurchase {
  id: string;
  user_id: string;
  package_id?: string;
  amount_brl: number;
  points_received: number;
  payment_method: PaymentMethod;
  payment_id?: string;
  payment_url?: string;
  qr_code?: string;
  qr_code_base64?: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  created_at: string;
  approved_at?: string;
  expires_at?: string;
}

export interface PointsPurchaseWithPackage extends PointsPurchase {
  package?: PointsPackage;
}

// Função removida para saques
// ============================================
// TRANSFERÊNCIAS DE PONTOS
// ============================================

export interface PointsTransfer {
  id: string;
  from_user_id: string;
  to_user_id: string;
  points_amount: number;
  fee_percentage: number;
  fee_amount: number;
  net_amount: number;
  message?: string;
  status: TransferStatus;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PointsTransferWithUsers extends PointsTransfer {
  from_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  to_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface CreateTransferRequest {
  to_user_id: string;
  points_amount: number;
  message?: string;
}

export interface TransferCalculation {
  points_amount: number;
  fee_percentage: number;
  fee_amount: number;
  net_amount: number;
}

// ============================================
// LOJA DE PONTOS
// ============================================

export interface StoreItem {
  id: string;
  name: string;
  description?: string;
  slug: string;
  category: StoreItemCategory;
  points_price: number;
  duration_days?: number;
  is_active: boolean;
  is_featured: boolean;
  stock?: number;
  max_per_user?: number;
  icon?: string;
  color?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StorePurchase {
  id: string;
  user_id: string;
  item_id: string;
  points_spent: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  used_at?: string;
}

export interface StorePurchaseWithItem extends StorePurchase {
  item?: StoreItem;
}

// ============================================
// CONFIGURAÇÕES DO SISTEMA
// ============================================

export interface SystemConfig {
  id: string;
  key: string;
  value: Record<string, any>;
  description?: string;
  updated_at: string;
}

export interface ConversionRateConfig {
  brl_to_points: number;
  points_to_brl: number;
}

export interface WithdrawalFeeConfig {
  percentage: number;
  minimum: number;
}

export interface WithdrawalLimitsConfig {
  min_points: number;
  max_points_daily: number;
  max_points_monthly: number;
}

export interface TransferFeeConfig {
  percentage: number;
  minimum: number;
}

export interface TransferLimitsConfig {
  min_points: number;
  max_points_daily: number;
}

// ============================================
// DASHBOARD E ESTATÍSTICAS
// ============================================

export interface EconomyDashboard {
  packages: PointsPackage[];
  recent_purchases: PointsPurchaseWithPackage[];
  recent_transfers: PointsTransferWithUsers[];
  store_items: StoreItem[];
  my_store_purchases: StorePurchaseWithItem[];
  statistics: {
    total_purchased: number;
    total_transferred_out: number;
    total_transferred_in: number;
    total_spent_store: number;
  };
}

export interface AdminEconomyStats {
  total_revenue: number;
  active_users: number;
  total_transactions: number;
  revenue_by_month: {
    month: string;
    revenue: number;
  }[];
  top_buyers: {
    user_id: string;
    full_name: string;
    total_spent: number;
  }[];
}

// ============================================
// CONSTANTES
// ============================================

export const MIN_TRANSFER_POINTS = 100; // Mínimo 100 pontos para transferir

// ============================================
// UTILITÁRIOS E FORMATAÇÃO
// ============================================

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function calculateTransfer(
  pointsAmount: number,
  feePercentage: number = 25,
  minimumFee: number = 0,
): TransferCalculation {
  const calculatedFee = Math.floor(pointsAmount * (feePercentage / 100));
  const feeAmount = Math.max(calculatedFee, minimumFee);
  const netAmount = pointsAmount - feeAmount;

  return {
    points_amount: pointsAmount,
    fee_percentage: feePercentage,
    fee_amount: feeAmount,
    net_amount: netAmount,
  };
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    pending: "yellow",
    processing: "blue",
    approved: "green",
    rejected: "red",
    cancelled: "gray",
    refunded: "orange",
  };
  return colors[status] || "gray";
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    pending: "Pendente",
    processing: "Processando",
    approved: "Aprovado",
    rejected: "Rejeitado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
  };
  return labels[status] || status;
}

export function getCategoryIcon(category: StoreItemCategory): string {
  const icons: Record<StoreItemCategory, string> = {
    badge: "🛡️",
    feature: "⚡",
    highlight: "⭐",
    verification: "✅",
    boost: "🚀",
  };
  return icons[category] || "💎";
}

export function getCategoryLabel(category: StoreItemCategory): string {
  const labels: Record<StoreItemCategory, string> = {
    badge: "Badge",
    feature: "Recurso",
    highlight: "Destaque",
    verification: "Verificação",
    boost: "Impulsionamento",
  };
  return labels[category] || category;
}

export function validatePixKey(key: string, type: PixKeyType): boolean {
  switch (type) {
    case "cpf":
      return /^\d{11}$/.test(key.replace(/\D/g, ""));
    case "cnpj":
      return /^\d{14}$/.test(key.replace(/\D/g, ""));
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key);
    case "phone":
      return /^\d{10,11}$/.test(key.replace(/\D/g, ""));
    case "random":
      return key.length >= 32;
    default:
      return false;
  }
}

export function formatPixKey(key: string, type: PixKeyType): string {
  switch (type) {
    case "cpf":
      const cpf = key.replace(/\D/g, "");
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    case "cnpj":
      const cnpj = key.replace(/\D/g, "");
      return cnpj.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    case "phone":
      const phone = key.replace(/\D/g, "");
      if (phone.length === 11) {
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      }
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    default:
      return key;
  }
}
