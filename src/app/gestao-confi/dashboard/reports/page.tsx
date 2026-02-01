"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SimpleTable } from "@/components/gestao-confi/shared/SimpleTable";
import { SearchBar } from "@/components/gestao-confi/shared/SearchBar";
import { PageHeader } from "@/components/gestao-confi/shared/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

interface Report {
  id: string;
  type: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  reporter_id: string;
  reported_user_id?: string;
  reported_post_id?: string;
  created_at: string;
  reporter?: {
    full_name: string;
    email: string;
  };
  reported_user?: {
    full_name: string;
    email: string;
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Buscar reports primeiro
      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (searchQuery) {
        query = query.or(
          `reason.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
        );
      }

      const { data: reportsData, error } = await query;

      if (error) throw error;

      // Buscar dados dos usuários separadamente
      const reportsWithUsers = await Promise.all(
        (reportsData || []).map(async (report) => {
          const [reporter, reportedUser] = await Promise.all([
            report.reporter_id
              ? supabase
                  .from("profiles")
                  .select("full_name, email")
                  .eq("id", report.reporter_id)
                  .single()
                  .then(({ data }) => data)
              : null,
            report.reported_user_id
              ? supabase
                  .from("profiles")
                  .select("full_name, email")
                  .eq("id", report.reported_user_id)
                  .single()
                  .then(({ data }) => data)
              : null,
          ]);

          return {
            ...report,
            reporter: reporter || null,
            reported_user: reportedUser || null,
          };
        }),
      );

      setReports(reportsWithUsers);
    } catch (error) {
      console.error("Erro ao buscar denúncias:", error);
      toast.error("Erro ao carregar denúncias");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (error) throw error;
      toast.success("Status atualizado");
      fetchReports();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      reviewing:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      resolved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      dismissed:
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const columns = [
    {
      key: "type",
      label: "Tipo",
      render: (report: Report) => (
        <span className="capitalize">
          {report.type === "user"
            ? "Usuário"
            : report.type === "post"
              ? "Post"
              : report.type}
        </span>
      ),
    },
    {
      key: "reason",
      label: "Motivo",
      render: (report: Report) => (
        <span className="truncate max-w-xs">{report.reason}</span>
      ),
    },
    {
      key: "reporter",
      label: "Denunciante",
      render: (report: Report) =>
        report.reporter?.full_name || report.reporter?.email || "N/A",
    },
    {
      key: "reported",
      label: "Denunciado",
      render: (report: Report) => {
        if (report.reported_user_id) {
          return (
            report.reported_user?.full_name ||
            report.reported_user?.email ||
            "N/A"
          );
        }
        return "N/A";
      },
    },
    {
      key: "priority",
      label: "Prioridade",
      render: (report: Report) => (
        <Badge className={getPriorityBadge(report.priority)}>
          {report.priority}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (report: Report) => (
        <Badge className={getStatusBadge(report.status)}>
          {report.status === "pending"
            ? "Pendente"
            : report.status === "reviewing"
              ? "Em Análise"
              : report.status === "resolved"
                ? "Resolvido"
                : "Descartado"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Data",
      render: (report: Report) =>
        new Date(report.created_at).toLocaleDateString("pt-BR"),
    },
    {
      key: "actions",
      label: "Ações",
      render: (report: Report) => (
        <div className="flex gap-2">
          <Select
            value={report.status}
            onValueChange={(value) => updateStatus(report.id, value)}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="reviewing">Em Análise</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="dismissed">Descartado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Denúncias"
        onRefresh={fetchReports}
        loading={loading}
      />

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Buscar por motivo ou descrição..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={fetchReports}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="reviewing">Em Análise</SelectItem>
            <SelectItem value="resolved">Resolvido</SelectItem>
            <SelectItem value="dismissed">Descartado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SimpleTable
        columns={columns}
        data={reports}
        loading={loading}
        emptyMessage="Nenhuma denúncia encontrada"
      />
    </div>
  );
}
