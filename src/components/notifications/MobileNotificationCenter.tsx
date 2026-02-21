"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Search,
  X,
  Clock,
  MessageCircle,
  Star,
  Calendar,
  Shield,
  Trophy,
  Settings,
  AlertCircle,
} from "lucide-react";
import { useNotifications } from "./NotificationProviderSimple";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NotificationSettingsOnlyModal } from "./NotificationSettingsOnlyModal";

interface MobileNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente para item de notificação com swipe
function SwipeableNotificationItem({
  notification,
  config,
  onRemove,
  onMarkAsRead,
  profile,
}: {
  notification: any;
  config: any;
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  profile: any;
}) {
  const IconComponent = config.icon;
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -80, 0], [1, 0.5, 0]);
  const scale = useTransform(x, [-100, -80, 0], [1.2, 1, 0.8]);

  return (
    <div className="relative overflow-hidden rounded-xl mb-2 group">
      {/* Background Action (Delete) */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 z-0"
      >
        <motion.div style={{ scale }}>
          <Trash2 className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Foreground Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.2}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) {
            onRemove(notification.id);
          }
        }}
        className="relative z-10 touch-none"
      >
        <Card
          className={`transition-all duration-200 border-none shadow-sm ${
            !notification.is_read
              ? `${config.bg} border-l-4 border-l-blue-500`
              : "bg-white"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Ícone mobile-friendly */}
              <div
                className={`p-2.5 rounded-full ${config.color} text-white flex-shrink-0 shadow-sm`}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-base text-gray-900 mb-1 leading-tight">
                    {notification.title}
                  </h4>
                </div>

                {notification.message && (
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {notification.message}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        notification.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : notification.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : notification.priority === "normal"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {notification.priority}
                    </Badge>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="h-8 w-8 p-0 rounded-full bg-blue-100 hover:bg-blue-200"
                      >
                        <Check className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Ação da notificação */}
                {notification.action_url && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const metadata = notification.metadata || {};
                        const titleLower = (
                          notification.title || ""
                        ).toLowerCase();

                        const isSupport =
                          notification.type === "support" ||
                          metadata.is_support === true ||
                          notification.action_url?.includes("/ajuda") ||
                          notification.action_url?.includes("/help") ||
                          notification.action_url?.includes("open=help") ||
                          titleLower.includes("suporte") ||
                          titleLower.includes("chamado");

                        if (isSupport) {
                          if (notification.action_url) {
                            try {
                              const url = new URL(
                                notification.action_url,
                                window.location.origin,
                              );
                              const convId =
                                url.searchParams.get("conversation_id");
                              window.location.href = convId
                                ? `/ajuda?ticket_id=${convId}`
                                : "/ajuda?show=support";
                            } catch {
                              window.location.href = "/ajuda?show=support";
                            }
                          } else {
                            window.location.href = "/ajuda?show=support";
                          }
                          onMarkAsRead(notification.id);
                          return;
                        }

                        if (
                          notification.action_url === "/feed" ||
                          notification.action_url?.startsWith("/feed")
                        ) {
                          const hasCompletedOnboarding =
                            (typeof window !== "undefined" &&
                              localStorage.getItem("onboarding_completed") ===
                                "true") ||
                            (profile &&
                              (profile as any)?.onboarding_completed === true);

                          if (hasCompletedOnboarding) {
                            window.location.href = "/feed";
                            onMarkAsRead(notification.id);
                            return;
                          }
                        }

                        if (notification.action_url.startsWith("/")) {
                          window.location.href = notification.action_url;
                        } else {
                          window.open(notification.action_url, "_blank");
                        }
                        onMarkAsRead(notification.id);
                      }}
                      className="w-full h-10 text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                      Ver detalhes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Ícones e cores otimizados para mobile
const NOTIFICATION_CONFIG = {
  message: { icon: MessageCircle, color: "bg-blue-500", bg: "bg-blue-50" },
  review: { icon: Star, color: "bg-yellow-500", bg: "bg-yellow-50" },
  booking: { icon: Calendar, color: "bg-green-500", bg: "bg-green-50" },
  system: { icon: Settings, color: "bg-gray-500", bg: "bg-gray-50" },
  achievement: { icon: Trophy, color: "bg-purple-500", bg: "bg-purple-50" },
  verification: { icon: Shield, color: "bg-indigo-500", bg: "bg-indigo-50" },
  success: { icon: Check, color: "bg-emerald-500", bg: "bg-emerald-50" },
  warning: { icon: AlertCircle, color: "bg-orange-500", bg: "bg-orange-50" },
  error: { icon: AlertCircle, color: "bg-red-500", bg: "bg-red-50" },
  header: { icon: Bell, color: "bg-cyan-500", bg: "bg-cyan-50" },
};

export function MobileNotificationCenter({
  isOpen,
  onClose,
}: MobileNotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();
  const { profile } = useAuthContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filtrar notificações
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      searchTerm === "" ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = !showUnreadOnly || !notification.is_read;

    return matchesSearch && matchesFilter;
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full p-0 sm:max-w-sm bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-l-2xl"
      >
        {/* Header Mobile */}
        <SheetHeader className="p-4 pb-3 border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10 rounded-tl-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold">
                  Notificações
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white font-medium px-2 py-1 rounded-full ml-2 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </SheetTitle>
                <p className="text-sm text-gray-600">Arrasta para excluir</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="h-8 w-8 p-0 rounded-full"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Busca e Filtros Mobile */}
          <div className="p-4 bg-gray-50/50 border-b">
            <div className="space-y-3">
              {/* Barra de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-10 text-base" // text-base para mobile
                />
              </div>

              {/* Filtros e ações na mesma linha */}
              <div className="flex gap-2">
                <Button
                  variant={!showUnreadOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowUnreadOnly(false)}
                  className="h-9 rounded-none"
                >
                  Todas
                </Button>
                <Button
                  variant={showUnreadOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowUnreadOnly(true)}
                  className="h-9 rounded-none"
                >
                  Não lidas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  className="h-9 text-sm text-red-600 rounded-none"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar todas
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Notificações Mobile */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <BellOff className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || showUnreadOnly
                    ? "Nenhuma notificação encontrada"
                    : "Nenhuma notificação"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm || showUnreadOnly
                    ? "Tente ajustar a busca"
                    : "Você será notificado quando houver novidades"}
                </p>
                {(searchTerm || showUnreadOnly) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setShowUnreadOnly(false);
                    }}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-2">
                <AnimatePresence initial={false}>
                  {filteredNotifications.map((notification) => {
                    const config =
                      NOTIFICATION_CONFIG[
                        notification.type as keyof typeof NOTIFICATION_CONFIG
                      ] || NOTIFICATION_CONFIG.system;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          scale: 0.9,
                          marginBottom: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <SwipeableNotificationItem
                          notification={notification}
                          config={config}
                          onRemove={removeNotification}
                          onMarkAsRead={markAsRead}
                          profile={profile}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer mobile com estatísticas */}
          {notifications.length > 0 && (
            <div className="p-4 border-t bg-gray-50/50">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {unreadCount} não lidas de {notifications.length} total
                </p>
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
