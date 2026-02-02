"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  User as UserIcon,
  FileText,
  Flag,
  CheckCircle,
  EyeOff,
  Clock,
  Search,
  Ban as BanIcon,
  Trash2,
  Key,
  MoreHorizontal,
  Archive,
  RefreshCcw,
  Shield,
  Eye,
  UserX,
  Calendar,
  Info,
  ExternalLink,
  Copy,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { BanUserModal } from "@/components/gestao-confi/BanUserModal";
import {
  ReportDetailsModal,
  type Report,
  type Profile,
} from "@/components/gestao-confi/ReportDetailsModal";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import { ResponsiveTable } from "@/components/gestao-confi/ResponsiveTable";
import { ResponsiveModal } from "@/components/gestao-confi/ResponsiveModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- Interfaces ---

interface Ban {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  ban_type: string;
  duration_days?: number;
  is_active: boolean;
  created_at: string;
  admin_notes?: string;
  expires_at?: string;
  revoked_at?: string;
  related_report_id?: string;
  related_report?: Report;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    user_type?: string;
  };
}

interface ReportStats {
  total: number;
  pending: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
}

// --- Main Component ---

export default function ModerationPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("reports");

  // Credentials
  const [serviceRoleKey, setServiceRoleKey] = useState<string>("");
  const [showServiceRoleKey, setShowServiceRoleKey] = useState(false);
  const [adminSupabase, setAdminSupabase] = useState<SupabaseClient | null>(
    null,
  );

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Data
  const [reports, setReports] = useState<Report[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportSubTab, setReportSubTab] = useState("pending");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedUserForBan, setSelectedUserForBan] = useState<Profile | null>(
    null,
  );
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  // Ban Details Modal State
  const [selectedBanDetail, setSelectedBanDetail] = useState<Ban | null>(null);
  const [showBanDetailsModal, setShowBanDetailsModal] = useState(false);
  const [banAdminInfo, setBanAdminInfo] = useState<any>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

  // --- Effects ---

  useEffect(() => {
    if (serviceRoleKey.trim() && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const trimmedKey = serviceRoleKey.trim();
      if (trimmedKey.split(".").length === 3) {
        setAdminSupabase(
          createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, trimmedKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          }),
        );
      }
    } else {
      setAdminSupabase(null);
    }
  }, [serviceRoleKey]);

  useEffect(() => {
    if (adminSupabase) {
      if (activeTab === "reports") {
        fetchReports();
        fetchStats();
      } else {
        fetchBans();
      }
    }
  }, [activeTab, adminSupabase]);

  // --- Fetch Logic ---

  const fetchReports = async () => {
    if (!adminSupabase) return;
    setLoading(true);
    try {
      // 1. Fetch raw reports
      const { data: reportsData, error: reportsError } = await adminSupabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (reportsError) throw reportsError;

      // 2. Extract user IDs and content IDs for enrichment
      const userIds = new Set<string>();
      const postIds = new Set<string>();
      const classifiedIds = new Set<string>();
      const reviewIds = new Set<string>();
      const messageIds = new Set<string>();

      reportsData?.forEach((r) => {
        if (r.reporter_id) userIds.add(r.reporter_id);
        if (r.reported_user_id) userIds.add(r.reported_user_id);
        if (r.reported_post_id) postIds.add(r.reported_post_id);
        if (r.reported_classified_id)
          classifiedIds.add(r.reported_classified_id);
        if (r.reported_message_id) {
          if (r.type === "message") messageIds.add(r.reported_message_id);
          else reviewIds.add(r.reported_message_id);
        }
        if (r.reported_comment_id) postIds.add(r.reported_comment_id);
      });

      // 3. Fetch Authors for Content Reports
      const contentAuthorsMap: Record<string, string> = {};

      // Fetch Post Authors and Content
      if (postIds.size > 0) {
        const { data: posts } = await adminSupabase
          .from("feed_posts")
          .select("id, user_id, professional_id, content, images, title")
          .in("id", Array.from(postIds));
        posts?.forEach((p) => {
          const authorId = p.user_id || p.professional_id;
          if (authorId) {
            contentAuthorsMap[`post_${p.id}`] = authorId;
            userIds.add(authorId);
          }
          contentAuthorsMap[`post_content_${p.id}`] = JSON.stringify({
            text: p.content || p.title,
            media:
              Array.isArray(p.images) && p.images.length > 0
                ? p.images[0]
                : null,
            type: "post",
          });
        });
      }

      // Fetch Classified Ads
      if (classifiedIds.size > 0) {
        const { data: ads } = await adminSupabase
          .from("classified_ads")
          .select("id, user_id, title, description, user_name, images")
          .in("id", Array.from(classifiedIds));
        ads?.forEach((ad) => {
          if (ad.user_id) {
            contentAuthorsMap[`class_${ad.id}`] = ad.user_id;
            userIds.add(ad.user_id);
          }
          contentAuthorsMap[`class_content_${ad.id}`] = JSON.stringify({
            text: `${ad.title}: ${ad.description}`,
            media: (ad as any).images
              ? Array.isArray((ad as any).images)
                ? (ad as any).images[0]
                : (ad as any).images
              : null,
            type: "ad",
          });
        });
      }

      // Fetch Reviews
      if (reviewIds.size > 0) {
        const { data: reviews } = await adminSupabase
          .from("reviews")
          .select("id, reviewer_id, comment")
          .in("id", Array.from(reviewIds));
        reviews?.forEach((rev) => {
          if (rev.reviewer_id) {
            contentAuthorsMap[`rev_${rev.id}`] = rev.reviewer_id;
            userIds.add(rev.reviewer_id);
          }
          contentAuthorsMap[`rev_content_${rev.id}`] = JSON.stringify({
            text: rev.comment,
            type: "review",
          });
        });
      }

      // Fetch Chat Messages
      if (messageIds.size > 0) {
        const { data: messages } = await adminSupabase
          .from("messages")
          .select("id, sender_id, content")
          .in("id", Array.from(messageIds));
        messages?.forEach((m) => {
          if (m.sender_id) {
            contentAuthorsMap[`mess_${m.id}`] = m.sender_id;
            userIds.add(m.sender_id);
          }
          contentAuthorsMap[`mess_content_${m.id}`] = JSON.stringify({
            text: m.content,
            type: "message",
          });
        });
      }

      // Adicionar autores de conteúdo ao userIds APENAS se forem válidos
      Object.entries(contentAuthorsMap).forEach(([key, value]) => {
        if (!key.includes("_content_") && value) {
          userIds.add(value);
        }
      });

      // 4. Fetch profiles
      let profilesMap: Record<string, any> = {};
      if (userIds.size > 0) {
        const { data: profilesData } = await adminSupabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", Array.from(userIds));

        if (profilesData) {
          profilesData.forEach((p) => {
            profilesMap[p.id] = p;
          });
        }
      }

      // 5. Merge data
      const enrichedReports = reportsData?.map((r) => {
        // Find reported user ID (direct or via content author)
        let reportedUid = r.reported_user_id;
        if (!reportedUid) {
          if (r.reported_post_id)
            reportedUid = contentAuthorsMap[`post_${r.reported_post_id}`];
          else if (r.reported_classified_id)
            reportedUid =
              contentAuthorsMap[`class_${r.reported_classified_id}`];
          else if (r.reported_message_id) {
            if (r.type === "message")
              reportedUid = contentAuthorsMap[`mess_${r.reported_message_id}`];
            else
              reportedUid = contentAuthorsMap[`rev_${r.reported_message_id}`];
          } else if (r.reported_comment_id)
            reportedUid = contentAuthorsMap[`post_${r.reported_comment_id}`];
        }

        // Content Preview Data
        let reportedContent = null;
        if (
          r.reported_post_id &&
          contentAuthorsMap[`post_content_${r.reported_post_id}`]
        ) {
          reportedContent = JSON.parse(
            contentAuthorsMap[`post_content_${r.reported_post_id}`],
          );
          reportedContent.link = `/feed?post=${r.reported_post_id}`;
        } else if (
          r.reported_classified_id &&
          contentAuthorsMap[`class_content_${r.reported_classified_id}`]
        ) {
          reportedContent = JSON.parse(
            contentAuthorsMap[`class_content_${r.reported_classified_id}`],
          );
          reportedContent.link = `/classificados?ad=${r.reported_classified_id}`;
        } else if (r.reported_message_id) {
          const key =
            r.type === "message"
              ? `mess_content_${r.reported_message_id}`
              : `rev_content_${r.reported_message_id}`;
          if (contentAuthorsMap[key]) {
            reportedContent = JSON.parse(contentAuthorsMap[key]);
            reportedContent.link = null;
          }
        } else if (
          r.reported_comment_id &&
          contentAuthorsMap[`post_content_${r.reported_comment_id}`]
        ) {
          reportedContent = JSON.parse(
            contentAuthorsMap[`post_content_${r.reported_comment_id}`],
          );
          reportedContent.link = `/feed?post=${r.reported_comment_id}`;
          reportedContent.type = "review"; // Comentário é tipo uma review/avaliação do post
        }

        return {
          ...r,
          reporter: profilesMap[r.reporter_id]
            ? { id: r.reporter_id, ...profilesMap[r.reporter_id] }
            : {
                id: r.reporter_id,
                full_name: "Desconhecido",
                email: "-",
              },
          reported_user:
            reportedUid && profilesMap[reportedUid]
              ? { id: reportedUid, ...profilesMap[reportedUid] }
              : r.reported_user_id // Se não achamos no profilesMap, pelo menos tentar passar o ID se existir
                ? {
                    id: r.reported_user_id,
                    full_name: "Usuário não encontrado",
                  }
                : reportedUid
                  ? { id: reportedUid, full_name: "Autor não encontrado" }
                  : null,
          reported_content: reportedContent,
        };
      });

      setReports(enrichedReports || []);
    } catch (e: any) {
      toast.error("Erro ao buscar denúncias: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBans = async () => {
    if (!adminSupabase) return;
    setLoading(true);
    try {
      // 1. Fetch bans
      const { data: bansData, error: bansError } = await adminSupabase
        .from("user_bans")
        .select("*")
        .order("created_at", { ascending: false });

      if (bansError) throw bansError;

      // 2. Extract user IDs
      const userIds = new Set<string>();
      bansData?.forEach((b) => {
        if (b.user_id) userIds.add(b.user_id);
      });

      // 3. Fetch profiles
      let profilesMap: Record<string, any> = {};
      if (userIds.size > 0) {
        const { data: profilesData } = await adminSupabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", Array.from(userIds));

        if (profilesData) {
          profilesData.forEach((p) => {
            profilesMap[p.id] = p;
          });
        }
      }

      // 4. Merge data
      const enrichedBans = bansData?.map((b) => ({
        ...b,
        profiles: profilesMap[b.user_id]
          ? { id: b.user_id, ...profilesMap[b.user_id] }
          : {
              id: b.user_id,
              full_name: "Desconhecido",
              email: "-",
            },
      }));

      setBans(enrichedBans || []);
    } catch (e: any) {
      toast.error("Erro ao buscar banimentos");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!adminSupabase) return;
    const { data } = await adminSupabase.from("reports").select("status");
    if (data) {
      setReportStats({
        total: data.length,
        pending: data.filter((r) => r.status === "pending").length,
        reviewing: data.filter((r) => r.status === "reviewing").length,
        resolved: data.filter((r) => r.status === "resolved").length,
        dismissed: data.filter((r) => r.status === "dismissed").length,
      });
    }
  };

  const createTestReports = async () => {
    if (!adminSupabase) return;
    try {
      await adminSupabase.from("reports").insert({
        type: "user",
        reason: "Teste de Moderação",
        description: "Esta é uma denúncia de teste criada automaticamente.",
        priority: "medium",
        reporter_id: user?.id,
        status: "pending",
      });
      toast.success("Denúncia de teste criada!");
      fetchReports();
    } catch (e) {
      toast.error("Erro ao criar teste");
    }
  };

  const handleUpdateReportStatus = async (id: string, status: string) => {
    if (!adminSupabase) return;
    try {
      const { error } = await adminSupabase
        .from("reports")
        .update({ status: status })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Denúncia atualizada!`);
      fetchReports();
      fetchStats();
    } catch (e) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleUnderReview = (id: string) =>
    handleUpdateReportStatus(id, "reviewing");
  const handleRevertToPending = (id: string) =>
    handleUpdateReportStatus(id, "pending");
  const handleArchiveReport = (id: string) =>
    handleUpdateReportStatus(id, "dismissed");

  const handleDeleteReport = async (id: string) => {
    if (!adminSupabase) return;
    try {
      const { error } = await adminSupabase
        .from("reports")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Denúncia deletada permanentemente!");
      setIsDetailsOpen(false);
      fetchReports();
      fetchStats();
    } catch (e: any) {
      toast.error("Erro ao deletar denúncia: " + e.message);
    }
  };

  const handleGlobalUserSearch = async (query: string) => {
    setUserSearchQuery(query);
    if (!adminSupabase || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await adminSupabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (e) {
      console.error("Search error:", e);
    }
  };

  const handleIssueBan = async (
    userId: string,
    banData: { reason: string; ban_type: string; duration_days?: number },
  ) => {
    if (!adminSupabase) return;
    try {
      const { error } = await adminSupabase.from("user_bans").insert({
        user_id: userId,
        banned_by: user?.id || "",
        reason: banData.reason,
        ban_type: banData.ban_type,
        duration_days: banData.duration_days,
        is_active: true,
      });

      if (error) throw error;
      toast.success("Usuário banido com sucesso!");
      fetchBans();
    } catch (e: any) {
      toast.error("Erro ao banir usuário: " + e.message);
      throw e;
    }
  };

  const handleRevokeBan = async (id: string) => {
    if (!adminSupabase) return;
    if (!confirm("Tem certeza que deseja revogar este banimento?")) return;
    try {
      const { error } = await adminSupabase
        .from("user_bans")
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast.success("Banimento revogado!");
      fetchBans();
    } catch (e) {
      toast.error("Erro ao revogar banimento");
    }
  };

  const handleDeleteBan = async (id: string) => {
    if (!adminSupabase) return;
    if (
      !confirm(
        "Tem certeza que deseja DELETAR permanentemente este registro de banimento? Esta ação não pode ser desfeita.",
      )
    )
      return;
    try {
      const { error } = await adminSupabase
        .from("user_bans")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Registro de banimento deletado!");
      handleCloseBanDetails();
      fetchBans();
    } catch (e: any) {
      toast.error("Erro ao deletar banimento: " + e.message);
    }
  };

  const handleSendFeedback = async (userId: string, message: string) => {
    if (!adminSupabase) return;
    try {
      const { error } = await adminSupabase.from("notifications").insert({
        user_id: userId,
        title: "Atualização da Denúncia",
        message: message,
        type: "system",
        read: false,
      });

      if (error) throw error;
      toast.success("Feedback enviado com sucesso!");
    } catch (e: any) {
      toast.error("Erro ao enviar feedback: " + e.message);
      throw e;
    }
  };

  const openReportDetails = (r: Report) => {
    setSelectedReport(r);
    setIsDetailsOpen(true);
  };

  const handleBanClick = async (ban: Ban) => {
    setSelectedBanDetail(ban);
    setShowBanDetailsModal(true);

    // Initial state for extra info
    setBanAdminInfo(null);

    // Fetch admin info who created the ban
    if (ban.banned_by) {
      setIsLoadingAdmin(true);
      try {
        const response = await fetch(
          `/api/gestao-confi/bans?adminId=${ban.banned_by}`,
        );
        if (response.ok) {
          const data = await response.json();
          setBanAdminInfo(data.admin);
        }
      } catch (error) {
        console.error("Erro ao buscar informações do admin:", error);
      } finally {
        setIsLoadingAdmin(false);
      }
    }

    // Fetch related report if exists
    if (ban.related_report_id && adminSupabase) {
      try {
        const { data: reportData, error: reportError } = await adminSupabase
          .from("reports")
          .select("*")
          .eq("id", ban.related_report_id)
          .single();

        if (!reportError && reportData) {
          setSelectedBanDetail((prev) =>
            prev ? { ...prev, related_report: reportData } : null,
          );
        }
      } catch (error) {
        console.error("Erro ao buscar denúncia relacionada:", error);
      }
    }
  };

  const handleCloseBanDetails = () => {
    setShowBanDetailsModal(false);
    setSelectedBanDetail(null);
    setBanAdminInfo(null);
  };

  // --- Render Helpers ---

  const getPriorityBadge = (priority: string) => {
    const colors: any = {
      urgent: "destructive",
      high: "orange", // custom class needed usually, defaulting to destructive for now
      medium: "secondary",
      low: "outline",
    };
    return <Badge variant={colors[priority] || "outline"}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const labels: any = {
      pending: "Pendente",
      reviewing: "Em Análise",
      resolved: "Resolvida",
      dismissed: "Arquivada",
    };

    let className = "bg-gray-100 text-gray-800";
    if (status === "pending")
      className = "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (status === "reviewing")
      className = "bg-blue-100 text-blue-800 border-blue-200";
    if (status === "resolved")
      className = "bg-green-100 text-green-800 border-green-200";
    if (status === "dismissed")
      className = "bg-slate-100 text-slate-500 border-slate-200";

    return (
      <Badge variant="outline" className={`font-medium ${className}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  // --- Columns ---

  const reportColumns = [
    {
      header: "Tipo/Prioridade",
      cell: (r: Report) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium flex items-center gap-1">
            {r.type === "user" ? <UserIcon size={14} /> : <Flag size={14} />}{" "}
            {r.type}
          </span>
          {getPriorityBadge(r.priority)}
        </div>
      ),
    },
    {
      header: "Descrição",
      accessorKey: "description" as keyof Report,
      cell: (r: Report) => (
        <span
          className="text-sm text-muted-foreground truncate max-w-[200px] block"
          title={r.description}
        >
          {r.description}
        </span>
      ),
    },
    {
      header: "Denunciado",
      cell: (r: Report) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 border">
            <AvatarImage src={r.reported_user?.avatar_url || ""} />
            <AvatarFallback className="text-[10px] bg-slate-100">
              {r.reported_user?.full_name?.substring(0, 2).toUpperCase() ||
                "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm truncate">
            <span className="font-medium truncate max-w-[120px]">
              {r.reported_user?.full_name || "N/A"}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {r.reported_user?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Report,
      cell: (r: Report) => getStatusBadge(r.status),
    },
    {
      header: "Data",
      cell: (r: Report) => format(new Date(r.created_at), "dd/MM HH:mm"),
    },
    {
      header: "Ações",
      cell: (r: Report) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(r.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openReportDetails(r)}>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" /> Ver Detalhes
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {r.status === "pending" && (
              <>
                <DropdownMenuItem
                  onClick={() => handleUpdateReportStatus(r.id, "resolved")}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Resolver
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateReportStatus(r.id, "dismissed")}
                >
                  <EyeOff className="mr-2 h-4 w-4 text-gray-500" />
                  Ignorar
                </DropdownMenuItem>
              </>
            )}
            {(r.status === "resolved" || r.status === "dismissed") && (
              <DropdownMenuItem
                onClick={() => {
                  if (
                    confirm(
                      "Tem certeza que deseja deletar permanentemente esta denúncia?",
                    )
                  ) {
                    handleDeleteReport(r.id);
                  }
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar Permanentemente
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const banColumns = [
    {
      header: "Usuário",
      cell: (b: Ban) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 border">
            <AvatarImage src={b.profiles?.avatar_url || ""} />
            <AvatarFallback className="text-[10px] bg-slate-100">
              {b.profiles?.full_name?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm truncate">
            <p className="font-medium truncate max-w-[120px]">
              {b.profiles?.full_name}
            </p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {b.profiles?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Motivo",
      accessorKey: "reason" as keyof Ban,
      cell: (b: Ban) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {b.reason}
        </span>
      ),
    },
    {
      header: "Tipo",
      accessorKey: "ban_type" as keyof Ban,
      cell: (b: Ban) => (
        <Badge
          variant={b.ban_type === "permanent" ? "destructive" : "secondary"}
        >
          {b.ban_type}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (b: Ban) =>
        b.is_active ? (
          <Badge className="bg-green-500">Ativo</Badge>
        ) : (
          <Badge variant="outline">Inativo</Badge>
        ),
    },
    {
      header: "Ações",
      cell: (b: Ban) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleBanClick(b)}>
              <div className="flex items-center text-primary">
                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(b.id)}
            >
              Copiar ID
            </DropdownMenuItem>
            {!b.is_active && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteBan(b.id)}
                  className="text-red-700 font-medium"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar Permanentemente
                </DropdownMenuItem>
              </>
            )}
            {b.is_active && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleRevokeBan(b.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Revogar Banimento
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // --- Mobile Cards ---

  const renderReportCard = (r: Report) => (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-center">
          {getPriorityBadge(r.priority)}
          <span className="font-bold text-sm capitalize">{r.type}</span>
        </div>
        {getStatusBadge(r.status)}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {r.description}
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <UserIcon size={12} />
        <span>Denunciado: {r.reported_user?.full_name || "N/A"}</span>
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => openReportDetails(r)}
        >
          Ver Detalhes
        </Button>
        {r.status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUnderReview(r.id)}
          >
            Analisar
          </Button>
        )}
        {(r.status === "pending" || r.status === "reviewing") && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateReportStatus(r.id, "dismissed")}
            >
              Ignorar
            </Button>
            <Button
              size="sm"
              onClick={() => handleUpdateReportStatus(r.id, "resolved")}
              className="bg-green-600 hover:bg-green-700"
            >
              Resolver
            </Button>
          </>
        )}
        {(r.status === "resolved" || r.status === "dismissed") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRevertToPending(r.id)}
          >
            Reverter
          </Button>
        )}
      </div>
    </div>
  );

  const renderBanCard = (b: Ban) => (
    <div className="bg-card border rounded-lg p-4 space-y-2">
      <div className="flex justify-between">
        <span className="font-bold">{b.profiles?.full_name}</span>
        {b.is_active ? (
          <Badge className="bg-green-500">Ativo</Badge>
        ) : (
          <Badge variant="outline">Inativo</Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{b.profiles?.email}</p>
      <Badge variant={b.ban_type === "permanent" ? "destructive" : "secondary"}>
        {b.ban_type}
      </Badge>
      <p className="text-sm bg-muted p-2 rounded text-muted-foreground">
        {b.reason}
      </p>
      {b.is_active && (
        <div className="pt-2 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRevokeBan(b.id)}
          >
            Revogar
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <AdminPageHeader
        title="Moderação"
        description="Gestão de denúncias e segurança."
      >
        <div className="flex gap-2">
          {!adminSupabase && (
            <div className="flex items-center gap-2 max-w-xs">
              <Input
                type="password"
                placeholder="Service Key..."
                className="h-8 text-xs font-mono"
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
              />
            </div>
          )}
          {adminSupabase && (
            <Button
              size="sm"
              variant="outline"
              onClick={createTestReports}
              className="hidden sm:flex"
            >
              <Flag className="w-3 h-3 mr-1" /> Teste
            </Button>
          )}
        </div>
      </AdminPageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">
            Denúncias
            {reportStats && reportStats.pending + reportStats.reviewing > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]"
              >
                {reportStats.pending + reportStats.reviewing}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bans">Banimentos</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {!adminSupabase ? (
            <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-4">
                <Key className="h-10 w-10 text-yellow-600" />
                <div>
                  <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-500">
                    Credenciais Necessárias
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-600 max-w-md mx-auto">
                    Para acessar os dados sensíveis de moderação, insira a{" "}
                    <strong>Service Role Key</strong> na barra superior.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <TabsContent value="reports">
                <div className="mb-4 space-y-4">
                  {/* Stats */}
                  <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
                    <div className="border rounded px-4 py-2 min-w-[100px] text-center">
                      <div className="text-2xl font-bold">
                        {reportStats?.total || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="border rounded px-4 py-2 min-w-[100px] text-center bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-700">
                        {reportStats?.pending || 0}
                      </div>
                      <div className="text-xs text-yellow-700">Pendentes</div>
                    </div>
                  </div>

                  {/* Sub-tabs for Reports */}
                  <Tabs
                    value={reportSubTab}
                    onValueChange={setReportSubTab}
                    className="w-full"
                  >
                    <TabsList className="bg-muted/50 p-1 mb-4 h-9">
                      <TabsTrigger value="pending" className="text-xs h-7">
                        Pendentes
                        {reportStats && reportStats.pending > 0 && (
                          <span className="ml-1 opacity-60">
                            ({reportStats.pending})
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="reviewing" className="text-xs h-7">
                        Em Análise
                        {reportStats && reportStats.reviewing > 0 && (
                          <span className="ml-1 opacity-60">
                            ({reportStats.reviewing})
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="archived" className="text-xs h-7">
                        Arquivadas
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <ResponsiveTable
                  data={reports.filter((r) => {
                    if (reportSubTab === "pending")
                      return r.status === "pending";
                    if (reportSubTab === "reviewing")
                      return r.status === "reviewing";
                    if (reportSubTab === "archived")
                      return (
                        r.status === "resolved" || r.status === "dismissed"
                      );
                    return true;
                  })}
                  columns={reportColumns}
                  renderMobileCard={renderReportCard}
                  onRowClick={openReportDetails}
                  keyExtractor={(r) => r.id}
                  isLoading={loading}
                  emptyMessage={`Nenhuma denúncia ${reportSubTab === "archived" ? "arquivada" : "nesta categoria"}.`}
                />
              </TabsContent>

              <TabsContent value="bans">
                <div className="mb-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuários para banir/gerenciar..."
                      className="pl-10"
                      value={userSearchQuery}
                      onChange={(e) => handleGlobalUserSearch(e.target.value)}
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <Card className="border-dashed">
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-sm font-medium">
                          Resultados da Busca
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-0 px-4 pb-4">
                        <div className="space-y-2">
                          {searchResults.map((u) => (
                            <div
                              key={u.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-transparent hover:border-gray-200 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={u.avatar_url || ""} />
                                  <AvatarFallback>
                                    {u.full_name
                                      ?.substring(0, 2)
                                      .toUpperCase() || "??"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {u.full_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedUserForBan(u);
                                  setIsBanModalOpen(true);
                                }}
                              >
                                <BanIcon className="h-4 w-4 mr-2" /> Banir
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <ResponsiveTable
                  data={bans}
                  columns={banColumns}
                  renderMobileCard={renderBanCard}
                  onRowClick={(b: Ban) => handleBanClick(b)}
                  keyExtractor={(b) => b.id}
                  isLoading={loading}
                  emptyMessage="Nenhum banimento registrado."
                />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
      <ReportDetailsModal
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        report={selectedReport}
        onResolve={(id) => {
          handleUpdateReportStatus(id, "resolved");
          setReportSubTab("archived");
          setIsDetailsOpen(false);
        }}
        onDismiss={(id) => {
          handleUpdateReportStatus(id, "dismissed");
          setReportSubTab("archived");
          setIsDetailsOpen(false);
        }}
        onUnderReview={(id) => {
          handleUnderReview(id);
          setReportSubTab("reviewing");
          setIsDetailsOpen(false);
        }}
        onRevert={(id) => {
          handleRevertToPending(id);
          setReportSubTab("pending");
          setIsDetailsOpen(false);
        }}
        onBan={(userId) => {
          // Future implementation: Open Ban Modal pre-filled
          toast.info("Funcionalidade de banimento direto em breve.");
        }}
        onDelete={handleDeleteReport}
        onSendFeedback={handleSendFeedback}
      />
      <BanUserModal
        isOpen={isBanModalOpen}
        onOpenChange={setIsBanModalOpen}
        user={selectedUserForBan}
        onBan={handleIssueBan}
      />

      {/* Modal de Detalhes do Banimento */}
      <ResponsiveModal
        isOpen={showBanDetailsModal}
        onOpenChange={setShowBanDetailsModal}
        title="Detalhes do Banimento"
        description="Informações completas sobre a punição aplicada ao usuário."
      >
        {selectedBanDetail && (
          <ScrollArea className="max-h-[80vh] pr-4">
            <div className="space-y-6 py-4">
              {/* Informações do Usuário */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage
                    src={selectedBanDetail.profiles?.avatar_url || ""}
                  />
                  <AvatarFallback className="text-xl">
                    {selectedBanDetail.profiles?.full_name
                      ?.substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate">
                    {selectedBanDetail.profiles?.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedBanDetail.profiles?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {selectedBanDetail.profiles?.user_type || "Usuário"}
                    </Badge>
                    <Badge
                      className={
                        selectedBanDetail.is_active
                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                          : "bg-green-100 text-green-700 hover:bg-green-100"
                      }
                    >
                      {selectedBanDetail.is_active ? "Ativo" : "Revogado"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status e Cronograma */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Tipo de Punição
                  </div>
                  <p className="text-sm font-semibold capitalize">
                    {selectedBanDetail.ban_type === "permanent"
                      ? "Permanente"
                      : `Temporário (${selectedBanDetail.duration_days || 0} dias)`}
                  </p>
                </div>
                <div className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Data do Banimento
                  </div>
                  <p className="text-sm font-semibold">
                    {format(
                      new Date(selectedBanDetail.created_at),
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR },
                    )}
                  </p>
                </div>
              </div>

              {/* Motivo do Banimento */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
                  <Info className="h-4 w-4" />
                  Motivo do Banimento
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                  <p className="text-sm leading-relaxed">
                    {selectedBanDetail.reason}
                  </p>
                </div>
              </div>

              {/* Notas Administrativas */}
              {selectedBanDetail.admin_notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
                    <FileText className="h-4 w-4" />
                    Notas Administrativas
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl">
                    <p className="text-sm italic text-gray-700 dark:text-gray-300">
                      "{selectedBanDetail.admin_notes}"
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Linha do Tempo */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Linha do Tempo
                </h4>
                <div className="space-y-4 ml-2">
                  {/* Eventos da Denúncia (se houver) */}
                  {selectedBanDetail.related_report && (
                    <>
                      <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-800 space-y-1">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-orange-500 border-2 border-white dark:border-gray-900" />
                        <p className="text-xs font-bold">Denúncia Recebida</p>
                        <p className="text-[10px] font-medium text-orange-600 dark:text-orange-400">
                          Motivo: {selectedBanDetail.related_report.reason}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(
                            new Date(
                              selectedBanDetail.related_report.created_at,
                            ),
                            "dd/MM/yyyy 'às' HH:mm",
                          )}
                        </p>
                      </div>

                      {selectedBanDetail.related_report.status !==
                        "pending" && (
                        <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-800 space-y-1">
                          <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-400 border-2 border-white dark:border-gray-900" />
                          <p className="text-xs font-bold">Início da Análise</p>
                          <p className="text-[10px] text-muted-foreground">
                            A denúncia começou a ser analisada pela moderação.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-800 space-y-1">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-red-500 border-2 border-white dark:border-gray-900" />
                    <p className="text-xs font-bold">Banimento Aplicado</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(
                        new Date(selectedBanDetail.created_at),
                        "dd/MM/yyyy 'às' HH:mm",
                      )}
                    </p>
                  </div>

                  {selectedBanDetail.expires_at && (
                    <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-800 space-y-1">
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" />
                      <p className="text-xs font-bold">Expiração Prevista</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(
                          new Date(selectedBanDetail.expires_at),
                          "dd/MM/yyyy 'às' HH:mm",
                        )}
                      </p>
                    </div>
                  )}

                  {!selectedBanDetail.is_active &&
                    selectedBanDetail.revoked_at && (
                      <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-800 space-y-1">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                        <p className="text-xs font-bold">Banimento Revogado</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(
                            new Date(selectedBanDetail.revoked_at),
                            "dd/MM/yyyy 'às' HH:mm",
                          )}
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Informações do Administrador */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
                    <UserCheck className="h-4 w-4" />
                    Responsável pela Ação
                  </h4>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={banAdminInfo?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Shield className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {isLoadingAdmin ? (
                      <div className="space-y-2">
                        <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
                        <div className="h-2 w-24 bg-gray-100 animate-pulse rounded" />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-bold">
                          {banAdminInfo?.full_name ||
                            "Administrador do Sistema"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {banAdminInfo?.email || "Email não disponível"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedBanDetail.id);
                    toast.success("ID do banimento copiado!");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar ID
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      `/perfil/${selectedBanDetail.user_id}`,
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Perfil
                </Button>

                {selectedBanDetail.is_active && (
                  <Button
                    variant="destructive"
                    className="col-span-2 bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      handleRevokeBan(selectedBanDetail.id);
                      handleCloseBanDetails();
                    }}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Desbanir Usuário
                  </Button>
                )}

                {!selectedBanDetail.is_active && (
                  <Button
                    variant="destructive"
                    className="col-span-2 bg-red-700 hover:bg-red-800"
                    onClick={() => handleDeleteBan(selectedBanDetail.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar Registro Permanentemente
                  </Button>
                )}

                <Button
                  variant="secondary"
                  className="col-span-2"
                  onClick={handleCloseBanDetails}
                >
                  Fechar Detalhes
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </ResponsiveModal>
    </div>
  );
}
