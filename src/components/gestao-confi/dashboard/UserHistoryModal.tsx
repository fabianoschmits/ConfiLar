"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ShoppingBag,
  Heart,
  Star,
  Clock,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  Coins,
  Share2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface UserHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

interface HistoryItem {
  id: string;
  type:
    | "post"
    | "classified"
    | "favorite"
    | "recommendation"
    | "review"
    | "comment"
    | "reaction"
    | "share"
    | "point";
  title: string;
  description?: string;
  created_at: string;
  target_id?: string;
  metadata?: any;
}

const ITEMS_PER_PAGE = 5;

export function UserHistoryModal({
  isOpen,
  onOpenChange,
  user,
}: UserHistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback(
    async (userId: string, currentPage: number) => {
      setLoading(true);
      try {
        // Aggregate data from multiple tables
        // In a real scenario, this might be better handled by a database view or a dedicated activity log table
        // But since user_activity_log is empty, we aggregate manually for now.
        const [
          posts,
          classifieds,
          favorites,
          recommendations,
          likes,
          comments,
          shares,
          points,
        ] = await Promise.all([
          supabase
            .from("feed_posts")
            .select("id, title, description, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("classified_ads")
            .select("id, title, description, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("favorites")
            .select(
              "id, created_at, professional_id, professional:profiles!favorites_professional_id_fkey(full_name)",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("user_recommendations")
            .select(
              "id, created_at, recommended_id, recommended:profiles!user_recommendations_recommended_id_fkey(full_name)",
            )
            .eq("recommender_id", userId)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("feed_posts_likes")
            .select(
              "id, post_id, is_premium, created_at, post:feed_posts(title, user:profiles!feed_posts_user_id_fkey(full_name))",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("post_comments")
            .select(
              "id, post_id, content, created_at, post:feed_posts(title, user:profiles!feed_posts_user_id_fkey(full_name))",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("post_shares")
            .select(
              "id, post_id, share_type, created_at, post:feed_posts(title, user:profiles!feed_posts_user_id_fkey(full_name))",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("point_transactions")
            .select(
              "id, amount, type, description, source, metadata, created_at, related_user:profiles!point_transactions_related_user_id_fkey(full_name)",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        let allItems: HistoryItem[] = [];

        if (posts.data) {
          allItems = [
            ...allItems,
            ...posts.data.map((p) => ({
              id: p.id,
              type: "post" as const,
              title: "Criou um post",
              description: p.title || p.description?.substring(0, 100),
              created_at: p.created_at,
              target_id: p.id,
            })),
          ];
        }

        if (classifieds.data) {
          allItems = [
            ...allItems,
            ...classifieds.data.map((c) => ({
              id: c.id,
              type: "classified" as const,
              title: "Publicou um classificado",
              description: c.title,
              created_at: c.created_at,
              target_id: c.id,
            })),
          ];
        }

        if (favorites.data) {
          allItems = [
            ...allItems,
            ...favorites.data.map((f) => ({
              id: f.id,
              type: "favorite" as const,
              title: "Adicionou aos favoritos",
              description: `Favoritou ${(f.professional as any)?.full_name || "um profissional"}`,
              created_at: f.created_at,
              target_id: (f as any).professional_id,
            })),
          ];
        }

        if (recommendations.data) {
          allItems = [
            ...allItems,
            ...recommendations.data.map((r) => ({
              id: r.id,
              type: "recommendation" as const,
              title: "Fez uma recomendação",
              description: `Recomendou ${(r.recommended as any)?.full_name || "um membro"}`,
              created_at: r.created_at,
              target_id: (r as any).recommended_id,
            })),
          ];
        }

        if (likes.data) {
          allItems = [
            ...allItems,
            ...likes.data.map((l) => ({
              id: l.id,
              type: "reaction" as const,
              title: l.is_premium ? "Deu um Like Premium" : "Curtiu um post",
              description: `${(l.post as any)?.title || "Ver post"} de ${(l.post as any)?.user?.full_name || "alguém"}`,
              created_at: l.created_at,
              target_id: (l as any).post_id,
              metadata: { is_premium: l.is_premium },
            })),
          ];
        }

        if (comments.data) {
          allItems = [
            ...allItems,
            ...comments.data.map((c) => ({
              id: c.id,
              type: "comment" as const,
              title: "Comentou em um post",
              description: `${c.content} (no post de ${(c.post as any)?.user?.full_name || "alguém"})`,
              created_at: c.created_at,
              target_id: (c as any).post_id,
            })),
          ];
        }

        if (shares.data) {
          allItems = [
            ...allItems,
            ...shares.data.map((s) => ({
              id: s.id,
              type: "share" as const,
              title: "Compartilhou um post",
              description: `Compartilhou o post de ${(s.post as any)?.user?.full_name || "alguém"}`,
              created_at: s.created_at,
              target_id: (s as any).post_id,
            })),
          ];
        }

        if (points.data) {
          allItems = [
            ...allItems,
            ...points.data.map((p) => {
              const prefix =
                p.type === "earn" ||
                p.type === "purchase" ||
                p.type === "refund"
                  ? "+"
                  : "-";
              let desc = p.description || p.source || "";
              if (p.type === "transfer" && (p.metadata as any)?.to_user_name) {
                desc = `Para ${(p.metadata as any).to_user_name}`;
              } else if (p.type === "transfer") {
                const relUser = Array.isArray((p as any).related_user)
                  ? (p as any).related_user[0]
                  : (p as any).related_user;
                if (relUser?.full_name) {
                  desc = `Para ${relUser.full_name}`;
                }
              }

              return {
                id: p.id,
                type: "point" as const,
                title:
                  p.type === "earn"
                    ? "Recebeu pontos"
                    : p.type === "spend"
                      ? "Gastou pontos"
                      : p.type === "transfer"
                        ? "Transferiu pontos"
                        : p.type === "purchase"
                          ? "Comprou pontos"
                          : "Pontos",
                description: `${prefix}${p.amount} pontos · ${desc}`,
                created_at: p.created_at,
                metadata: p,
              };
            }),
          ];
        }

        // Sort all items by date
        allItems.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        const start = currentPage * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedItems = allItems.slice(0, end);

        setHistory(paginatedItems);
        setHasMore(paginatedItems.length < allItems.length);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (isOpen && user?.id) {
      setPage(0);
      fetchHistory(user.id, 0);
    } else {
      setHistory([]);
    }
  }, [isOpen, user, fetchHistory]);

  const handleSeeMore = () => {
    if (user?.id) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(user.id, nextPage);
    }
  };

  const getIcon = (type: HistoryItem["type"]) => {
    switch (type) {
      case "post":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "classified":
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case "favorite":
        return <Heart className="w-4 h-4 text-rose-500" />;
      case "recommendation":
        return <Star className="w-4 h-4 text-amber-500" />;
      case "comment":
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case "reaction":
        return <ThumbsUp className="w-4 h-4 text-[var(--cl-teal)]" />;
      case "share":
        return <Share2 className="w-4 h-4 text-blue-400" />;
      case "point":
        return <Coins className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[32px] border-border/40 shadow-2xl">
        <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 border-b border-border/40">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-4 ring-white dark:ring-slate-900 shadow-xl">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-[var(--cl-cta)] text-[var(--cl-on-cta)] font-bold">
                {user?.full_name?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Histórico de Atividade
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-medium opacity-70">
                Acompanhe as ações de {user?.full_name} na plataforma.
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[450px] p-8">
          {loading && history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[var(--cl-teal)]/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Carregando histórico...
              </p>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-6">
              {history.map((item, index) => (
                <div
                  key={item.id + index}
                  className="group relative flex gap-6 pb-2"
                >
                  {/* Timeline Line */}
                  {index !== history.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-gradient-to-b from-slate-100 to-transparent dark:from-slate-800" />
                  )}

                  {/* Icon Circle */}
                  <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-grow pt-1.5">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      {item.target_id ? (
                        <Link
                          href={
                            item.type === "post" ||
                            item.type === "comment" ||
                            item.type === "reaction"
                              ? `/feed?post=${item.target_id}`
                              : item.type === "classified"
                                ? `/classificados?ad=${item.target_id}`
                                : `/perfil/${item.target_id}`
                          }
                          className="font-black text-sm text-slate-900 dark:text-white leading-tight hover:text-[var(--cl-teal)] transition-colors flex items-center gap-1 group/link"
                        >
                          {item.title}
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-all -ml-1 group-hover:ml-0" />
                        </Link>
                      ) : (
                        <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                          {item.title}
                        </h4>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-md">
                        {format(new Date(item.created_at), "HH:mm · dd MMM", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 italic">
                        "{item.description}"
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="pt-6 border-t border-slate-50 dark:border-slate-900 flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={handleSeeMore}
                    disabled={loading}
                    className="rounded-2xl px-8 h-12 font-black text-xs uppercase tracking-widest text-[var(--cl-teal)] hover:bg-[var(--cl-mist)] transition-all hover:scale-105 active:scale-95"
                  >
                    {loading ? "Carregando..." : "Ver Mais Histórico"}
                    {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-40">
              <Clock className="w-16 h-16 mb-4 text-slate-300" />
              <p className="text-lg font-black text-slate-400 uppercase tracking-tighter">
                Nenhuma atividade encontrada
              </p>
              <p className="text-sm font-medium mt-1">
                Este usuário ainda não realizou ações visíveis.
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-border/40 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-2xl px-8 h-11 bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-black font-black text-xs uppercase tracking-widest transition-all"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
