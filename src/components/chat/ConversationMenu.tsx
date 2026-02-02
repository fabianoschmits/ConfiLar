"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Trash2,
  Archive,
  Pin,
  AlertTriangle,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReportButton } from "@/components/ReportButton";
import { ConversationReportModal } from "./ConversationReportModal";
import { toast } from "sonner";
import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";

interface ConversationMenuProps {
  conversationId: string;
  onDelete: (conversationId: string) => Promise<boolean>;
  onArchive?: (conversationId: string) => void;
  onPin?: (conversationId: string) => void;
  disabled?: boolean;
  conversationData?: any;
  messages?: any[];
}

export function ConversationMenu({
  conversationId,
  onDelete,
  onArchive,
  onPin,
  disabled = false,
  conversationData,
  messages,
}: ConversationMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useCloseOnScroll(isOpen, setIsOpen);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log(
        "🗑️ ConversationMenu: Tentando deletar conversa:",
        conversationId,
      );

      const success = await onDelete(conversationId);

      if (success) {
        console.log("✅ ConversationMenu: Conversa deletada com sucesso");
        toast.success("Conversa removida!", {
          description:
            "A conversa foi removida da sua lista. O outro usuário ainda pode acessá-la.",
        });
        setShowDeleteDialog(false);
      } else {
        console.error("❌ ConversationMenu: Falha ao deletar conversa");
        toast.error("Erro ao deletar conversa", {
          description:
            "Não foi possível deletar a conversa. Verifique as permissões e tente novamente.",
        });
      }
    } catch (error) {
      console.error("❌ ConversationMenu: Erro ao deletar conversa:", error);
      toast.error("Erro ao deletar conversa", {
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <div
            className="p-1 cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3 w-3" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg p-1"
        >
          {onPin && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onPin(conversationId);
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-700 text-sm rounded-md px-2 py-1.5"
            >
              <Pin className="h-3.5 w-3.5" />
              Fixar Conversa
            </DropdownMenuItem>
          )}

          {onArchive && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onArchive(conversationId);
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-700 text-sm rounded-md px-2 py-1.5"
            >
              <Archive className="h-3.5 w-3.5" />
              Arquivar
            </DropdownMenuItem>
          )}

          {(onPin || onArchive) && (
            <DropdownMenuSeparator className="bg-gray-200 my-1" />
          )}

          {/* Botão de Denunciar Conversa */}
          {conversationData && messages && (
            <DropdownMenuItem
              onSelect={(e) => {
                // Allow default behavior to close the menu
              }}
              asChild
            >
              <ConversationReportModal
                conversationId={conversationId}
                clientId={conversationData.client_id}
                clientName={conversationData.client?.full_name || "Usuário"}
                professionalId={conversationData.professional_id}
                professionalName={
                  conversationData.professional?.full_name || "Usuário"
                }
                messages={messages}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 border-0"
              />
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="flex items-center gap-2 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 text-sm rounded-md px-2 py-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Deletar Conversa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border border-gray-200 shadow-xl rounded-lg max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Deletar Conversa
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-gray-600 space-y-3">
                <p>Tem certeza que deseja remover esta conversa?</p>
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    ℹ️ Informação:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• A conversa será removida apenas da sua lista</li>
                    <li>• O outro participante ainda terá acesso à conversa</li>
                    <li>• Você não receberá mais mensagens desta conversa</li>
                    <li>• Esta ação não pode ser desfeita</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              onClick={() => setShowDeleteDialog(false)}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
