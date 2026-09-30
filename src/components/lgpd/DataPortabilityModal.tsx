"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  Database,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Trash2,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DataPortabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataPortabilityModal({
  isOpen,
  onClose,
}: DataPortabilityModalProps) {
  const { user } = useAuthContext();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  if (!isOpen) return null;

  const handleExportData = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para exportar dados");
      return;
    }

    setIsExporting(true);
    setExportStatus("idle");

    try {
      const response = await fetch("/api/lgpd/export-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao exportar dados");
      }

      // Criar download do arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `confilar-dados-${user.id}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus("success");
      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      setExportStatus("error");
      toast.error("Erro ao exportar dados. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  const dataTypes = [
    {
      name: "Perfil Pessoal",
      description: "Informações básicas do seu perfil",
      icon: <Eye className="h-4 w-4" />,
      included: true,
    },
    {
      name: "Mensagens",
      description: "Todas as conversas e mensagens",
      icon: <FileText className="h-4 w-4" />,
      included: true,
    },
    {
      name: "Avaliações",
      description: "Avaliações recebidas e enviadas",
      icon: <CheckCircle className="h-4 w-4" />,
      included: true,
    },
    {
      name: "Favoritos",
      description: "Profissionais favoritados",
      icon: <Database className="h-4 w-4" />,
      included: true,
    },
    {
      name: "Classificados",
      description: "Anúncios publicados",
      icon: <FileText className="h-4 w-4" />,
      included: true,
    },
    {
      name: "Notificações",
      description: "Histórico de notificações",
      icon: <AlertTriangle className="h-4 w-4" />,
      included: true,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--cl-surface)] border-gray-200 dark:border-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <Download className="h-6 w-6 mr-2 text-[var(--cl-teal)] dark:text-blue-400" />
            Portabilidade de Dados
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Exercite seu direito de portabilidade conforme a LGPD
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações sobre Portabilidade */}
          <div className="bg-[var(--cl-mist)] dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              O que é Portabilidade de Dados?
            </h3>
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              Você tem o direito de receber seus dados pessoais em formato
              estruturado, de uso comum e legível por máquina, e de transmitir
              esses dados para outro controlador, conforme previsto na LGPD.
            </p>
          </div>

          {/* Tipos de Dados */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Dados que serão exportados:
            </h3>
            <div className="grid gap-3">
              {dataTypes.map((dataType, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-[var(--cl-teal)] dark:text-blue-400">
                      {dataType.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {dataType.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {dataType.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                  >
                    Incluído
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Formato do Arquivo */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Formato do Arquivo:
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>
                • <strong>Formato:</strong> JSON (JavaScript Object Notation)
              </li>
              <li>
                • <strong>Codificação:</strong> UTF-8
              </li>
              <li>
                • <strong>Estrutura:</strong> Dados organizados por categoria
              </li>
              <li>
                • <strong>Metadados:</strong> Data de exportação e versão
              </li>
            </ul>
          </div>

          {/* Status da Exportação */}
          {exportStatus === "success" && (
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-green-800 dark:text-green-300 font-medium">
                  Dados exportados com sucesso! O download deve ter iniciado
                  automaticamente.
                </p>
              </div>
            </div>
          )}

          {exportStatus === "error" && (
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-red-800 dark:text-red-300 font-medium">
                  Erro ao exportar dados. Tente novamente ou entre em contato
                  com o suporte.
                </p>
              </div>
            </div>
          )}

          {/* Avisos Importantes */}
          <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
              Avisos Importantes:
            </h3>
            <ul className="text-amber-700 dark:text-amber-400 text-sm space-y-1">
              <li>
                • O arquivo contém dados pessoais sensíveis - mantenha-o seguro
              </li>
              <li>
                • A exportação pode levar alguns minutos dependendo da
                quantidade de dados
              </li>
              <li>
                • Você pode solicitar uma nova exportação a qualquer momento
              </li>
              <li>• Os dados são exportados no momento da solicitação</li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              className="bg-[var(--cl-ink)] hover:brightness-110 dark:bg-blue-500 dark:hover:bg-[var(--cl-ink)]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Meus Dados
                </>
              )}
            </Button>

            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>

          {/* Informações de Contato */}
          <div className="text-xs text-gray-500 text-center">
            <p>
              Dúvidas sobre portabilidade de dados? Entre em contato:
              <a
                href="mailto:privacidade@appconfilar.com.br"
                className="text-[var(--cl-teal)] hover:underline ml-1"
              >
                privacidade@appconfilar.com.br
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
