"use client";

import React, { useState, useEffect } from "react";
import { supportService } from "@/modules/support/services/supportService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  ArrowLeft,
  Loader2,
  MessageSquare,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SupportRatingsPage() {
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    setIsLoading(true);
    try {
      const data = await supportService.getDetailedRatings();
      setRatings(data);
    } catch (error) {
      console.error("Error loading ratings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando avaliações...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Avaliações do Suporte
          </h1>
          <p className="text-muted-foreground">
            Feedback detalhado dos usuários sobre o atendimento.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {ratings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm font-medium">
                Nenhuma avaliação encontrada.
              </p>
            </CardContent>
          </Card>
        ) : (
          ratings.map((rating) => (
            <Card
              key={rating.ticket_id}
              className="overflow-hidden hover:border-primary/50 transition-all group"
            >
              <CardContent className="p-5 flex flex-col md:flex-row gap-6 items-start">
                {/* User Info */}
                <div className="flex flex-col items-center gap-1.5 shrink-0 w-24">
                  <div className="relative mb-1">
                    {rating.profiles?.avatar_url ? (
                      <img
                        src={rating.profiles.avatar_url}
                        alt={rating.profiles.full_name}
                        className="w-14 h-14 rounded-full object-cover shadow-sm border border-border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border border-border">
                        <Star className="w-7 h-7 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 text-center w-full px-1">
                    <p className="text-[11px] font-bold truncate leading-tight text-foreground/90">
                      {rating.profiles?.full_name || "Usuário Desconhecido"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 w-full">
                    {rating.profiles?.is_pro && (
                      <Badge className="bg-amber-500 text-amber-950 border-none font-black text-[8px] px-1.5 py-0 h-3.5 leading-none">
                        PRO
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-[8px] font-bold uppercase tracking-tighter py-0 h-3.5 w-fit border-muted-foreground/20 text-muted-foreground px-1.5"
                    >
                      {rating.profiles?.user_type === "professional"
                        ? "Profissional"
                        : "Cliente"}
                    </Badge>
                  </div>
                </div>

                {/* Rating Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            rating.rating >= s
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted-foreground/20 stroke-muted-foreground/40"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(rating.rated_at), "dd 'de' MMM, HH:mm", {
                        locale: ptBR,
                      })}
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-3 border border-border/50 relative italic">
                    <span className="text-sm">
                      {rating.feedback || (
                        <span className="text-muted-foreground opacity-50">
                          Nenhum comentário fornecido.
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] font-medium text-foreground truncate max-w-[200px] md:max-w-md">
                        Ticket: {rating.support_tickets?.subject}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[11px] gap-2 hover:text-primary"
                      onClick={() =>
                        router.push(
                          `/gestao-confi/dashboard/tickets/${rating.ticket_id}`,
                        )
                      }
                    >
                      Ver Ticket <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
