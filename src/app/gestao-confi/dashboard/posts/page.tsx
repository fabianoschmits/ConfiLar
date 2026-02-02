"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SimpleTable } from "@/components/gestao-confi/shared/SimpleTable";
import { SearchBar } from "@/components/gestao-confi/shared/SearchBar";
import { PageHeader } from "@/components/gestao-confi/shared/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
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
import { toast } from "sonner";
import {
  FileText,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  User,
  TrendingUp,
  Filter,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthContext } from "@/contexts/AuthContext";
import { createAdminSupabaseClient } from "@/lib/supabase";

type ContentType = "posts" | "classifieds" | "activities";

interface ContentItem {
  id: string;
  type: ContentType;
  title: string | null;
  content?: string | null;
  description?: string | null;
  user_id: string;
  user_name?: string | null;
  user_type?: string | null;
  professional_id?: string | null;
  is_premium?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
  category?: string;
  price_range?: string;
  ad_type?: string;
  activity_type?: string;
  metadata?: any;
  profiles?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  stats?: {
    likes_count: number;
    comments_count: number;
    shares_count: number;
    views?: number;
  };
}

interface ContentStats {
  total: number;
  premium: number;
  featured: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export default function AdminPostsPage() {
  const { user: authUser } = useAuthContext();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState<ContentType>("posts");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState<ContentStats>({
    total: 0,
    premium: 0,
    featured: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    fetchContent();
    if (contentType === "posts") {
      fetchStats();
    }
  }, [contentType, statusFilter]);

  const getActivityTitle = (
    activityType: string,
    userName: string,
    metadata: any,
  ) => {
    switch (activityType) {
      case "user_joined":
        return `${userName} entrou para o ConfiLar`;
      case "recommendation":
        return `${userName} recomendou ${metadata?.target_user_name || "alguém"}`;
      case "review":
        return `${userName} avaliou ${metadata?.target_user_name || "alguém"}`;
      case "agreement":
        return `${userName} fechou um acordo`;
      case "classified_posted":
        return `${userName} publicou um anúncio`;
      default:
        return `${userName} realizou uma atividade`;
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const [
        { count: total },
        { count: premium },
        { count: featured },
        { count: todayCount },
        { count: weekCount },
        { count: monthCount },
      ] = await Promise.all([
        supabase.from("feed_posts").select("*", { count: "exact", head: true }),
        supabase
          .from("feed_posts")
          .select("*", { count: "exact", head: true })
          .eq("is_premium", true),
        supabase
          .from("feed_posts")
          .select("*", { count: "exact", head: true })
          .eq("is_featured", true),
        supabase
          .from("feed_posts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
        supabase
          .from("feed_posts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("feed_posts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthAgo.toISOString()),
      ]);

      setStats({
        total: total || 0,
        premium: premium || 0,
        featured: featured || 0,
        today: todayCount || 0,
        thisWeek: weekCount || 0,
        thisMonth: monthCount || 0,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      let query: any;

      if (contentType === "posts") {
        query = supabase
          .from("feed_posts")
          .select(
            `
            id, title, content, user_id, professional_id, 
            is_premium, is_featured, created_at, updated_at,
            profiles:user_id (full_name, email, avatar_url)
          `,
          )
          .order("created_at", { ascending: false });

        if (statusFilter === "premium") query = query.eq("is_premium", true);
        else if (statusFilter === "featured")
          query = query.eq("is_featured", true);
        else if (statusFilter === "normal")
          query = query.eq("is_premium", false).eq("is_featured", false);

        if (searchQuery) {
          query = query.or(
            `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`,
          );
        }
      } else if (contentType === "classifieds") {
        query = supabase
          .from("classified_ads")
          .select(
            `
            id, title, description, user_id, user_name, user_type,
            category, ad_type, is_active, created_at, updated_at, price_range,
            profiles:user_id (full_name, email, avatar_url)
          `,
          )
          .order("created_at", { ascending: false });

        if (searchQuery) {
          query = query.or(
            `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
          );
        }
      } else {
        query = supabase
          .from("user_activity_log")
          .select(
            `
            id, user_id, activity_type, description, metadata, created_at,
            profiles:user_id (full_name, email, avatar_url)
          `,
          )
          .order("created_at", { ascending: false });

        if (searchQuery) {
          query = query.or(
            `description.ilike.%${searchQuery}%,activity_type.ilike.%${searchQuery}%`,
          );
        }
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      const itemsWithStats = await Promise.all(
        (data || []).map(async (item: any) => {
          const profile = Array.isArray(item.profiles)
            ? item.profiles[0]
            : item.profiles;

          let stats = { likes_count: 0, comments_count: 0, shares_count: 0 };

          if (contentType === "posts") {
            const [likes, comments, shares] = await Promise.all([
              supabase
                .from("post_likes")
                .select("*", { count: "exact", head: true })
                .eq("post_id", item.id),
              supabase
                .from("post_comments")
                .select("*", { count: "exact", head: true })
                .eq("post_id", item.id)
                .eq("is_deleted", false),
              supabase
                .from("post_shares")
                .select("*", { count: "exact", head: true })
                .eq("post_id", item.id),
            ]);
            stats = {
              likes_count: likes.count || 0,
              comments_count: comments.count || 0,
              shares_count: shares.count || 0,
            };
          }

          return {
            ...item,
            type: contentType,
            profiles: profile || undefined,
            stats,
          } as ContentItem;
        }),
      );

      setItems(itemsWithStats);
    } catch (error) {
      console.error(`Erro ao buscar ${contentType}:`, error);
      toast.error(`Erro ao carregar ${contentType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteItem = async () => {
    if (!deletingId || !authUser) return;
    if (contentType !== "posts") {
      toast.error(
        "Exclusão direta via gestão só disponível para posts por enquanto",
      );
      return;
    }

    setIsDeleting(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_super_admin, is_owner")
        .eq("id", authUser.id)
        .single();

      if (!profile?.is_super_admin && !profile?.is_owner) {
        toast.error("Apenas super administradores podem deletar conteúdo");
        return;
      }

      const response = await fetch(`/api/gestao-confi/posts/${deletingId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao deletar");

      toast.success("Item removido com sucesso");
      setShowDeleteDialog(false);
      setDeletingId(null);
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "content",
      label: "Conteúdo",
      render: (item: ContentItem) => {
        const title =
          item.type === "activities"
            ? getActivityTitle(
                item.activity_type || "",
                item.profiles?.full_name || "Usuário",
                item.metadata,
              )
            : item.title || "Sem título";
        const subtitle =
          item.type === "activities"
            ? item.description
            : item.content || item.description;

        return (
          <div className="max-w-md">
            <div className="font-medium truncate">{title}</div>
            {subtitle && (
              <div className="text-sm text-gray-500 truncate mt-1">
                {subtitle.substring(0, 80)}...
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "author",
      label: "Autor/Usuário",
      render: (item: ContentItem) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            {item.profiles?.full_name || item.user_name || "Desconhecido"}
          </span>
        </div>
      ),
    },
    {
      key: "type_badge",
      label: "Tipo",
      render: (item: ContentItem) => (
        <Badge variant="outline" className="capitalize">
          {item.type === "posts"
            ? "Post"
            : item.type === "classifieds"
              ? "Anúncio"
              : "Atividade"}
        </Badge>
      ),
    },
    {
      key: "badges",
      label: "Status",
      render: (item: ContentItem) => (
        <div className="flex gap-1 flex-wrap">
          {item.is_premium && (
            <Badge className="bg-yellow-500">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          {item.is_featured && (
            <Badge className="bg-blue-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              Destaque
            </Badge>
          )}
          {!item.is_premium && !item.is_featured && (
            <Badge variant="secondary">Normal</Badge>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Data",
      render: (item: ContentItem) => (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDistanceToNow(new Date(item.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (item: ContentItem) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedItem(item);
              setShowDetailsModal(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {item.type === "posts" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(item.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Conteúdo"
        onRefresh={() => {
          fetchContent();
          fetchStats();
        }}
        loading={loading}
      />

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Posts
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisMonth} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Premium</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premium}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.premium / stats.total) * 100 || 0).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Posts em Destaque
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featured}</div>
            <p className="text-xs text-muted-foreground">{stats.today} hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder={`Buscar em ${contentType === "posts" ? "postagens" : contentType === "classifieds" ? "classificados" : "atividades"}...`}
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={fetchContent}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={contentType}
            onValueChange={(v) => setContentType(v as ContentType)}
          >
            <SelectTrigger className="w-48 bg-muted/30">
              <SelectValue placeholder="Conteúdo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="posts">Postagens</SelectItem>
              <SelectItem value="classifieds">Classificados</SelectItem>
              <SelectItem value="activities">Atividades</SelectItem>
            </SelectContent>
          </Select>

          {contentType === "posts" && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="featured">Em Destaque</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Tabela */}
      <SimpleTable
        columns={columns}
        data={items}
        loading={loading}
        onRowClick={(item) => {
          setSelectedItem(item);
          setShowDetailsModal(true);
        }}
        emptyMessage={`Nenhum(a) ${contentType === "posts" ? "postagem" : contentType === "classifieds" ? "anúncio" : "atividade"} encontrado(a)`}
      />

      {/* Modal de Detalhes */}
      {/* Modal de Detalhes */}
      <ResponsiveModal
        isOpen={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        title={
          selectedItem?.type === "activities"
            ? getActivityTitle(
                selectedItem.activity_type || "",
                selectedItem.profiles?.full_name || "Usuário",
                selectedItem.metadata,
              )
            : selectedItem?.title || "Sem título"
        }
        description={`Detalhes do(a) ${selectedItem?.type === "posts" ? "postagem" : selectedItem?.type === "classifieds" ? "anúncio" : "atividade"}`}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-1">
                  Autor
                </h4>
                <p className="font-medium">
                  {selectedItem.profiles?.full_name ||
                    selectedItem.user_name ||
                    "Desconhecido"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedItem.profiles?.email || "E-mail não disponível"}
                </p>
              </div>
              <div className="text-right">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-1">
                  Data
                </h4>
                <p className="font-medium text-sm">
                  {new Date(selectedItem.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>

            {(selectedItem.content || selectedItem.description) && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                  {selectedItem.type === "classifieds"
                    ? "Descrição"
                    : "Conteúdo"}
                </h4>
                <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedItem.content || selectedItem.description}
                </div>
              </div>
            )}

            {selectedItem.type === "classifieds" && (
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Categoria
                  </h4>
                  <Badge variant="outline">{selectedItem.category}</Badge>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Valor / Preço
                  </h4>
                  <p className="text-sm font-semibold text-green-600">
                    {selectedItem.price_range || "Não informado"}
                  </p>
                </div>
                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Tipo de Anúncio
                  </h4>
                  <Badge className="capitalize">
                    {selectedItem.ad_type === "oferecer" ? "Oferta" : "Procura"}
                  </Badge>
                </div>
              </div>
            )}

            {selectedItem.type === "activities" && selectedItem.metadata && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                  Metadados da Atividade
                </h4>
                <pre className="bg-muted/30 p-3 rounded-lg text-[10px] overflow-x-auto">
                  {JSON.stringify(selectedItem.metadata, null, 2)}
                </pre>
              </div>
            )}

            {selectedItem.type === "posts" && selectedItem.stats && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-4 text-center">
                  Engagement
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center group">
                    <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-xl transition-all group-hover:scale-105">
                      <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
                      <div className="text-xl font-bold">
                        {selectedItem.stats.likes_count}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-1">
                      Curtidas
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl transition-all group-hover:scale-105">
                      <MessageCircle className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                      <div className="text-xl font-bold">
                        {selectedItem.stats.comments_count}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-1">
                      Comentários
                    </div>
                  </div>
                  <div className="text-center group">
                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-xl transition-all group-hover:scale-105">
                      <Share2 className="h-6 w-6 text-green-500 mx-auto mb-1" />
                      <div className="text-xl font-bold">
                        {selectedItem.stats.shares_count}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-1">
                      Shares
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t text-[10px] text-muted-foreground flex justify-between">
              <span>ID: {selectedItem.id}</span>
              {selectedItem.updated_at && (
                <span>
                  Atualizado em:{" "}
                  {new Date(selectedItem.updated_at).toLocaleString("pt-BR")}
                </span>
              )}
            </div>

            {selectedItem.type === "posts" && (
              <div className="flex justify-end pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDeleteClick(selectedItem.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Post
                </Button>
              </div>
            )}
          </div>
        )}
      </ResponsiveModal>

      {/* Dialog de Confirmação de Deleção */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este post? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deletando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
