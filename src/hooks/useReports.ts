"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Report {
  id: string;
  type: "user" | "post" | "message" | "review" | "classified" | "other";
  reason: string;
  description: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "urgent";
  reporter_id: string;
  reported_user_id?: string;
  reported_post_id?: string;
  reported_message_id?: string;
  reported_classified_id?: string;
  reported_story_id?: string;
  admin_notes?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  reporter_name?: string;
  reported_user_name?: string;
  classified_title?: string;
  classified_description?: string;
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("reports")
        .select(
          `
          *,
          reporter:reporter_id(full_name, avatar_url),
          reported_user:reported_user_id(full_name, avatar_url),
          classified_ad:reported_classified_id(title, description, user_name),
          reported_story:reported_story_id(image_url, user_id)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Processar os dados para incluir nomes
      const processedReports =
        data?.map((report) => ({
          ...report,
          reporter_name: report.reporter?.full_name || "Usuário",
          reported_user_name: report.reported_user?.full_name || "Usuário",
          classified_title: report.classified_ad?.title || "",
          classified_description: report.classified_ad?.description || "",
          story_image: report.reported_story?.image_url || "",
        })) || [];

      setReports(processedReports);
    } catch (err) {
      console.error("Erro ao carregar denúncias:", err);
      setError("Erro ao carregar denúncias");
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (
    reportId: string,
    status: Report["status"],
    adminNotes?: string,
  ) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      // Recarregar a lista
      await loadReports();
      return true;
    } catch (err) {
      console.error("Erro ao atualizar denúncia:", err);
      return false;
    }
  };

  const resolveReport = async (
    reportId: string,
    resolution: string,
    adminNotes?: string,
  ) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: "resolved",
          resolution,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      // Recarregar a lista
      await loadReports();
      return true;
    } catch (err) {
      console.error("Erro ao resolver denúncia:", err);
      return false;
    }
  };

  const dismissReport = async (reportId: string, adminNotes?: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: "dismissed",
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      // Recarregar a lista
      await loadReports();
      return true;
    } catch (err) {
      console.error("Erro ao dispensar denúncia:", err);
      return false;
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return {
    reports,
    loading,
    error,
    loadReports,
    updateReportStatus,
    resolveReport,
    dismissReport,
  };
}
