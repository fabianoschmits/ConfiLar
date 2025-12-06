"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SimpleTable } from "@/components/admin/shared/SimpleTable";
import { SearchBar } from "@/components/admin/shared/SearchBar";
import { PageHeader } from "@/components/admin/shared/PageHeader";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Post {
  id: string;
  title: string | null;
  content: string | null;
  user_id: string;
  professional_id: string | null;
  is_premium: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  stats?: {
    likes_count: number;
    comments_count: number;
    shares_count: number;
  };
}

interface PostStats {
  total: number;
  premium: number;
  featured: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export default function AdminPostsPage() {
  const { user } = useAuthContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState<PostStats>({
    total: 0,
    premium: 0,
    featured: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [statusFilter, typeFilter]);

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

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("feed_posts")
        .select(
          `
          id,
          title,
          content,
          user_id,
          professional_id,
          is_premium,
          is_featured,
          created_at,
          updated_at,
          profiles:user_id (
            full_name,
            email
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(100);

      // Aplicar filtros
      if (statusFilter === "premium") {
        query = query.eq("is_premium", true);
      } else if (statusFilter === "featured") {
        query = query.eq("is_featured", true);
      } else if (statusFilter === "normal") {
        query = query.eq("is_premium", false).eq("is_featured", false);
      }

      if (typeFilter === "with_title") {
        query = query.not("title", "is", null);
      } else if (typeFilter === "without_title") {
        query = query.is("title", null);
      }

      // Busca
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      // Buscar estatísticas de cada post
      const postsWithStats = await Promise.all(
        (data || []).map(async (post: any) => {
          const [likesResult, commentsResult, sharesResult] = await Promise.all(
            [
              supabase
                .from("post_likes")
                .select("*", { count: "exact", head: true })
                .eq("post_id", post.id),
              supabase
                .from("post_comments")
                .select("*", { count: "exact", head: true })
                .eq("post_id", post.id)
                .eq("is_deleted", false),
              supabase
                .from("post_shares")
                .select("*", { count: "exact", head: true })
                .eq("post_id", post.id),
            ],
          );

          // profiles pode vir como array ou objeto único, normalizar para objeto único
          const profile = Array.isArray(post.profiles)
            ? post.profiles[0]
            : post.profiles;

          return {
            ...post,
            profiles: profile || undefined,
            stats: {
              likes_count: likesResult.count || 0,
              comments_count: commentsResult.count || 0,
              shares_count: sharesResult.count || 0,
            },
          } as Post;
        }),
      );

      setPosts(postsWithStats);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      toast.error("Erro ao carregar posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (postId: string) => {
    setDeletingPostId(postId);
    setShowDeleteDialog(true);
  };

  const handleDeletePost = async () => {
    if (!deletingPostId || !user) return;

    setIsDeleting(true);
    try {
      // Verificar se é super admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_super_admin, is_owner")
        .eq("id", user.id)
        .single();

      const isSuperAdmin = profile?.is_super_admin || profile?.is_owner;

      if (!isSuperAdmin) {
        toast.error("Apenas super administradores podem deletar posts");
        return;
      }

      // Deletar via API de admin
      const response = await fetch(`/api/admin/posts/${deletingPostId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao deletar post");
      }

      toast.success("Post deletado com sucesso");
      setShowDeleteDialog(false);
      setDeletingPostId(null);
      fetchPosts();
      fetchStats();
    } catch (error: any) {
      console.error("Erro ao deletar post:", error);
      toast.error(error.message || "Erro ao deletar post");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Título/Conteúdo",
      render: (post: Post) => (
        <div className="max-w-md">
          <div className="font-medium truncate">
            {post.title || "Sem título"}
          </div>
          {post.content && (
            <div className="text-sm text-gray-500 truncate mt-1">
              {post.content.substring(0, 100)}...
            </div>
          )}
        </div>
      ),
    },
    {
      key: "author",
      label: "Autor",
      render: (post: Post) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            {post.profiles?.full_name || "Desconhecido"}
          </span>
        </div>
      ),
    },
    {
      key: "badges",
      label: "Status",
      render: (post: Post) => (
        <div className="flex gap-1 flex-wrap">
          {post.is_premium && (
            <Badge variant="default" className="bg-yellow-500">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          {post.is_featured && (
            <Badge variant="default" className="bg-blue-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              Destaque
            </Badge>
          )}
          {!post.is_premium && !post.is_featured && (
            <Badge variant="secondary">Normal</Badge>
          )}
        </div>
      ),
    },
    {
      key: "stats",
      label: "Engajamento",
      render: (post: Post) => (
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 text-red-500" />
            <span>{post.stats?.likes_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-blue-500" />
            <span>{post.stats?.comments_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="h-4 w-4 text-green-500" />
            <span>{post.stats?.shares_count || 0}</span>
          </div>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Data",
      render: (post: Post) => (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDistanceToNow(new Date(post.created_at), {
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
      render: (post: Post) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedPost(post);
              setShowDetailsModal(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(post.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Posts & Conteúdo"
        onRefresh={() => {
          fetchPosts();
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
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Buscar por título ou conteúdo..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={fetchPosts}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="featured">Em Destaque</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="with_title">Com título</SelectItem>
            <SelectItem value="without_title">Sem título</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <SimpleTable
        columns={columns}
        data={posts}
        loading={loading}
        emptyMessage="Nenhum post encontrado"
      />

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPost?.title || "Post sem título"}
            </DialogTitle>
            <DialogDescription>Detalhes do post</DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Autor</h4>
                <p className="text-sm text-gray-600">
                  {selectedPost.profiles?.full_name || "Desconhecido"} (
                  {selectedPost.profiles?.email || "N/A"})
                </p>
              </div>
              {selectedPost.content && (
                <div>
                  <h4 className="font-semibold mb-2">Conteúdo</h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Estatísticas</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {selectedPost.stats?.likes_count || 0}
                    </div>
                    <div className="text-xs text-gray-500">Curtidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {selectedPost.stats?.comments_count || 0}
                    </div>
                    <div className="text-xs text-gray-500">Comentários</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {selectedPost.stats?.shares_count || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      Compartilhamentos
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Informações</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>ID:</strong> {selectedPost.id}
                  </p>
                  <p>
                    <strong>Criado em:</strong>{" "}
                    {new Date(selectedPost.created_at).toLocaleString("pt-BR")}
                  </p>
                  <p>
                    <strong>Atualizado em:</strong>{" "}
                    {new Date(selectedPost.updated_at).toLocaleString("pt-BR")}
                  </p>
                  <p>
                    <strong>Premium:</strong>{" "}
                    {selectedPost.is_premium ? "Sim" : "Não"}
                  </p>
                  <p>
                    <strong>Destaque:</strong>{" "}
                    {selectedPost.is_featured ? "Sim" : "Não"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
