"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Coins,
  ArrowRight,
  AlertCircle,
  Search,
  User,
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from "lucide-react";
import { usePointsTransfers } from "@/hooks/useEconomy";
import { usePoints } from "@/hooks/usePoints";
import { useAuthContext } from "@/contexts/AuthContext";
import { MIN_TRANSFER_POINTS } from "@/types/economy";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { TransferListSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function TransferirConfiPointsPage() {
  const t = useTranslations("confipoints");
  const tCommon = useTranslations("common");
  const { user } = useAuthContext();
  const { balance } = usePoints(user?.id);
  const { transfers, loading, createTransfer, isCreating } = usePointsTransfers(
    user?.id,
  );

  const [pointsAmount, setPointsAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const pointsValue = parseInt(pointsAmount) || 0;

  const handleSearchUser = async () => {
    if (!searchEmail) {
      toast.error(t("enterEmail"));
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .eq("email", searchEmail)
        .single();

      if (error || !data) {
        toast.error(t("userNotFound"));
        setSearchedUser(null);
        return;
      }

      if (data.id === user?.id) {
        toast.error(t("cannotTransferToSelf"));
        setSearchedUser(null);
        return;
      }

      setSearchedUser(data);
      toast.success(t("userFound"));
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      toast.error(t("errorSearchingUser"));
      setSearchedUser(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pointsAmount || pointsValue < MIN_TRANSFER_POINTS) {
      toast.error(
        t("minTransferAmount", {
          amount: MIN_TRANSFER_POINTS.toLocaleString(),
        }),
      );
      return;
    }

    if (!balance || balance.balance < pointsValue) {
      toast.error(t("insufficientBalance"));
      return;
    }

    if (!searchedUser) {
      toast.error(t("selectRecipient"));
      return;
    }

    try {
      await createTransfer({
        to_user_id: searchedUser.id,
        points_amount: pointsValue,
        message: message || undefined,
      });

      toast.success(t("transferSuccess"));
      setPointsAmount("");
      setMessage("");
      setSearchEmail("");
      setSearchedUser(null);
    } catch (error: any) {
      console.error("Erro ao criar transferência:", error);
      toast.error(error.message || t("errorProcessingTransfer"));
    }
  };

  return (
    <MainLayout requireAuth={true}>
      <div className="app-screen bg-[var(--cl-paper)]">
        <div className="app-page">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <PageHeader
              title={t("transferPoints")}
              description={t("sendPointsToUsers")}
              icon={Send}
              backHref="/confipoints/dashboard"
            />

            {/* Saldo Atual */}
            {balance && (
              <Card className="mb-8 border-[var(--cl-border)] shadow-none">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--cl-mist)] rounded-lg">
                      <Coins className="w-5 h-5 text-[var(--cl-teal)]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--cl-ink-muted)] font-medium">
                        {t("availableBalance")}
                      </p>
                      <p className="text-lg font-bold text-[var(--cl-ink)]">
                        {balance.balance.toLocaleString()} {t("points")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário de Transferência */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("sendPoints")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Buscar Usuário */}
                    <div className="space-y-2">
                      <Label htmlFor="searchEmail">
                        {t("searchRecipient")}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="searchEmail"
                          type="email"
                          placeholder={t("emailPlaceholder")}
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        />
                        <Button
                          type="button"
                          onClick={handleSearchUser}
                          disabled={searching}
                          variant="outline"
                        >
                          {searching ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Usuário Encontrado */}
                    {searchedUser && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={searchedUser.avatar_url} />
                            <AvatarFallback>
                              {searchedUser.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-[var(--cl-ink)]">
                              {searchedUser.full_name}
                            </p>
                            <p className="text-sm text-[var(--cl-ink-secondary)]">
                              {searchedUser.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quantidade de Pontos */}
                    <div className="space-y-2">
                      <Label htmlFor="points">{t("pointsAmount")}</Label>
                      <Input
                        id="points"
                        type="number"
                        placeholder={t("pointsPlaceholder")}
                        value={pointsAmount}
                        onChange={(e) => setPointsAmount(e.target.value)}
                        min={MIN_TRANSFER_POINTS}
                        step={10}
                        disabled={!searchedUser}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-[var(--cl-ink-muted)]">
                        {t("minimum")}: {MIN_TRANSFER_POINTS.toLocaleString()}{" "}
                        {t("points")}
                      </p>
                    </div>

                    {/* Mensagem */}
                    <div className="space-y-2">
                      <Label htmlFor="message">{t("messageOptional")}</Label>
                      <Textarea
                        id="message"
                        placeholder={t("messagePlaceholder")}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        disabled={!searchedUser}
                        className="dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Resumo */}
                    {pointsValue > 0 && searchedUser && (
                      <div className="p-4 bg-[var(--cl-mist)] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[var(--cl-ink-secondary)]">
                            {t("youWillSend")}:
                          </span>
                          <span className="font-bold text-[var(--cl-ink)] text-base">
                            {pointsValue.toLocaleString()} {t("points")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-red-500 dark:text-red-400">
                            Taxa (25%):
                          </span>
                          <span className="font-semibold text-red-500 dark:text-red-400 text-sm">
                            - {Math.floor(pointsValue * 0.25).toLocaleString()}{" "}
                            {t("points")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--cl-border)]">
                          <span className="text-sm font-semibold text-[var(--cl-ink)]">
                            {searchedUser.full_name} vai receber:
                          </span>
                          <span className="font-bold text-[var(--cl-teal)] text-lg">
                            {(
                              pointsValue - Math.floor(pointsValue * 0.25)
                            ).toLocaleString()}{" "}
                            {t("points")}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={
                        isCreating ||
                        !searchedUser ||
                        !balance ||
                        balance.balance < pointsValue
                      }
                      className="w-full bg-[var(--cl-cta)] hover:brightness-110 text-[var(--cl-on-cta)] rounded-xl"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {tCommon("processing")}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t("sendPoints")}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Informações */}
              <div className="space-y-6">
                <Alert className="bg-[var(--cl-mist)] border-[var(--cl-border)]">
                  <Info className="h-4 w-4 text-[var(--cl-teal)]" />
                  <AlertDescription className="text-[var(--cl-ink-secondary)]">
                    <strong className="block mb-2">Como funciona:</strong>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Transferências são instantâneas</li>
                      <li>
                        {t("minimum")}: {MIN_TRANSFER_POINTS.toLocaleString()}{" "}
                        {t("points")}
                      </li>
                      <li>Imposto de 25% descontado do recebedor</li>
                      <li>Não é possível cancelar após enviar</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-[var(--cl-ink-secondary)]">
                      ✨ Você pode enviar pontos para agradecer, presentear ou
                      ajudar outros usuários!
                    </p>
                    <p className="text-[var(--cl-ink-secondary)]">
                      🔒 Transferências são registradas e não podem ser
                      revertidas. Certifique-se de que está enviando para a
                      pessoa correta!
                    </p>
                    <p className="text-[var(--cl-ink-secondary)]">
                      💬 Deixe uma mensagem para tornar o gesto mais especial!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Histórico de Transferências */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-[var(--cl-teal)]" />
                  {t("transferHistory")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TransferListSkeleton count={5} />
                ) : transfers && transfers.length > 0 ? (
                  <div className="space-y-3">
                    {transfers.map((transfer: any) => {
                      const isSent = transfer.from_user_id === user?.id;
                      const otherUser = isSent
                        ? transfer.to_user
                        : transfer.from_user;

                      return (
                        <div
                          key={transfer.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-[var(--cl-border)] hover:bg-[var(--cl-mist)]/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`p-1.5 rounded-full ${isSent ? "bg-red-50 dark:bg-red-900/10" : "bg-green-50 dark:bg-green-900/10"}`}
                            >
                              {isSent ? (
                                <ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                              ) : (
                                <ArrowDownRight className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={otherUser?.avatar_url} />
                              <AvatarFallback className="text-[10px]">
                                {otherUser?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[var(--cl-ink)] truncate">
                                {isSent ? t("sentTo") : t("receivedFrom")}{" "}
                                {otherUser?.id ? (
                                  <Link
                                    href={`/perfil/${otherUser.id}`}
                                    className="text-[var(--cl-teal)] hover:underline"
                                  >
                                    {otherUser.full_name || tCommon("user")}
                                  </Link>
                                ) : (
                                  tCommon("user")
                                )}
                              </p>
                              <p className="text-[10px] text-[var(--cl-ink-muted)]">
                                {new Date(
                                  transfer.created_at,
                                ).toLocaleDateString("pt-BR")}{" "}
                                •{" "}
                                {new Date(
                                  transfer.created_at,
                                ).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              {transfer.message && (
                                <p className="text-[10px] text-gray-400 mt-0.5 italic truncate max-w-[200px]">
                                  "{transfer.message}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p
                              className={`font-bold text-sm ${isSent ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                            >
                              {isSent ? "-" : "+"}
                              {transfer.points_amount.toLocaleString()}
                            </p>
                            <p className="text-[9px] text-gray-500 uppercase font-medium">
                              {t("points")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--cl-ink-muted)]">
                    <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t("noTransfersYet")}</p>
                    <p className="text-sm mt-1">
                      {t("transfersWillAppearHere")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
