"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Star,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  TrendingUp,
  X,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuthContext } from "@/contexts/AuthContext";
import { ResponsiveTable } from "@/components/gestao-confi/ResponsiveTable";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PostsChart } from "@/components/gestao-confi/analytics/PostsChart";

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
  };
}

export default function AdminPostsPage() {
  const { user: authUser } = useAuthContext();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState<ContentType>("posts");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({ total: 0, premium: 0, featured: 0 });

  useEffect(() => {
    fetchContent();
    if (contentType === "posts") fetchStats();
  }, [contentType, statusFilter]);

  const fetchStats = async () => {
    try {
      const [{ count: total }, { count: premium }, { count: featured }] =
        await Promise.all([
          supabase
            .from("feed_posts")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("feed_posts")
            .select("*", { count: "exact", head: true })
            .eq("is_premium", true),
          supabase
            .from("feed_posts")
            .select("*", { count: "exact", head: true })
            .eq("is_featured", true),
        ]);
      setStats({
        total: total || 0,
        premium: premium || 0,
        featured: featured || 0,
      });
    } catch (e) {}
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      let query: any;
      if (contentType === "posts") {
        query = supabase
          .from("feed_posts")
          .select(`*, profiles:user_id (full_name, email, avatar_url)`)
          .order("created_at", { ascending: false });
        if (statusFilter === "premium") query = query.eq("is_premium", true);
        else if (statusFilter === "featured")
          query = query.eq("is_featured", true);
      } else if (contentType === "classifieds") {
        query = supabase
          .from("classified_ads")
          .select(`*, profiles:user_id (full_name, email, avatar_url)`)
          .order("created_at", { ascending: false });
      } else {
        query = supabase
          .from("user_activity_log")
          .select(`*, profiles:user_id (full_name, email, avatar_url)`)
          .order("created_at", { ascending: false });
      }

      if (searchQuery) {
        const field =
          contentType === "posts"
            ? "content"
            : contentType === "classifieds"
              ? "description"
              : "description";
        query = query.ilike(field, `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setItems(data.map((d) => ({ ...d, type: contentType })) as ContentItem[]);
    } catch (error) {
      toast.error("Erro ao carregar conteúdo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("feed_posts")
        .delete()
        .eq("id", deletingId);
      if (error) throw error;
      toast.success("Removido.");
      setShowDeleteDialog(false);
      fetchContent();
    } catch (e) {
      toast.error("Erro ao remover");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Conteúdo",
      cell: (item: ContentItem) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.profiles?.avatar_url} />
            <AvatarFallback>
              <FileText className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col max-w-[200px]">
            <span className="font-bold text-xs truncate">
              {item.title || item.profiles?.full_name}
            </span>
            <span className="text-[10px] opacity-60 truncate">
              {item.content || item.description}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Data",
      cell: (item: ContentItem) => (
        <span className="text-[10px] opacity-60">
          {formatDistanceToNow(new Date(item.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </span>
      ),
    },
    {
      header: "Ações",
      cell: (item: ContentItem) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted/50 rounded-full"
            onClick={() => setSelectedItem(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {item.type === "posts" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 rounded-full"
              onClick={() => {
                setDeletingId(item.id);
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const renderMobileCard = (item: ContentItem) => (
    <div className="bg-white dark:bg-gray-900 border border-border/40 rounded-2xl p-3 shadow-sm space-y-3 group transition-all border-b-2 border-b-muted">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-border/50">
            <AvatarImage src={item.profiles?.avatar_url} />
            <AvatarFallback className="text-[10px]">
              {item.profiles?.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-xs font-black leading-tight truncate max-w-[120px]">
              {item.profiles?.full_name || "Anônimo"}
            </h4>
            <p className="text-[9px] text-muted-foreground opacity-60">
              {formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[8px] uppercase font-black tracking-tighter h-4 px-1.5 border-0 bg-muted/50"
        >
          {item.type}
        </Badge>
      </div>
      <p className="text-[11px] line-clamp-2 font-medium opacity-80 leading-snug">
        {item.content || item.description || "Informativo rápido..."}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 h-7 rounded-lg font-black text-[9px] uppercase tracking-wide gap-1.5"
          onClick={() => setSelectedItem(item)}
        >
          <Eye className="h-3 w-3" /> Detalhes
        </Button>
        {item.type === "posts" && (
          <Button
            variant="ghost"
            className="h-7 w-7 p-0 text-red-500 bg-red-50/50 rounded-lg"
            onClick={() => {
              setDeletingId(item.id);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <AdminPageHeader
        title="Gestão de Conteúdo"
        description="Controle total sobre o que circula na rede ConfiLar."
        icon={FileText}
      />

      {/* Hero Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-900 border border-border/50 p-3 sm:p-6 rounded-2xl sm:rounded-[32px] shadow-sm flex items-center gap-2 sm:gap-4">
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-2xl font-black">{stats.total}</div>
            <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">
              Total Posts
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-border/50 p-3 sm:p-6 rounded-2xl sm:rounded-[32px] shadow-sm flex items-center gap-2 sm:gap-4">
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-2xl font-black">
              {stats.premium}
            </div>
            <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">
              Premium
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-border/50 p-3 sm:p-6 rounded-2xl sm:rounded-[32px] shadow-sm flex items-center gap-2 sm:gap-4 col-span-2 sm:col-span-1">
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-2xl font-black">
              {stats.featured}
            </div>
            <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">
              Destaques
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm p-4 rounded-[28px] border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Buscar..."
            className="pl-10 h-10 bg-white/50 dark:bg-black/20 border-border/40 rounded-2xl text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={contentType}
            onValueChange={(v) => setContentType(v as ContentType)}
          >
            <SelectTrigger className="w-full sm:w-[150px] h-10 rounded-2xl">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="posts">Posts</SelectItem>
              <SelectItem value="classifieds">Anúncios</SelectItem>
              <SelectItem value="activities">Logs</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-2xl border border-border/30 bg-white"
            onClick={fetchContent}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <ResponsiveTable
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderMobileCard={renderMobileCard}
        isLoading={loading}
        emptyMessage="Nenhum conteúdo encontrado."
      />

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl w-[95vw] rounded-[32px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center justify-between">
              <span>Detalhes do Conteúdo</span>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => setSelectedItem(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between bg-muted/20 p-5 rounded-[24px]">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                    <AvatarImage src={selectedItem.profiles?.avatar_url} />
                    <AvatarFallback>
                      {selectedItem.profiles?.full_name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-black text-base">
                      {selectedItem.profiles?.full_name || "Usuário"}
                    </div>
                    <div className="text-[10px] font-medium opacity-60 uppercase tracking-widest">
                      {selectedItem.profiles?.email}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase opacity-40">
                    Postado em
                  </div>
                  <div className="text-xs font-bold">
                    {new Date(selectedItem.created_at).toLocaleDateString(
                      "pt-BR",
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  Mensagem/Descrição
                </h5>
                <div className="bg-white border rounded-[24px] p-6 text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm">
                  {selectedItem.content ||
                    selectedItem.description ||
                    "Sem descrição disponível."}
                </div>
              </div>

              {selectedItem.type === "posts" && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-rose-50/50 p-4 rounded-2xl text-center">
                    <Heart className="h-5 w-5 text-rose-500 mx-auto mb-1" />
                    <span className="text-sm font-black">12</span>
                  </div>
                  <div className="bg-sky-50/50 p-4 rounded-2xl text-center">
                    <MessageCircle className="h-5 w-5 text-sky-500 mx-auto mb-1" />
                    <span className="text-sm font-black">5</span>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-2xl text-center">
                    <Share2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <span className="text-sm font-black">2</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[32px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase text-xl">
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-sm">
              Esta ação removerá permanentemente este conteúdo da plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-2xl border-0 h-12 font-bold uppercase">
              Manter
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              disabled={isDeleting}
              className="rounded-2xl h-12 bg-red-600 hover:bg-red-500 font-black uppercase tracking-wider"
            >
              {isDeleting ? "Removendo..." : "Sim, Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
