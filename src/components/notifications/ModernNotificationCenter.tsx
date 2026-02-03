"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  MoreHorizontal,
  Clock,
  AlertCircle,
  MessageCircle,
  Star,
  Calendar,
  Shield,
  Trophy,
  Info,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNotifications } from "./NotificationProviderSimple";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NotificationSettingsOnlyModal } from "./NotificationSettingsOnlyModal";

interface ModernNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ícones para tipos de notificação
const NOTIFICATION_ICONS = {
  message: MessageCircle,
  review: Star,
  booking: Calendar,
  system: Settings,
  achievement: Trophy,
  verification: Shield,
  success: Check,
  warning: AlertCircle,
  error: AlertCircle,
  header: Bell,
};

// Cores para tipos de notificação
const NOTIFICATION_COLORS = {
  message: "bg-blue-500",
  review: "bg-yellow-500",
  booking: "bg-green-500",
  system: "bg-gray-50 dark:bg-gray-9000",
  achievement: "bg-purple-500",
  verification: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-orange-500",
  error: "bg-red-500",
  header: "bg-cyan-500",
};

// Cores de prioridade
const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export function ModernNotificationCenter({
  isOpen,
  onClose,
}: ModernNotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();
  const { profile } = useAuthContext();

  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState<
    Set<string>
  >(new Set());
  const [showSettings, setShowSettings] = useState(false);

  // Filtrar notificações
  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notification.is_read) ||
      (filter === "read" && notification.is_read);

    const matchesSearch =
      searchTerm === "" ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || notification.type === selectedType;

    return matchesFilter && matchesSearch && matchesType;
  });

  // Toggle de expansão de notificação
  const toggleExpanded = (notificationId: string) => {
    setExpandedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilter("all");
    setSearchTerm("");
    setSelectedType("all");
    setShowFilters(false);
  };

  // Obter tipos únicos para filtro
  const uniqueTypes = Array.from(new Set(notifications.map((n) => n.type)));

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-white dark:bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl rounded-l-2xl"
      >
        <SheetHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                Notificações
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white font-medium px-2 py-1 rounded-full ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription className="mt-1 text-gray-600 dark:text-gray-400">
                {filteredNotifications.length} de {notifications.length}{" "}
                notificações
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="h-8 w-8 p-0"
                title="Configurações de notificações"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Barra de Busca e Filtros */}
          <div className="p-4 border-b bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-3">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar notificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-9"
                />
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-8 text-xs"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Filtros
                  {showFilters ? (
                    <ChevronUp className="w-3 h-3 ml-1" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </Button>

                {/* Filtros rápidos e Limpar todas na mesma linha */}
                <div className="flex gap-1">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="h-8 text-xs px-2 rounded-none"
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filter === "unread" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("unread")}
                    className="h-8 text-xs px-2 rounded-none"
                  >
                    Não lidas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    disabled={notifications.length === 0}
                    className="h-8 text-xs px-2 text-red-600 rounded-none"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Limpar todas
                  </Button>
                </div>
              </div>

              {/* Filtros expandidos */}
              {showFilters && (
                <div className="space-y-2 pt-2 border-t">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                      Tipo
                    </label>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant={selectedType === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType("all")}
                        className="h-7 text-xs px-2"
                      >
                        Todos
                      </Button>
                      {uniqueTypes.map((type) => (
                        <Button
                          key={type}
                          variant={
                            selectedType === type ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedType(type)}
                          className="h-7 text-xs px-2"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Notificações */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <BellOff className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm || selectedType !== "all"
                    ? "Nenhuma notificação encontrada"
                    : "Nenhuma notificação"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm || selectedType !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Você será notificado quando houver novidades"}
                </p>
                {(searchTerm || selectedType !== "all") && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredNotifications.map((notification) => {
                  const IconComponent =
                    NOTIFICATION_ICONS[
                      notification.type as keyof typeof NOTIFICATION_ICONS
                    ] || Bell;
                  const iconColor =
                    NOTIFICATION_COLORS[
                      notification.type as keyof typeof NOTIFICATION_COLORS
                    ] || "bg-gray-50 dark:bg-gray-9000";
                  const priorityColor =
                    PRIORITY_COLORS[
                      notification.priority as keyof typeof PRIORITY_COLORS
                    ] || "bg-gray-100 text-gray-800";
                  const isExpanded = expandedNotifications.has(notification.id);

                  return (
                    <Card
                      key={notification.id}
                      className={`transition-all duration-200 hover:shadow-md ${
                        !notification.is_read
                          ? "bg-blue-50/50 border-blue-200"
                          : "bg-white dark:bg-gray-900"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Ícone */}
                          <div
                            className={`p-2 rounded-full ${iconColor} text-white flex-shrink-0`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">
                                  {notification.title}
                                </h4>

                                {notification.message && (
                                  <p
                                    className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${
                                      isExpanded ? "" : "line-clamp-2"
                                    }`}
                                  >
                                    {notification.message}
                                  </p>
                                )}

                                {/* Metadados */}
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={`text-xs ${priorityColor}`}>
                                    {notification.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(
                                      new Date(notification.created_at),
                                      {
                                        addSuffix: true,
                                        locale: ptBR,
                                      },
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="flex items-center gap-1">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeNotification(notification.id)
                                  }
                                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Ação da notificação */}
                            <div className="mt-3 pt-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Usar a mesma lógica de redirecionamento
                                  const metadata = notification.metadata || {};
                                  const notificationType =
                                    notification.type || "";
                                  const titleLower = (
                                    notification.title || ""
                                  ).toLowerCase();

                                  // Se for mensagem, já foi tratado no clique do card
                                  // Para outros tipos, usar action_url ou metadata
                                  if (notification.action_url) {
                                    // Verificar se é redirecionamento para onboarding e se o usuário já completou
                                    if (
                                      notification.action_url ===
                                        "/onboarding" ||
                                      notification.action_url.startsWith(
                                        "/onboarding",
                                      )
                                    ) {
                                      // Verificar se o usuário já completou o onboarding (usar localStorage ou verificar no profile como any)
                                      const hasCompletedOnboarding =
                                        (typeof window !== "undefined" &&
                                          localStorage.getItem(
                                            "onboarding_completed",
                                          ) === "true") ||
                                        (profile &&
                                          (profile as any)
                                            ?.onboarding_completed === true);

                                      if (hasCompletedOnboarding) {
                                        console.log(
                                          "✅ Usuário já completou onboarding, redirecionando para feed ao invés de onboarding",
                                        );
                                        // Redirecionar para feed ao invés de onboarding
                                        window.location.href = "/feed";
                                        markAsRead(notification.id);
                                        return;
                                      }
                                    }

                                    if (
                                      notification.action_url.startsWith("/")
                                    ) {
                                      window.location.href =
                                        notification.action_url;
                                    } else if (
                                      notification.action_url.startsWith("#")
                                    ) {
                                      window.location.hash =
                                        notification.action_url;
                                    } else {
                                      window.open(
                                        notification.action_url,
                                        "_blank",
                                      );
                                    }
                                  } else if (metadata.post_id) {
                                    window.location.href = `/feed?post=${metadata.post_id}`;
                                  }

                                  markAsRead(notification.id);
                                }}
                                className="w-full text-xs"
                              >
                                Ver detalhes
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer com estatísticas */}
          {notifications.length > 0 && (
            <div className="p-4 border-t bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {unreadCount} não lidas de {notifications.length} total
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="h-7 text-xs"
                  >
                    Marcar todas
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-7 text-xs text-red-600 hover:text-red-700"
                  >
                    Limpar todas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      {/* Modal de Configurações */}
      <NotificationSettingsOnlyModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </Sheet>
  );
}
