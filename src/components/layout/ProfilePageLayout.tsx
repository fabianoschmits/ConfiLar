"use client";

import { ReactNode } from "react";
import { MainLayout } from "./MainLayout";
import { PageTransition } from "@/components/animations/PageTransition";
import { FadeIn } from "@/components/animations/FadeIn";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Save, Edit, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfilePageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showBackButton?: boolean;
  showSaveButton?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  isEditing?: boolean;
  className?: string;
}

export function ProfilePageLayout({
  children,
  title,
  description,
  showBackButton = true,
  showSaveButton = false,
  onSave,
  onCancel,
  isSaving = false,
  isEditing = false,
  className = "",
}: ProfilePageLayoutProps) {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header da Página */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {showBackButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center space-x-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar</span>
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              {showSaveButton && (
                <div className="flex items-center space-x-2">
                  {isEditing && onCancel && (
                    <Button
                      onClick={onCancel}
                      disabled={isSaving}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  )}
                  {onSave && (
                    <Button
                      onClick={onSave}
                      disabled={isSaving}
                      size="sm"
                      className="bg-[var(--cl-ink)] hover:brightness-110"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Salvar
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Breadcrumb/Status */}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <User className="h-3 w-3" />
              <span>Perfil</span>
              <span>•</span>
              <span>{title}</span>
              {isEditing && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    Modo edição
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </MainLayout>
  );
}

// Componente para seções de perfil
interface ProfileSectionProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function ProfileSection({
  children,
  title,
  description,
  icon,
  className = "",
}: ProfileSectionProps) {
  return (
    <div
      className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}
    >
      <div className="p-6 border-b-4 border-black bg-black text-yellow-400">
        <h3 className="text-lg font-black flex items-center space-x-2">
          {icon}
          <span>{title.toUpperCase()}</span>
        </h3>
        {description && (
          <p className="text-sm font-bold mt-1">{description.toUpperCase()}</p>
        )}
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

// Componente para informações de perfil
interface ProfileInfoProps {
  label: string;
  value: string | ReactNode;
  icon?: ReactNode;
  editable?: boolean;
  onEdit?: () => void;
  className?: string;
}

export function ProfileInfo({
  label,
  value,
  icon,
  editable = false,
  onEdit,
  className = "",
}: ProfileInfoProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 bg-gray-100 border-2 border-black ${className}`}
    >
      <div className="flex items-center space-x-3">
        {icon && <div className="text-black">{icon}</div>}
        <div>
          <p className="text-sm font-black text-black">{label.toUpperCase()}</p>
          <div className="text-black mt-1">
            {typeof value === "string" ? (
              <p className="text-sm font-bold">{value || "NÃO INFORMADO"}</p>
            ) : (
              value
            )}
          </div>
        </div>
      </div>
      {editable && onEdit && (
        <Button
          onClick={onEdit}
          className="bg-blue-500 text-white border-2 border-black hover:bg-[var(--cl-ink)] font-black"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Componente para estatísticas de perfil
interface ProfileStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
    color?: string;
  }>;
  className?: string;
}

export function ProfileStats({ stats, className = "" }: ProfileStatsProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="text-center p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          {stat.icon && (
            <div className={`text-2xl mb-2 ${stat.color || "text-black"}`}>
              {stat.icon}
            </div>
          )}
          <p className="text-2xl font-black text-black">{stat.value}</p>
          <p className="text-sm font-bold text-black">
            {stat.label.toUpperCase()}
          </p>
        </div>
      ))}
    </div>
  );
}
