"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  QrCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface Package {
  id: string;
  name: string;
  points: number;
  price: string;
  priceValue: number;
  bonus: number;
}

interface ExistingPurchase {
  id: string;
  status: string;
  payment_id?: string;
  payment_url?: string;
  payment_data?: any;
  points_received: number;
  amount_brl: number;
  customer_data?: any;
  created_at: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: Package | null;
  existingPurchase?: ExistingPurchase | null; // Compra existente para visualizar QR Code
}

export function CheckoutModal({
  isOpen,
  onClose,
  packageData,
  existingPurchase,
}: CheckoutModalProps) {
  const { user, profile } = useAuthContext();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"form" | "qrcode" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  // Dados do pagamento
  const [paymentData, setPaymentData] = useState<{
    qrCode?: string;
    qrCodeImage?: string;
    paymentId?: string;
    paymentUrl?: string;
    expiresAt?: string;
    purchaseId?: string;
  } | null>(null);

  // Preencher dados do usuário se estiver logado
  React.useEffect(() => {
    if (user && profile && isOpen && step === "form") {
      setFormData((prev) => ({
        ...prev,
        name: profile.full_name || prev.name,
        email: user.email || prev.email,
        phone: profile.phone || prev.phone,
        cpf: profile.cpf_cnpj || prev.cpf,
        address: {
          ...prev.address,
          street: profile.address || prev.address.street,
          number: profile.address_number || prev.address.number,
          neighborhood: profile.neighborhood || prev.address.neighborhood,
          city: profile.location_city || prev.address.city,
          state: profile.location_state || prev.address.state,
          zipCode: profile.zip_code || prev.address.zipCode,
        },
      }));
    }
  }, [user, profile, isOpen, step]);

  // Resetar modal quando fechar
  React.useEffect(() => {
    if (!isOpen) {
      setStep("form");
      setError(null);
      setPaymentData(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Carregar dados da compra existente quando o modal abrir
  React.useEffect(() => {
    if (isOpen && existingPurchase) {
      console.log(
        "📦 Carregando dados da compra existente:",
        existingPurchase.id,
      );
      console.log("📦 Status da compra:", existingPurchase.status);
      console.log("📦 Payment data:", existingPurchase.payment_data);

      // Se a compra já foi aprovada, mostrar tela de sucesso
      if (existingPurchase.status === "approved") {
        console.log("✅ Compra aprovada, mostrando tela de sucesso");
        setStep("success");
      } else if (
        existingPurchase.payment_id ||
        existingPurchase.payment_url ||
        existingPurchase.payment_data
      ) {
        // Se tem QR Code, mostrar tela do QR Code
        console.log("📱 Compra tem QR Code, mostrando tela do QR Code");
        setStep("qrcode");

        // Extrair dados do QR Code do payment_data
        // payment_data pode estar em diferentes formatos:
        // 1. { data: { brCode, brCodeBase64, ... } }
        // 2. { brCode, brCodeBase64, ... }
        // 3. Diretamente no payment_url

        let qrCode = null;
        let qrCodeImage = null;
        let expiresAt = null;

        if (existingPurchase.payment_data) {
          const paymentData = existingPurchase.payment_data;

          // Tentar extrair do formato { data: { ... } }
          if (paymentData.data) {
            qrCode = paymentData.data.brCode;
            qrCodeImage = paymentData.data.brCodeBase64;
            expiresAt = paymentData.data.expiresAt;
          }
          // Tentar extrair diretamente
          else if (paymentData.brCode) {
            qrCode = paymentData.brCode;
            qrCodeImage = paymentData.brCodeBase64;
            expiresAt = paymentData.expiresAt;
          }
        }

        // Se não encontrou no payment_data, tentar payment_url
        if (!qrCode && existingPurchase.payment_url) {
          // Se payment_url é uma imagem base64
          if (existingPurchase.payment_url.startsWith("data:image")) {
            qrCodeImage = existingPurchase.payment_url;
            // Tentar extrair código PIX do payment_data se existir
            if (existingPurchase.payment_data?.data?.brCode) {
              qrCode = existingPurchase.payment_data.data.brCode;
            } else if (existingPurchase.payment_data?.brCode) {
              qrCode = existingPurchase.payment_data.brCode;
            }
          } else {
            // Se payment_url é o código PIX
            qrCode = existingPurchase.payment_url;
          }
        }

        console.log("📱 QR Code extraído:", {
          qrCode: qrCode ? `${qrCode.substring(0, 50)}...` : "não encontrado",
          qrCodeImage: qrCodeImage ? "encontrado" : "não encontrado",
          expiresAt,
          paymentId: existingPurchase.payment_id,
        });

        setPaymentData({
          qrCode: qrCode || existingPurchase.payment_url || "",
          qrCodeImage: qrCodeImage,
          paymentId: existingPurchase.payment_id,
          paymentUrl: existingPurchase.payment_url || qrCode || "",
          expiresAt: expiresAt,
          purchaseId: existingPurchase.id,
        });
      } else {
        // Se não tem QR Code ainda, mostrar formulário
        console.log("📝 Compra sem QR Code, mostrando formulário");
        setStep("form");
      }
    } else if (isOpen && !existingPurchase && packageData) {
      // Se não tem compra existente mas tem packageData, começar do formulário
      console.log("🆕 Nova compra, mostrando formulário");
      setStep("form");
    }
  }, [isOpen, existingPurchase, packageData]);

  // Verificação automática do pagamento enquanto estiver no step 'qrcode'
  React.useEffect(() => {
    // Só verificar se estiver no step 'qrcode' e tiver dados do pagamento
    if (
      step !== "qrcode" ||
      !paymentData?.paymentId ||
      !paymentData?.purchaseId ||
      !isOpen
    ) {
      return;
    }

    // Intervalo de verificação: a cada 5 segundos
    const checkInterval = setInterval(async () => {
      try {
        console.log(
          `🔄 Verificando status do pagamento ${paymentData.paymentId}...`,
        );

        const response = await fetch(
          `/api/payment/abacatepay/check?id=${paymentData.paymentId}&purchase_id=${paymentData.purchaseId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (response.ok) {
          console.log(
            `📊 Status do pagamento: ${data.status} (paymentStatus: ${data.paymentStatus})`,
          );

          // Se pagamento aprovado, ir automaticamente para o modal de sucesso
          if (
            data.status === "approved" ||
            data.paymentStatus === "PAID" ||
            data.paymentStatus === "paid"
          ) {
            console.log(
              "✅ Pagamento aprovado! Parando verificação e mostrando tela de sucesso.",
            );
            clearInterval(checkInterval);
            setStep("success");
            toast.success(
              "Pagamento confirmado! Seus pontos foram creditados.",
            );

            // Invalidar e refetch cache para atualizar a lista de compras
            if (user?.id) {
              // Aguardar um pouco para garantir que a atualização no banco foi concluída
              setTimeout(async () => {
                queryClient.invalidateQueries({
                  queryKey: ["points-purchases", user.id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["user-points-balance", user.id],
                });
                await queryClient.refetchQueries(
                  {
                    queryKey: ["points-purchases", user.id],
                    type: "active",
                  },
                  { cancelRefetch: false },
                );
              }, 500);
            }
          } else if (
            data.status === "cancelled" ||
            data.paymentStatus === "EXPIRED" ||
            data.paymentStatus === "CANCELLED" ||
            data.paymentStatus === "expired"
          ) {
            // Se expirado ou cancelado, parar verificação
            console.log("❌ Pagamento expirado ou cancelado.");
            clearInterval(checkInterval);
            toast.error(
              "Pagamento expirado ou cancelado. Gere um novo QR Code.",
            );
            setStep("form");
            setPaymentData(null);
          } else {
            // Se ainda estiver pendente, continuar verificando
            console.log(
              `⏳ Pagamento ainda pendente (status: ${data.status}), continuando verificação...`,
            );
          }
        } else {
          console.error("❌ Erro na resposta da verificação:", data);
        }
      } catch (err) {
        // Em caso de erro, apenas logar (não mostrar toast para não poluir a tela)
        console.error("❌ Erro na verificação automática do pagamento:", err);
      }
    }, 5000); // Verificar a cada 5 segundos

    // Limpar intervalo quando o componente desmontar ou mudar de step
    return () => {
      clearInterval(checkInterval);
    };
  }, [step, paymentData, isOpen, user?.id, queryClient]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    return value;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Email válido é obrigatório");
      return false;
    }
    if (
      !formData.phone.trim() ||
      formData.phone.replace(/\D/g, "").length < 10
    ) {
      setError("Telefone válido é obrigatório");
      return false;
    }
    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, "").length !== 11) {
      setError("CPF válido é obrigatório");
      return false;
    }
    if (!formData.address.street.trim()) {
      setError("Rua é obrigatória");
      return false;
    }
    if (!formData.address.number.trim()) {
      setError("Número é obrigatório");
      return false;
    }
    if (!formData.address.neighborhood.trim()) {
      setError("Bairro é obrigatório");
      return false;
    }
    if (!formData.address.city.trim()) {
      setError("Cidade é obrigatória");
      return false;
    }
    if (!formData.address.state.trim() || formData.address.state.length !== 2) {
      setError("Estado (UF) é obrigatório");
      return false;
    }
    if (
      !formData.address.zipCode.trim() ||
      formData.address.zipCode.replace(/\D/g, "").length !== 8
    ) {
      setError("CEP válido é obrigatório");
      return false;
    }
    return true;
  };

  const handleGenerateQRCode = async () => {
    if (!packageData) {
      setError("Pacote não selecionado");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/abacatepay/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          package_id: packageData.id,
          amount: packageData.priceValue,
          points: packageData.points,
          bonus: packageData.bonus,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone.replace(/\D/g, ""),
            cpf: formData.cpf.replace(/\D/g, ""),
            address: {
              street: formData.address.street,
              number: formData.address.number,
              complement: formData.address.complement,
              neighborhood: formData.address.neighborhood,
              city: formData.address.city,
              state: formData.address.state.toUpperCase(),
              zipCode: formData.address.zipCode.replace(/\D/g, ""),
            },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar QR Code");
      }

      setPaymentData({
        qrCode: data.qrCode,
        qrCodeImage: data.qrCodeImage,
        paymentId: data.paymentId,
        paymentUrl: data.paymentUrl,
        expiresAt: data.expiresAt,
        purchaseId: data.purchaseId, // Salvar o ID da compra para verificação
      });

      setStep("qrcode");
      toast.success("QR Code gerado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao gerar QR Code:", err);
      setError(err.message || "Erro ao gerar QR Code");
      toast.error("Erro ao gerar QR Code", {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyQRCode = () => {
    if (paymentData?.qrCode) {
      navigator.clipboard.writeText(paymentData.qrCode);
      toast.success("QR Code copiado para a área de transferência!");
    }
  };

  const copyPaymentUrl = () => {
    if (paymentData?.paymentUrl) {
      navigator.clipboard.writeText(paymentData.paymentUrl);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.paymentId || !paymentData?.purchaseId) {
      toast.error("Dados do pagamento não encontrados");
      return;
    }

    setIsCheckingPayment(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/payment/abacatepay/check?id=${paymentData.paymentId}&purchase_id=${paymentData.purchaseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao verificar pagamento");
      }

      // Se pagamento aprovado, mostrar modal de sucesso e creditar pontos
      if (data.status === "approved" || data.paymentStatus === "PAID") {
        setStep("success");
        toast.success("Pagamento confirmado! Seus pontos foram creditados.");

        // Invalidar e refetch cache para atualizar a lista de compras
        if (user?.id) {
          // Aguardar um pouco para garantir que a atualização no banco foi concluída
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Invalidar cache
          queryClient.invalidateQueries({
            queryKey: ["points-purchases", user.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["user-points-balance", user.id],
          });

          // Forçar refetch imediato
          await queryClient.refetchQueries(
            {
              queryKey: ["points-purchases", user.id],
              type: "active",
            },
            { cancelRefetch: false },
          );
        }
      } else if (
        data.status === "pending" ||
        data.paymentStatus === "PENDING"
      ) {
        toast.info(
          "Pagamento ainda pendente. Aguarde alguns instantes e tente novamente.",
        );

        // Mesmo assim, atualizar o cache para refletir qualquer mudança de status
        if (user?.id) {
          queryClient.invalidateQueries({
            queryKey: ["points-purchases", user.id],
          });
          await queryClient.refetchQueries(
            {
              queryKey: ["points-purchases", user.id],
              type: "active",
            },
            { cancelRefetch: false },
          );
        }
      } else if (
        data.status === "cancelled" ||
        data.paymentStatus === "EXPIRED" ||
        data.paymentStatus === "CANCELLED"
      ) {
        toast.error("Pagamento expirado ou cancelado. Gere um novo QR Code.");
        setStep("form");
        setPaymentData(null);
      } else {
        toast.info(`Status do pagamento: ${data.paymentStatus || data.status}`);
      }
    } catch (err: any) {
      console.error("Erro ao verificar pagamento:", err);
      setError(err.message || "Erro ao verificar pagamento");
      toast.error("Erro ao verificar pagamento", {
        description: err.message,
      });
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Se não tem packageData nem existingPurchase, não mostrar modal
  if (!packageData && !existingPurchase) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Só permitir fechar manualmente se não estiver no step de sucesso
        // ou se o usuário clicar explicitamente no botão de fechar
        if (!open && step === "success") {
          // Não fechar automaticamente no step de sucesso
          return;
        }
        onClose();
      }}
    >
      <DialogContent
        className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // Prevenir fechamento ao clicar fora quando estiver no step de sucesso
          if (step === "success") {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevenir fechamento com ESC quando estiver no step de sucesso
          if (step === "success") {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {existingPurchase
              ? existingPurchase.status === "approved"
                ? "Compra Aprovada"
                : "QR Code de Pagamento"
              : `Finalizar Compra - ${packageData?.name || ""}`}
          </DialogTitle>
          <DialogDescription>
            {existingPurchase
              ? existingPurchase.status === "approved"
                ? "Seus ConfiPoints foram creditados com sucesso"
                : "Escaneie o QR Code ou copie o código PIX para pagar"
              : "Complete seus dados para gerar o QR Code de pagamento"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "form" && (
          <div className="space-y-6">
            {/* Resumo da Compra */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Resumo da Compra
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">
                    Pacote:
                  </span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {packageData.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">
                    Pontos:
                  </span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {packageData.points.toLocaleString("pt-BR")} ConfiPoints
                  </span>
                </div>
                {packageData.bonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">
                      Bônus:
                    </span>
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      +{packageData.bonus.toLocaleString("pt-BR")} pontos
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                  <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {packageData.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Dados Pessoais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", formatPhone(e.target.value))
                    }
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) =>
                      handleInputChange("cpf", formatCPF(e.target.value))
                    }
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Endereço
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) =>
                      handleInputChange("address.street", e.target.value)
                    }
                    placeholder="Nome da rua"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={formData.address.number}
                    onChange={(e) =>
                      handleInputChange("address.number", e.target.value)
                    }
                    placeholder="123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address.complement}
                    onChange={(e) =>
                      handleInputChange("address.complement", e.target.value)
                    }
                    placeholder="Apto, Bloco, etc"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) =>
                      handleInputChange("address.neighborhood", e.target.value)
                    }
                    placeholder="Nome do bairro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) =>
                      handleInputChange("address.city", e.target.value)
                    }
                    placeholder="Nome da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF) *</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) =>
                      handleInputChange(
                        "address.state",
                        e.target.value.toUpperCase(),
                      )
                    }
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      handleInputChange(
                        "address.zipCode",
                        formatCEP(e.target.value),
                      )
                    }
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleGenerateQRCode}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Gerar QR Code PIX
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {step === "qrcode" && paymentData && (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Escaneie o QR Code com o app do seu banco ou copie o código PIX
                para pagar. O pagamento expira em{" "}
                {paymentData.expiresAt
                  ? new Date(paymentData.expiresAt).toLocaleString("pt-BR")
                  : "alguns minutos"}
                .
                <br />
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 block">
                  🔄 Verificando pagamento automaticamente...
                </span>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center space-y-4">
              {paymentData.qrCodeImage && (
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <img
                    src={paymentData.qrCodeImage}
                    alt="QR Code PIX"
                    className="w-64 h-64"
                    onError={(e) => {
                      // Se a imagem falhar, tentar gerar QR Code do código PIX
                      console.warn("Erro ao carregar imagem do QR Code");
                    }}
                  />
                </div>
              )}

              {paymentData.qrCode && (
                <div className="w-full space-y-2">
                  <Label>Código PIX (Copiar e Colar)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={paymentData.qrCode}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button variant="outline" size="icon" onClick={copyQRCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {paymentData.paymentUrl && (
                <div className="w-full space-y-2">
                  <Label>Link de Pagamento</Label>
                  <div className="flex gap-2">
                    <Input
                      value={paymentData.paymentUrl}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyPaymentUrl}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        window.open(paymentData.paymentUrl, "_blank")
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 w-full">
                <Button
                  onClick={checkPaymentStatus}
                  disabled={isCheckingPayment}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isCheckingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando pagamento...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verificar Pagamento
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("form")}
                    className="flex-1"
                    disabled={isCheckingPayment}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isCheckingPayment}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "success" && (packageData || existingPurchase) && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Pagamento Confirmado! 🎉
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Seus ConfiPoints foram creditados com sucesso.
              </p>
            </div>

            {/* Resumo da Compra */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-4">
                Resumo da Compra
              </h4>
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    Pacote:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {packageData.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    Valor Pago:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {packageData.price}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    Pontos Base:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {packageData.points.toLocaleString("pt-BR")} ConfiPoints
                  </span>
                </div>
                {packageData.bonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 dark:text-green-300">
                      Bônus:
                    </span>
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      +{packageData.bonus.toLocaleString("pt-BR")} pontos
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-green-200 dark:border-green-800 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total Creditado:
                  </span>
                  <span className="text-xl font-bold text-green-900 dark:text-green-100">
                    {(packageData.points + packageData.bonus).toLocaleString(
                      "pt-BR",
                    )}{" "}
                    ConfiPoints
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  onClose();
                  window.location.href = "/confipoints/compras";
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Ver Minhas Compras
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  window.location.href = "/confipoints/dashboard";
                }}
                variant="outline"
                className="flex-1"
              >
                Ver Meus Pontos
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:hidden"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
