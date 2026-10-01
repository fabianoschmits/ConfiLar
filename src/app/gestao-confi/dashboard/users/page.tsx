"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ResponsiveTable } from "@/components/gestao-confi/ResponsiveTable";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  FileText,
  UserCog,
  Ban,
  Users,
  ShieldCheck,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BanUserModal } from "@/components/gestao-confi/BanUserModal";
import { type Profile } from "@/components/gestao-confi/ReportDetailsModal";
import { useAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";
import { UserHistoryModal } from "@/components/gestao-confi/dashboard/UserHistoryModal";
import {
  EstadoCombobox,
  CidadeCombobox,
} from "@/components/ui/LocationComboboxes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  is_verified: boolean;
  created_at: string;
  avatar_url?: string;
  location_city?: string;
  location_state?: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [selectedUserForBan, setSelectedUserForBan] = useState<Profile | null>(
    null,
  );
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedUserForHistory, setSelectedUserForHistory] =
    useState<Profile | null>(null);

  // Estados de Filtro
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "client" | "professional"
  >("all");
  const [showFilters, setShowFilters] = useState(false);

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
    fetchUsers(1, itemsPerPage);
  }, [filterState, filterCity, filterType, itemsPerPage]);

  const fetchUsers = async (page = currentPage, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("profiles")
        .select(
          "id, full_name, email, user_type, is_verified, created_at, avatar_url, location_city, location_state",
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchQuery) {
        query = query.or(
          `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`,
        );
      }

      if (filterState) {
        query = query.eq("location_state", filterState);
      }

      if (filterCity) {
        query = query.eq("location_city", filterCity);
      }

      if (filterType !== "all") {
        query = query.eq("user_type", filterType);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchUsers(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterState("");
    setFilterCity("");
    setFilterType("all");
    // fetchUsers será chamado pelo useEffect devido às mudanças de estado
  };

  const handleBan = async (
    userId: string,
    data: { reason: string; ban_type: string; duration_days?: number },
  ) => {
    try {
      const { error } = await supabase.rpc("ban_user", {
        target_user_id: userId,
        ban_reason: data.reason,
        ban_type: data.ban_type,
        duration_days: data.duration_days || null,
        admin_notes: `Banido via Gestão de Usuários por ${user?.email || "Admin"}`,
      });

      if (error) throw error;

      toast.success("Usuário banido com sucesso!");
      fetchUsers();
    } catch (error: any) {
      console.error("Erro ao banir usuário:", error);
      toast.error(error.message || "Erro ao banir usuário");
      throw error;
    }
  };

  const columns = [
    {
      header: "Usuário",
      cell: (user: User) => (
        <Link
          href={`/perfil/${user.id}`}
          className="flex items-center gap-3 py-1 group/user transition-all"
        >
          <div className="relative">
            <Avatar className="h-9 w-9 border border-border/50 group-hover/user:scale-105 transition-transform">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-[var(--cl-mist)] text-blue-700 text-[10px] font-bold">
                {user.full_name?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            {user.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-[var(--cl-surface)] rounded-full p-0.5 shadow-sm border border-border/50">
                <CheckCircle2 className="w-3 h-3 text-[var(--cl-teal)] fill-blue-50" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm truncate leading-none mb-1 group-hover/user:text-[var(--cl-teal)] transition-colors">
              {user.full_name || "Sem nome"}
            </span>
            <span className="text-[11px] text-muted-foreground truncate opacity-70">
              {user.email}
            </span>
          </div>
        </Link>
      ),
    },
    {
      header: "Localização",
      cell: (user: User) => (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <MapPin className="w-3 h-3 opacity-40" />
          <span className="truncate max-w-[120px]">
            {user.location_city && user.location_state
              ? `${user.location_city}, ${user.location_state}`
              : "Não informada"}
          </span>
        </div>
      ),
    },
    {
      header: "Tipo",
      cell: (user: User) => (
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] uppercase font-black px-2 py-0.5 h-5 rounded-md border-0",
            user.user_type === "professional"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
              : "bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400",
          )}
        >
          {user.user_type === "professional" ? "Pro" : "Cliente"}
        </Badge>
      ),
    },
    {
      header: "Cadastro",
      cell: (user: User) => (
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1 text-[11px] font-medium">
            <Clock className="w-3 h-3 opacity-40 text-muted-foreground" />
            {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        </div>
      ),
    },
    {
      header: "Ações",
      cell: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-muted/50 rounded-xl"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-2xl border-border/50 shadow-xl"
          >
            <DropdownMenuLabel className="text-xs uppercase tracking-widest opacity-50 px-3 py-2">
              Gerenciar
            </DropdownMenuLabel>
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
              <Link href={`/perfil/${user.id}`}>
                <UserCog className="mr-2 h-4 w-4 opacity-70" /> Ver Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl cursor-pointer"
              onClick={() => {
                setSelectedUserForHistory({
                  id: user.id,
                  full_name: user.full_name,
                  email: user.email,
                  avatar_url: user.avatar_url,
                });
                setIsHistoryModalOpen(true);
              }}
            >
              <FileText className="mr-2 h-4 w-4 opacity-70" /> Ver Histórico
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSelectedUserForBan({
                  id: user.id,
                  full_name: user.full_name,
                  email: user.email,
                  avatar_url: user.avatar_url,
                });
                setIsBanModalOpen(true);
              }}
              className="text-red-600 rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-700"
            >
              <Ban className="mr-2 h-4 w-4" /> Suspender Conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "text-right",
    },
  ];

  const renderMobileCard = (user: User) => (
    <div className="bg-[var(--cl-surface)]/40 border border-border/40 rounded-2xl sm:rounded-[24px] p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between">
        <Link
          href={`/perfil/${user.id}`}
          className="flex items-center gap-3 group/user"
        >
          <div className="relative">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border border-border/50 shadow-sm group-hover/user:scale-105 transition-transform">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-[var(--cl-mist)] text-blue-700 text-[10px] sm:text-xs font-bold font-mono">
                {user.full_name?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            {user.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-[var(--cl-surface)] rounded-full p-0.5 shadow-sm border border-border/50">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 h-4 text-[var(--cl-teal)] fill-blue-50" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-xs sm:text-sm text-[var(--cl-ink)] leading-tight group-hover/user:text-[var(--cl-teal)] transition-colors truncate max-w-[140px] sm:max-w-none">
              {user.full_name || "Sem nome"}
            </h3>
            <p className="text-[9px] sm:text-[11px] text-muted-foreground font-medium opacity-60 truncate max-w-[120px] sm:max-w-[150px]">
              {user.email}
            </p>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/80 font-bold uppercase tracking-tight">
              <MapPin className="w-2.5 h-2.5 opacity-50" />
              {user.location_city && user.location_state
                ? `${user.location_city}/${user.location_state}`
                : "Sem local"}
            </div>
          </div>
        </Link>
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] uppercase font-black px-2 py-0.5 h-5 rounded-md border-0",
            user.user_type === "professional"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
              : "bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400",
          )}
        >
          {user.user_type === "professional" ? "Pro" : "Cliente"}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/40">
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
          <Clock className="w-2.5 h-2.5 sm:w-3 h-3 opacity-50" />
          {format(new Date(user.created_at), "dd MMM yyyy", { locale: ptBR })}
        </div>

        <div className="flex gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg sm:rounded-xl border-border/50 hover:bg-muted font-bold text-[9px] sm:text-[10px] uppercase tracking-wide"
          >
            <Link href={`/perfil/${user.id}`}>Perfil</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl border-border/50"
              >
                <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl w-40">
              <DropdownMenuItem
                className="text-[11px] font-bold uppercase"
                onClick={() => {
                  setSelectedUserForHistory({
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    avatar_url: user.avatar_url,
                  });
                  setIsHistoryModalOpen(true);
                }}
              >
                Ver Histórico
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUserForBan({
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    avatar_url: user.avatar_url,
                  });
                  setIsBanModalOpen(true);
                }}
                className="text-[11px] font-bold uppercase text-red-600"
              >
                Suspender
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-24 md:pb-8 animate-in fade-in duration-500">
      <AdminPageHeader
        title="Gestão de Usuários"
        description="Controle total sobre os membros da comunidade ConfiLar."
        icon={Users}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex rounded-xl border-border/50"
          >
            <Filter className="w-4 h-4 mr-2" /> Filtrar
          </Button>
        </div>
      </AdminPageHeader>

      <div className="space-y-4 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm p-4 sm:p-6 rounded-[28px] border border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Nome ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
              className="pl-10 h-11 bg-white/50 dark:bg-black/20 border-border/40 rounded-2xl text-sm focus-visible:ring-[var(--cl-teal)]/20"
            />
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-11 px-6 rounded-2xl border-border/40 font-bold transition-all",
                (filterState || filterCity || filterType !== "all") &&
                  "border-blue-500/50 bg-[var(--cl-mist)]/50 dark:bg-blue-900/10 text-[var(--cl-teal)]",
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {(filterState ||
                filterCity ||
                filterType !== "all" ||
                searchQuery) && (
                <Badge className="ml-2 bg-[var(--cl-cta)] h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                  !
                </Badge>
              )}
            </Button>
            {(filterState ||
              filterCity ||
              filterType !== "all" ||
              searchQuery) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-11 px-4 rounded-2xl text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all font-bold"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
            <Button
              onClick={() => {
                setCurrentPage(1);
                fetchUsers(1);
              }}
              disabled={loading}
              className="flex-grow sm:flex-grow-0 px-8 h-11 rounded-2xl bg-[var(--cl-cta)] hover:bg-blue-500 shadow-lg shadow-blue-500/20 font-bold transition-all active:scale-95"
            >
              Pesquisar
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-border/20 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">
                Estado
              </label>
              <EstadoCombobox
                value={filterState}
                onValueChange={(val) => {
                  setFilterState(val);
                  setFilterCity(""); // Reset cidade ao mudar estado
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">
                Cidade
              </label>
              <CidadeCombobox
                estadoSigla={filterState}
                value={filterCity}
                onValueChange={setFilterCity}
                disabled={!filterState}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">
                Tipo de Usuário
              </label>
              <Select
                value={filterType}
                onValueChange={(val: any) => setFilterType(val)}
              >
                <SelectTrigger className="h-11 rounded-2xl border-border/40 bg-white/50 dark:bg-black/20">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50 shadow-xl">
                  <SelectItem value="all" className="rounded-xl">
                    Todos os membros
                  </SelectItem>
                  <SelectItem value="client" className="rounded-xl">
                    Clientes
                  </SelectItem>
                  <SelectItem value="professional" className="rounded-xl">
                    Profissionais
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-3 flex justify-end pt-2">
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-red-600 transition-all"
              >
                Resetar todos os filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      <ResponsiveTable
        data={users}
        columns={columns}
        keyExtractor={(user) => user.id}
        renderMobileCard={renderMobileCard}
        isLoading={loading}
        emptyMessage="Nenhum usuário encontrado."
      />

      {/* Paginação */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-2">
          <div className="flex flex-col sm:flex-row items-center gap-4 order-2 sm:order-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Mostrando{" "}
              <span className="text-foreground">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>
              -
              <span className="text-foreground">
                {Math.min(currentPage * itemsPerPage, totalCount)}
              </span>{" "}
              de
              <span className="text-foreground"> {totalCount}</span> usuários
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/40">
                Exibir:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => {
                  setItemsPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px] rounded-lg border-border/40 bg-muted/20 text-[11px] font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                  {[10, 20, 30, 50, 100].map((num) => (
                    <SelectItem
                      key={num}
                      value={num.toString()}
                      className="text-[11px] font-bold rounded-lg"
                    >
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="h-10 px-4 rounded-xl border-border/50 font-bold text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>

            <div className="flex items-center justify-center h-10 px-4 rounded-xl bg-muted/30 border border-border/50 text-xs font-black min-w-[100px]">
              PÁGINA {currentPage} DE {Math.ceil(totalCount / itemsPerPage)}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= totalCount || loading}
              className="h-10 px-4 rounded-xl border-border/50 font-bold text-xs"
            >
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <UserHistoryModal
        isOpen={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        user={selectedUserForHistory}
      />

      <BanUserModal
        isOpen={isBanModalOpen}
        onOpenChange={setIsBanModalOpen}
        user={selectedUserForBan}
        onBan={handleBan}
      />
    </div>
  );
}
