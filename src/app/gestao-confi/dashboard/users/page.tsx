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
import { Search, MoreHorizontal, FileText, UserCog, Ban } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  is_verified: boolean;
  created_at: string;
  avatar_url?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select(
          "id, full_name, email, user_type, is_verified, created_at, avatar_url",
        )
        .order("created_at", { ascending: false })
        .limit(50); // Pagination could be added later

      if (searchQuery) {
        query = query.or(
          `full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Usuário",
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>
              {user.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {user.full_name || "Sem nome"}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Tipo",
      accessorKey: "user_type" as keyof User,
      cell: (user: User) => (
        <Badge
          variant={user.user_type === "professional" ? "default" : "secondary"}
        >
          {user.user_type === "professional" ? "Profissional" : "Cliente"}
        </Badge>
      ),
    },
    {
      header: "Cadastro",
      accessorKey: "created_at" as keyof User,
      cell: (user: User) =>
        format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR }),
    },
    {
      header: "Ações",
      cell: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/perfil/${user.id}`}>
                <UserCog className="mr-2 h-4 w-4" /> Ver Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" /> Ver Posts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Ban className="mr-2 h-4 w-4" /> Suspender
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "text-right",
    },
  ];

  const renderMobileCard = (user: User) => (
    <div className="bg-card border rounded-lg p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>
              {user.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">
              {user.full_name || "Sem nome"}
            </h3>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Badge
          variant={user.user_type === "professional" ? "default" : "secondary"}
        >
          {user.user_type === "professional" ? "Pro" : "Cliente"}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
        <span>
          Cadastrado em{" "}
          {format(new Date(user.created_at), "dd MMM yyyy", { locale: ptBR })}
        </span>

        <Button variant="ghost" size="sm" asChild className="h-7 px-2">
          <Link href={`/perfil/${user.id}`}>Detalhes</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <AdminPageHeader
        title="Gerenciar Usuários"
        description="Visualize e gerencie todos os usuários da plataforma."
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="pl-8"
          />
        </div>
        <Button
          onClick={fetchUsers}
          disabled={loading}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Filtrar
        </Button>
      </div>

      <ResponsiveTable
        data={users}
        columns={columns}
        keyExtractor={(user) => user.id}
        renderMobileCard={renderMobileCard}
        isLoading={loading}
        emptyMessage="Nenhum usuário encontrado."
      />
    </div>
  );
}
