"use client";

import { ReportDialog, ReportDialogProps, ReportType } from "./ReportDialog";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Flag,
  AlertTriangle,
  User,
  FileText,
  MessageCircle,
  Star,
  MoreVertical,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";

interface ReportButtonProps extends Omit<
  ReportDialogProps,
  "isOpen" | "onOpenChange"
> {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  asDropdownItem?: boolean;
}

export function ReportButton({
  type,
  targetId,
  targetName,
  reportedUserId,
  className,
  variant = "ghost",
  size = "sm",
  asDropdownItem = false,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Se for usado como item de dropdown, renderizar apenas o botão
  // O componente pai DEVE controlar o modal usando ReportDialog
  // Mas para retrocompatibilidade, se não tiver asDropdownItem, funciona como antes
  if (asDropdownItem) {
    return (
      <button
        onClick={() => {
          // Em um mundo ideal, aqui chamaríamos uma prop `onOpen` passada pelo pai
          // Mas como estamos refatorando, vamos assumir que o pai vai usar o ReportDialog diretamente
          // e o ReportButton dentro de dropdown será apenas visual ou disparador de evento
          // Por enquanto, vamos manter como um botão simples que não faz nada além de ser clicado
          // O Pai deve capturar o evento de clique na DropdownMenuItem
        }}
        className={cn(
          "flex items-center gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50 w-full justify-start text-sm rounded-md px-2 py-2 transition-colors",
          className,
        )}
      >
        <Flag className="h-4 w-4" />
        <span>Denunciar</span>
      </button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
          "flex items-center gap-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors",
          className,
        )}
        onClick={() => setIsOpen(true)}
      >
        <Flag className="h-3.5 w-3.5" />
        <span className="text-xs">Denunciar</span>
      </Button>

      <ReportDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        type={type}
        targetId={targetId}
        targetName={targetName}
        reportedUserId={reportedUserId}
      />
    </>
  );
}
