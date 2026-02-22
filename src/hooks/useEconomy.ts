"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  PointsPackage,
  PointsPurchase,
  PointsTransfer,
  StoreItem,
  StorePurchase,
  CreatePointsPurchaseRequest,
  CreateTransferRequest,
  calculateTransfer,
} from "@/types/economy";

// ============================================
// HOOK PARA PACOTES DE PONTOS
// ============================================

export function usePointsPackages() {
  const {
    data: packages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["points-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("points_packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as PointsPackage[];
    },
    enabled: true,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });

  return {
    packages: packages || [],
    loading: isLoading,
    error,
  };
}

// ============================================
// HOOK PARA COMPRAS DE PONTOS
// ============================================

export function usePointsPurchases(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data: purchases,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["points-purchases", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("points_purchases")
        .select(
          `
          *,
          package:points_packages(*)
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 0, // Sempre considerar stale para permitir atualizações imediatas
    gcTime: 0,
    refetchOnWindowFocus: true, // Refetch quando a janela ganha foco
    refetchOnMount: true, // Refetch quando o componente monta
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (request: CreatePointsPurchaseRequest) => {
      // Usar API Route segura em vez de RPC direta (REVOKE aplicado no banco)
      const response = await fetch("/api/economy/purchase/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          package_id: request.package_id,
          payment_method: request.payment_method,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar compra");
      }
      return result.purchase_id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points-purchases", userId] });
      queryClient.invalidateQueries({
        queryKey: ["user-points-balance", userId],
      });
    },
  });

  return {
    purchases: purchases || [],
    loading: isLoading,
    error,
    createPurchase: createPurchaseMutation.mutateAsync,
    isCreating: createPurchaseMutation.isPending,
    refetch: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["points-purchases", userId],
      });
      return refetch();
    },
  };
}

// Remoção dos hooks de saque
// ============================================
// HOOK PARA TRANSFERÊNCIAS DE PONTOS
// ============================================

export function usePointsTransfers(userId?: string) {
  const queryClient = useQueryClient();
  const [transferCalc, setTransferCalc] = useState<ReturnType<
    typeof calculateTransfer
  > | null>(null);

  const {
    data: transfers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["points-transfers", userId],
    queryFn: async () => {
      if (!userId) return [];

      try {
        // Buscar transferências primeiro (sem foreign keys pois não existem)
        const { data: transfers, error: transfersError } = await supabase
          .from("points_transfers")
          .select("*")
          .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
          .order("created_at", { ascending: false })
          .limit(200);

        // Se a tabela não existir, retornar array vazio em vez de erro
        if (transfersError) {
          if (
            transfersError.code === "PGRST204" ||
            transfersError.code === "PGRST116" ||
            transfersError.code === "42P01" ||
            transfersError.message?.includes("relation") ||
            transfersError.message?.includes("does not exist")
          ) {
            console.warn(
              "⚠️ Tabela points_transfers não existe, retornando array vazio",
            );
            return [];
          }
          console.error("❌ Erro ao buscar transferências:", transfersError);
          throw transfersError;
        }

        if (!transfers || transfers.length === 0) {
          return [];
        }

        // Coletar IDs únicos de usuários
        const userIds = new Set<string>();
        transfers.forEach((transfer) => {
          if (transfer.from_user_id) userIds.add(transfer.from_user_id);
          if (transfer.to_user_id) userIds.add(transfer.to_user_id);
        });

        // Buscar perfis dos usuários
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", Array.from(userIds));

        if (profilesError) {
          console.warn(
            "⚠️ Erro ao buscar perfis para transferências:",
            profilesError,
          );
          // Continuar mesmo sem perfis
        }

        // Criar mapa de perfis
        const profilesMap = new Map<string, any>();
        profiles?.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });

        // Combinar transferências com perfis
        const transfersWithUsers = transfers.map((transfer) => ({
          ...transfer,
          from_user: profilesMap.get(transfer.from_user_id) || null,
          to_user: profilesMap.get(transfer.to_user_id) || null,
        }));

        return transfersWithUsers;
      } catch (err) {
        console.warn("⚠️ Erro ao buscar transferências:", err);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    retry: false, // Não tentar novamente se falhar
  });

  const createTransferMutation = useMutation({
    mutationFn: async (request: CreateTransferRequest) => {
      // Usar a rota de API segura em vez de RPC direta
      const response = await fetch("/api/economy/transfer/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          to_user_id: request.to_user_id,
          points_amount: request.points_amount,
          message: request.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao realizar transferência");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points-transfers", userId] });
      queryClient.invalidateQueries({
        queryKey: ["user-points-balance", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-points-history", userId],
      });
    },
  });

  const calculateTransferAmount = useCallback((pointsAmount: number) => {
    const calc = calculateTransfer(pointsAmount, 25, 0);
    setTransferCalc(calc);
    return calc;
  }, []);

  return {
    transfers: transfers || [],
    loading: isLoading,
    error,
    createTransfer: createTransferMutation.mutateAsync,
    isCreating: createTransferMutation.isPending,
    calculateTransferAmount,
    transferCalc,
  };
}

// ============================================
// HOOK PARA LOJA DE PONTOS
// ============================================

export function usePointsStore(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data: items,
    isLoading: itemsLoading,
    error: itemsError,
  } = useQuery({
    queryKey: ["store-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("points_store_items")
        .select("*")
        .eq("is_active", true)
        .order("category")
        .order("points_price");

      if (error) throw error;
      return data as StoreItem[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  const { data: myPurchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ["store-purchases", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("points_store_purchases")
        .select(
          `
          *,
          item:points_store_items(*)
        `,
        )
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const purchaseItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase
        .from("points_store_purchases")
        .insert({
          user_id: userId,
          item_id: itemId,
          points_spent: items?.find((i) => i.id === itemId)?.points_price || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-purchases", userId] });
      queryClient.invalidateQueries({
        queryKey: ["user-points-balance", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-points-history", userId],
      });
    },
  });

  return {
    items: items || [],
    myPurchases: myPurchases || [],
    loading: itemsLoading || purchasesLoading,
    error: itemsError,
    purchaseItem: purchaseItemMutation.mutateAsync,
    isPurchasing: purchaseItemMutation.isPending,
  };
}

// ============================================
// HOOK PARA CONFIGURAÇÕES DO SISTEMA
// ============================================

export function useSystemConfig() {
  const {
    data: configs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["system-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("points_system_config")
        .select("*");

      if (error) throw error;

      // Converter para objeto
      const configObj: Record<string, any> = {};
      data.forEach((config) => {
        configObj[config.key] = config.value;
      });

      return configObj;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    configs: configs || {},
    loading: isLoading,
    error,
    conversionRate: configs?.conversion_rate,
    transferFee: configs?.transfer_fee,
    transferLimits: configs?.transfer_limits,
  };
}
