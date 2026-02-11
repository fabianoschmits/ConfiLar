"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
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
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface MessageMenuProps {
  messageId: string;
  messageContent: string;
  onDelete: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  disabled?: boolean;
  isOwnMessage: boolean;
}

export function MessageMenu({
  messageId,
  messageContent,
  onDelete,
  onEdit,
  disabled = false,
  isOwnMessage,
}: MessageMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(messageId);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Erro ao deletar mensagem:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    // Você pode adicionar um toast aqui se quiser
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-2.5 w-2.5 text-gray-500 hover:text-gray-700" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40 bg-white border border-gray-200 shadow-lg rounded-lg p-1"
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-700 text-sm rounded-md px-2 py-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            Copiar
          </DropdownMenuItem>

          {/* Opções para mensagens próprias - Editar */}
          {isOwnMessage && onEdit && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(messageId, messageContent);
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-700 text-sm rounded-md px-2 py-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-gray-200 my-1" />

          {/* Opção de deletar para mensagens próprias */}
          {isOwnMessage && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 text-sm rounded-md px-2 py-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Deletar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de Confirmação de Exclusão */}
      <ResponsiveModal
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar Mensagem"
        description="Tem certeza que deseja deletar esta mensagem?"
        footer={
          <div className="flex gap-3 w-full sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 sm:flex-none bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 sm:flex-none bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </Button>
          </div>
        }
      >
        <div className="text-gray-600 space-y-3 pb-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Importante:
            </p>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Esta ação não pode ser desfeita</li>
              <li>• A mensagem será removida para todos</li>
              <li>• Ninguém conseguirá mais ver esta mensagem</li>
            </ul>
          </div>
        </div>
      </ResponsiveModal>
    </>
  );
}
