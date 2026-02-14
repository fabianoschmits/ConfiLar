"use client";

import { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Flag,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserReport {
  id: string;
  type: "user" | "post" | "message" | "review" | "classified" | "other";
  reason: string;
  description: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  resolution?: string;
}

interface UserReportsModalProps {
  children: React.ReactNode;
}

export function UserReportsModal({ children }: UserReportsModalProps) {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();

  const fetchUserReports = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("reporter_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10); // Limitar a 10 denúncias mais recentes

      if (error) {
        console.error("Erro ao buscar denúncias:", error);
        toast.error("Erro ao carregar suas denúncias");
        return;
      }

      setReports(data || []);
    } catch (error) {
      console.error("Erro ao buscar denúncias:", error);
      toast.error("Erro ao carregar suas denúncias");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchUserReports();
    }
  }, [isOpen, user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewing":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "reviewing":
        return "Em Revisão";
      case "resolved":
        return "Resolvida";
      case "dismissed":
        return "Dispensada";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "reviewing":
        return <Eye className="h-3 w-3" />;
      case "resolved":
        return <CheckCircle className="h-3 w-3" />;
      case "dismissed":
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "user":
        return "Usuário";
      case "post":
        return "Post";
      case "message":
        return "Mensagem";
      case "review":
        return "Avaliação";
      case "classified":
        return "Anúncio";
      default:
        return "Outros";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente";
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)} className="cursor-pointer">
        {children}
      </span>
      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        className="md:max-w-4xl"
        title={
          <div className="flex items-center justify-between text-gray-900 dark:text-white w-full">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span>Minhas Denúncias</span>
              {reports.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {reports.length}
                </Badge>
              )}
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                fetchUserReports();
              }}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>
        }
        footer={
          reports.length > 0 ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Flag className="h-4 w-4" />
                <span>Mostrando as 10 denúncias mais recentes</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                }}
                className="text-xs"
              >
                Ver Todas
              </Button>
            </div>
          ) : null
        }
      >
        <div className="grid gap-4">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma denúncia encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Você ainda não enviou nenhuma denúncia. Quando enviar, elas
                aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500 dark:border-l-blue-400"
                >
                  <CardContent className="p-5">
                    {/* Header com badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h4 className="font-semibold text-base text-gray-900 dark:text-white">
                          Denúncia de {getTypeLabel(report.type)}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={`${getStatusColor(report.status)} flex items-center gap-1 text-xs px-2 py-1`}
                          >
                            {getStatusIcon(report.status)}
                            {getStatusLabel(report.status)}
                          </Badge>
                          <Badge
                            className={`${getPriorityColor(report.priority)} text-xs px-2 py-1`}
                          >
                            {getPriorityLabel(report.priority)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.created_at).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    </div>

                    {/* Motivo */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Motivo:</strong> {report.reason}
                      </p>
                    </div>

                    {/* Descrição */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {report.description}
                      </p>
                    </div>

                    {/* Notas do Admin */}
                    {report.admin_notes && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2 text-sm">
                          Nota do Administrador:
                        </h5>
                        <p className="text-blue-800 text-sm leading-relaxed">
                          {report.admin_notes}
                        </p>
                      </div>
                    )}

                    {/* Resolução */}
                    {report.resolution && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="font-medium text-green-900 mb-2 text-sm">
                          Resolução:
                        </h5>
                        <p className="text-green-800 text-sm leading-relaxed">
                          {report.resolution}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ResponsiveModal>
    </>
  );
}
