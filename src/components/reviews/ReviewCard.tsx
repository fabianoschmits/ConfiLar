"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  CheckCircle,
  Reply,
  Edit,
  Trash2,
  MoreVertical,
  Flag,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ReviewWithProfiles } from "@/hooks/useSupabaseReviews";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReportButton } from "@/components/ReportButton";
import { ReportDialog } from "@/components/ReportDialog";
import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";

interface ReviewCardProps {
  review: ReviewWithProfiles;
  currentUserId?: string;
  onEdit?: (review: ReviewWithProfiles) => void;
  onDelete?: (reviewId: string) => void;
  onRespond?: (reviewId: string, response: string) => void;
  onMarkHelpful?: (reviewId: string) => void;
  showActions?: boolean;
  profileOwnerId?: string; // ID do dono do perfil (quem foi avaliado)
}

export function ReviewCard({
  review,
  currentUserId,
  onEdit,
  onDelete,
  onRespond,
  onMarkHelpful,
  showActions = true,
  profileOwnerId,
}: ReviewCardProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useCloseOnScroll(isOpen, setIsOpen);

  const isOwner = currentUserId === review.reviewer.id;
  const isReviewed = currentUserId === review.reviewed.id;
  const isProfileOwner = currentUserId === profileOwnerId;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 5:
        return "Excelente";
      case 4:
        return "Muito Bom";
      case 3:
        return "Bom";
      case 2:
        return "Regular";
      case 1:
        return "Ruim";
      default:
        return "Sem avaliação";
    }
  };

  const getRatingColor = (rating: number) => {
    return "bg-secondary/50 text-secondary-foreground border border-border/50";
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast.error("Digite uma resposta");
      return;
    }

    setIsSubmittingResponse(true);
    try {
      await onRespond?.(review.id, responseText.trim());
      setResponseText("");
      setShowResponseForm(false);
      setIsEditingResponse(false);
      toast.success(
        isEditingResponse
          ? "Resposta editada com sucesso!"
          : "Resposta enviada com sucesso!",
      );
    } catch (error) {
      toast.error("Erro ao enviar resposta");
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleEditResponse = () => {
    setResponseText(review.response_text || "");
    setIsEditingResponse(true);
    setShowResponseForm(true);
  };

  const handleMarkHelpful = async () => {
    try {
      await onMarkHelpful?.(review.id);
      toast.success("Marcado como útil!");
    } catch (error) {
      toast.error("Erro ao marcar como útil");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "Data inválida";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 sm:p-6 transition-all group">
      <div className="flex flex-col gap-4">
        {/* Header: User Info & Rating */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={review.reviewer.avatar_url}
              alt={review.reviewer.full_name}
              fallback={review.reviewer.full_name.charAt(0)}
              size="md"
              className="border border-border/50"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-foreground text-sm sm:text-base truncate">
                  {review.reviewer.full_name}
                </h3>
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1.5 uppercase font-semibold text-muted-foreground border-border/50"
                >
                  {review.reviewer.user_type === "professional"
                    ? "Profissional"
                    : "Cliente"}
                </Badge>
                {(review as any).is_recommended && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                    <CheckCircle className="h-3 w-3" />
                    Recomendado
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {renderStars(review.rating_person)}
                </div>
                <span className="text-xs text-muted-foreground">
                  • {formatDate(review.created_at)}
                </span>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="shrink-0">
              <DropdownMenu
                open={isOpen}
                onOpenChange={setIsOpen}
                modal={false}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border border-border shadow-lg rounded-lg min-w-[160px]"
                >
                  {isOwner && onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(review)}
                      className="gap-2 focus:bg-accent cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar Avaliação</span>
                    </DropdownMenuItem>
                  )}
                  {isOwner && onDelete && (
                    <DropdownMenuItem
                      onClick={async () => {
                        if (
                          confirm(
                            "Tem certeza que deseja excluir esta avaliação?",
                          )
                        ) {
                          await onDelete(review.id);
                        }
                      }}
                      className="text-destructive gap-2 focus:bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Excluir Avaliação</span>
                    </DropdownMenuItem>
                  )}
                  {isProfileOwner && !review.response_text && onRespond && (
                    <DropdownMenuItem
                      onClick={() => {
                        setShowResponseForm(true);
                        setResponseText("");
                        setIsEditingResponse(false);
                      }}
                      className="gap-2 focus:bg-accent cursor-pointer"
                    >
                      <Reply className="h-4 w-4" />
                      <span>Responder</span>
                    </DropdownMenuItem>
                  )}
                  {isProfileOwner && review.response_text && (
                    <DropdownMenuItem
                      onClick={handleEditResponse}
                      className="gap-2 focus:bg-accent cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar Resposta</span>
                    </DropdownMenuItem>
                  )}
                  {isProfileOwner && review.response_text && (
                    <DropdownMenuItem
                      onClick={async () => {
                        if (
                          confirm(
                            "Tem certeza que deseja remover sua resposta?",
                          )
                        ) {
                          if (onRespond) {
                            await onRespond(review.id, "");
                            setShowResponseForm(false);
                            setResponseText("");
                          }
                        }
                      }}
                      className="text-orange-600 gap-2 focus:bg-orange-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remover Resposta</span>
                    </DropdownMenuItem>
                  )}
                  {!isOwner && !isProfileOwner && (
                    <DropdownMenuItem
                      onClick={() => setShowReportDialog(true)}
                      asChild
                    >
                      <div className="flex items-center gap-2 w-full p-2 cursor-pointer text-muted-foreground hover:text-destructive focus:bg-destructive/10">
                        <Flag className="h-4 w-4" />
                        <span>Denunciar</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <ReportDialog
                isOpen={showReportDialog}
                onOpenChange={setShowReportDialog}
                type="review"
                targetId={review.id}
                targetName="Avaliação"
                reportedUserId={review.reviewer_id}
              />
            </div>
          )}
        </div>

        {/* Review Title & Body */}
        <div className="space-y-2">
          {(review as any).title && (
            <h4 className="font-bold text-foreground text-base sm:text-lg">
              {(review as any).title}
            </h4>
          )}
          <p className="text-foreground/80 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {review.comment}
          </p>
        </div>

        {/* Pros & Cons - Simple Tag Style */}
        {((review as any).pros?.length > 0 ||
          (review as any).positive_points?.length > 0 ||
          (review as any).cons?.length > 0 ||
          (review as any).negative_points?.length > 0) && (
          <div className="flex flex-col gap-3 pt-2">
            {((review as any).pros?.length > 0 ||
              (review as any).positive_points?.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {(
                  (review as any).pros ||
                  (review as any).positive_points ||
                  []
                ).map((point: string, idx: number) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
                  >
                    <Check className="h-3 w-3" />
                    {point}
                  </div>
                ))}
              </div>
            )}
            {((review as any).cons?.length > 0 ||
              (review as any).negative_points?.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {(
                  (review as any).cons ||
                  (review as any).negative_points ||
                  []
                ).map((point: string, idx: number) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-[11px] font-medium text-orange-700 dark:text-orange-400"
                  >
                    <X className="h-3 w-3" />
                    {point}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Response Section */}
        {review.response_text && review.response_text.trim() && (
          <div className="mt-2 bg-muted/40 rounded-lg p-4 border border-border/50 relative">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span className="font-bold text-xs text-foreground">
                Resposta do Profissional
              </span>
              {review.response_date && (
                <span className="text-[10px] text-muted-foreground">
                  • {formatDate(review.response_date)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "{review.response_text}"
            </p>
          </div>
        )}

        {/* Response Form */}
        {showResponseForm && (
          <div className="mt-2 bg-muted/50 rounded-lg p-4 border border-border">
            <h5 className="font-bold text-sm mb-3">
              {isEditingResponse ? "Editar resposta" : "Responder avaliação"}
            </h5>
            <Textarea
              placeholder="Sua resposta..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="mb-3 text-sm focus:ring-1 focus:ring-primary h-24"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowResponseForm(false);
                  setResponseText("");
                  setIsEditingResponse(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitResponse}
                disabled={isSubmittingResponse || !responseText.trim()}
              >
                {isSubmittingResponse ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions Footer */}
        {showActions && !showResponseForm && (
          <div className="flex items-center gap-4 pt-3 border-t border-border/50">
            {isReviewed && !review.response_text && (
              <Button
                onClick={() => setShowResponseForm(true)}
                variant="ghost"
                size="sm"
                className="h-8 px-3 gap-2 text-xs text-muted-foreground hover:text-primary"
              >
                <Reply className="h-3.5 w-3.5" />
                Responder
              </Button>
            )}
            {!isOwner && onMarkHelpful && (
              <Button
                onClick={handleMarkHelpful}
                variant="ghost"
                size="sm"
                className="h-8 px-3 gap-2 text-xs text-muted-foreground hover:text-emerald-600"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Útil
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
