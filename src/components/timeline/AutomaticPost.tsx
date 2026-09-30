"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useDateFormat } from "@/hooks/useDateFormat";

interface AutomaticPostProps {
  post: {
    id: string;
    title: string;
    user_id?: string;
    professional_id?: string;
    created_at: string;
    metadata?: {
      type?: string;
      user?: string;
      favorited?: string;
      from_user?: string;
      to_user?: string;
      reviewer?: string;
      reviewed?: string;
    };
  };
  onDelete?: (postId: string) => void;
  isDeleting?: boolean;
}

export function AutomaticPost({
  post,
  onDelete,
  isDeleting = false,
}: AutomaticPostProps) {
  const { user } = useAuthContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { formatTimeAgo } = useDateFormat();

  const getPostIcon = (type: string) => {
    switch (type) {
      case "favorite":
        return "❤️";
      case "recommendation":
        return "💡";
      case "review":
        return "⭐";
      case "welcome":
        return "🎉";
      default:
        return "📢";
    }
  };

  const getPostMessage = () => {
    const { type, user, favorited, from_user, to_user, reviewer, reviewed } =
      post.metadata || {};

    switch (type) {
      case "favorite":
        return (
          <span className="text-sm">
            {getPostIcon(type)}{" "}
            <Link
              href={`/perfil/${post.user_id || ""}`}
              className="text-[var(--cl-teal)] hover:text-blue-800 font-medium"
            >
              {user}
            </Link>{" "}
            favoritou{" "}
            <Link
              href={`/perfil/${post.professional_id || ""}`}
              className="text-[var(--cl-teal)] hover:text-blue-800 font-medium"
            >
              {favorited}
            </Link>
          </span>
        );
      case "recommendation":
        return (
          <span className="text-sm">
            {getPostIcon(type)}{" "}
            <Link
              href={`/perfil/${post.user_id || ""}`}
              className="text-[var(--cl-teal)] hover:text-blue-800 font-medium"
            >
              {from_user}
            </Link>{" "}
            recomendou{" "}
            <Link
              href={`/perfil/${post.professional_id || ""}`}
              className="text-[var(--cl-teal)] hover:text-blue-800 font-medium"
            >
              {to_user}
            </Link>
          </span>
        );
      case "review":
        return (
          <span className="text-sm">
            {getPostIcon(type)}{" "}
            <Link
              href={`/perfil/${post.user_id || ""}`}
              className="text-[var(--cl-teal)] hover:text-blue-800 font-medium"
            >
              {reviewer}
            </Link>{" "}
            avaliou{" "}
            <Link
              href={`/perfil/${post.professional_id || ""}`}
              className="text-[var(--cl-teal)] hover:text-blue-800 font-medium"
            >
              {reviewed}
            </Link>
          </span>
        );
      case "welcome":
        return (
          <span className="text-sm">
            {getPostIcon(type)}{" "}
            <Link
              href={`/perfil/${post.user_id || ""}`}
              className="text-[var(--cl-teal)] hover:text-blue-800 font-medium"
            >
              {user}
            </Link>{" "}
            se juntou à comunidade
          </span>
        );
      default:
        return <span className="text-sm">{post.title}</span>;
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
      setShowDeleteDialog(false);
    }
  };

  const canDelete = user && user.id === post.user_id;

  return (
    <>
      <Card className="mb-2 bg-gray-50 dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <CardContent className="py-2 px-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">{getPostMessage()}</div>

            <div className="flex items-center space-x-2 ml-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(post.created_at)}
              </span>

              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ResponsiveModal
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar Notificação"
        description="Tem certeza que deseja deletar esta notificação? Esta ação não pode ser desfeita."
        footer={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </Button>
          </div>
        }
      >
        <div />
      </ResponsiveModal>
    </>
  );
}
