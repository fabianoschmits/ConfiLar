"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  ArrowLeft,
  Check,
  CheckCheck,
  Edit3,
  X as XIcon,
  Search,
  Maximize2,
  Minimize2,
  ArrowUpLeft,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { useMessages } from "@/hooks/useMessages";
import { useFavorites } from "@/hooks/useFavorites";
import { useNotifications } from "@/components/notifications/NotificationProviderSimple";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ConversationMenu } from "./ConversationMenu";
import { MessageMenu } from "./MessageMenu";
import { RequestEvaluationButton } from "./RequestEvaluationButton";
import { toast } from "sonner";

export function FloatingChat() {
  const { user, profile } = useAuthContext();
  const {
    isOpen,
    closeChat,
    selectedConversationId,
    selectConversation,
    openChat,
    targetUserId,
  } = useFloatingChat();
  const {
    conversations,
    messages,
    loadConversations,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    deleteConversation,
    deleteMessage,
    editMessage,
    getTotalUnreadCount,
    sendNewConversationNotification,
  } = useMessages();

  const { favorites, isFavorite } = useFavorites();
  const { notifications } = useNotifications();

  // Verificar se há notificações de mensagem não lidas (excluindo suporte)
  const hasUnreadMessageNotifications = notifications.some(
    (notification: any) =>
      !notification.is_read &&
      notification.type === "message" &&
      !notification.title?.toLowerCase().includes("suporte") &&
      !notification.title?.toLowerCase().includes("central de ajuda"),
  );

  // Contar notificações de mensagem não lidas (excluindo suporte)
  const unreadMessageNotifications = notifications.filter(
    (notification: any) =>
      !notification.is_read &&
      notification.type === "message" &&
      !notification.title?.toLowerCase().includes("suporte") &&
      !notification.title?.toLowerCase().includes("central de ajuda"),
  );
  const unreadMessageCount = unreadMessageNotifications.length;

  // Estados do componente
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesSearch, setShowFavoritesSearch] = useState(false);
  const [lastConversationId, setLastConversationId] = useState<string | null>(
    null,
  );
  const [lastUnreadMessageCount, setLastUnreadMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Estados de redimensionamento
  const MIN_WIDTH = 280;
  const MIN_HEIGHT = 360;
  const MAX_WIDTH = 800;
  const MAX_HEIGHT = 800;
  const DEFAULT_WIDTH = 320;
  const DEFAULT_HEIGHT = 480;

  const [chatSize, setChatSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Abrir chat automaticamente quando houver nova notificação de mensagem
  useEffect(() => {
    // Segurança: Não abrir o chat normal se estivermos tentando abrir a central de ajuda via URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const openParam = params.get("open");
      if (openParam === "help") return;
    }

    if (unreadMessageCount > lastUnreadMessageCount) {
      // Nova notificação de mensagem detectada
      setLastUnreadMessageCount(unreadMessageCount);

      // Abrir chat automaticamente se houver nova notificação
      if (!isOpen) {
        console.log(
          "💬 Nova notificação de mensagem detectada, abrindo chat automaticamente",
        );
        openChat();
      }
    } else {
      setLastUnreadMessageCount(unreadMessageCount);
    }
  }, [unreadMessageCount, lastUnreadMessageCount, isOpen, openChat]);

  // Função para fazer scroll automático para o final
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Função para fazer scroll imediato para o final (sem animação)
  const scrollToBottomImmediate = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  };

  // Filtrar favoritos baseado na busca
  const filteredFavorites = favorites.filter((favorite) => {
    if (!searchQuery) return true;
    const name = favorite.professional?.full_name?.toLowerCase() || "";
    const services =
      favorite.professional?.professional_services?.join(" ").toLowerCase() ||
      "";
    const location =
      `${favorite.professional?.location_city || ""} ${favorite.professional?.location_state || ""}`.toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      name.includes(query) ||
      services.includes(query) ||
      location.includes(query)
    );
  });

  // Função para formatar tempo de forma amigável
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Função para iniciar conversa com favorito
  const startConversationWithFavorite = async (favorite: any) => {
    if (!favorite.professional?.id) return;

    try {
      // Verificar se já existe conversa
      const existingConversation = conversations.find(
        (conv) =>
          (conv.client_id === user?.id &&
            conv.professional_id === favorite.professional.id) ||
          (conv.professional_id === user?.id &&
            conv.client_id === favorite.professional.id),
      );

      if (existingConversation) {
        // Abrir conversa existente
        selectConversation(existingConversation.id);
      } else {
        // Criar nova conversa usando o contexto
        await openChat(
          favorite.professional.id,
          favorite.professional.full_name,
        );
      }

      // Fechar busca de favoritos
      setShowFavoritesSearch(false);
      setSearchQuery("");
    } catch (error) {
      console.error("❌ Erro ao iniciar conversa com favorito:", error);
    }
  };

  // Função para abrir WhatsApp com favorito
  const handleOpenWhatsAppWithFavorite = (
    favorite: any,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // Evitar que clique no div pai

    const professional = favorite.professional;
    if (!professional?.phone) {
      toast.error("Número de telefone não disponível para este usuário");
      return;
    }

    // Remover caracteres não numéricos
    let phoneNumber = professional.phone.replace(/\D/g, "");

    // Verificar se o número não está vazio
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Número de telefone inválido");
      return;
    }

    // Se não começar com 55 (código do Brasil), adicionar
    if (!phoneNumber.startsWith("55")) {
      phoneNumber = "55" + phoneNumber;
    }

    // Mensagem pré-preenchida para o WhatsApp
    const message = `Olá ${professional.full_name}! Vi seu perfil no ConfiLar e gostaria de entrar em contato com você.`;
    const encodedMessage = encodeURIComponent(message);

    // Abrir WhatsApp com mensagem pré-preenchida
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Carregar tamanho salvo do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chatSize");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChatSize(parsed);
      } catch (e) {
        console.error("Erro ao carregar tamanho do chat:", e);
      }
    }
  }, []);

  // Salvar tamanho no localStorage
  useEffect(() => {
    if (!isResizing) {
      localStorage.setItem("chatSize", JSON.stringify(chatSize));
    }
  }, [chatSize, isResizing]);

  // Função para iniciar redimensionamento
  const handleResizeStart = (e: any, direction: string) => {
    // Prevenir scroll e seleção em mobile (se cancelável)
    if (e.cancelable && e.type === "touchstart") e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const startX = clientX;
    const startY = clientY;
    const startWidth = chatSize.width;
    const startHeight = chatSize.height;

    const handleMove = (moveEvent: any) => {
      // Prevenir scroll em mobile durante resize
      if (moveEvent.cancelable && moveEvent.type === "touchmove")
        moveEvent.preventDefault();

      const moveClientX = moveEvent.touches
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;
      const moveClientY = moveEvent.touches
        ? moveEvent.touches[0].clientY
        : moveEvent.clientY;

      let deltaX = moveClientX - startX;
      let deltaY = moveClientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      // Calcular novo tamanho baseado na direção
      if (direction.includes("e")) newWidth = startWidth + deltaX;
      if (direction.includes("w")) newWidth = startWidth - deltaX;
      if (direction.includes("s")) newHeight = startHeight + deltaY;
      if (direction.includes("n")) newHeight = startHeight - deltaY;

      // Aplicar limites
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));

      setChatSize({ width: newWidth, height: newHeight });
    };

    const handleEnd = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
  };

  // Função para maximizar/restaurar
  const toggleMaximize = () => {
    if (isMaximized) {
      // Restaurar tamanho anterior
      setChatSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    } else {
      // Maximizar (80% da tela)
      const maxWidth = Math.min(window.innerWidth * 0.8, MAX_WIDTH);
      const maxHeight = Math.min(window.innerHeight * 0.8, MAX_HEIGHT);
      setChatSize({ width: maxWidth, height: maxHeight });
    }
    setIsMaximized(!isMaximized);
  };

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar isOpen do contexto com isExpanded local
  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  // Sincronizar com contexto quando selectedConversationId muda
  // Usar ref para evitar recarregar mensagens quando apenas conversations atualizar
  const lastSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedConversationId) {
      // Só recarregar mensagens se a conversa selecionada mudou
      if (lastSelectedIdRef.current !== selectedConversationId) {
        lastSelectedIdRef.current = selectedConversationId;
        const conversation = conversations.find(
          (c) => c.id === selectedConversationId,
        );
        if (conversation) {
          console.log(
            "💬 Conversa encontrada na lista, carregando mensagens:",
            conversation.id,
          );
          setSelectedConversation(conversation);
          loadMessages(conversation.id);
          markMessagesAsRead(conversation.id);
        } else {
          // Se a conversa não está na lista ainda, carregar mensagens diretamente
          console.log(
            "💬 Conversa não encontrada na lista, carregando mensagens diretamente:",
            selectedConversationId,
          );
          loadMessages(selectedConversationId);
          markMessagesAsRead(selectedConversationId);
        }
      } else {
        // Se apenas conversations mudou mas a conversa selecionada é a mesma, apenas atualizar o objeto
        const conversation = conversations.find(
          (c) => c.id === selectedConversationId,
        );
        if (conversation) {
          setSelectedConversation(conversation);
        }
      }
    } else {
      lastSelectedIdRef.current = null;
      setSelectedConversation(null);
    }
  }, [selectedConversationId, conversations]);

  // Scroll automático quando mensagens são carregadas pela primeira vez
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      console.log(
        "📨 Mensagens carregadas, fazendo scroll para última mensagem",
      );
      // Usar scroll imediato para carregamento inicial
      setTimeout(() => {
        scrollToBottomImmediate();
      }, 100);
    }
  }, [selectedConversation?.id, messages.length]);

  // Carregar conversas quando o chat expande
  useEffect(() => {
    if (isExpanded && user?.id) {
      console.log("💬 Chat expandido, carregando conversas...");
      loadConversations();
    }
  }, [isExpanded, user?.id]);

  // Carregar conversas quando selectedConversationId é definido mas conversas não estão carregadas
  useEffect(() => {
    if (selectedConversationId && user?.id && conversations.length === 0) {
      console.log(
        "💬 selectedConversationId definido mas conversas não carregadas, carregando...",
      );
      loadConversations();
    }
  }, [selectedConversationId, user?.id, conversations.length]);

  // Fechar busca de favoritos quando não há query
  useEffect(() => {
    if (!searchQuery) {
      setShowFavoritesSearch(false);
    }
  }, [searchQuery]);

  // Auto-scroll quando receber novas mensagens (apenas se for mensagem nova)
  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      const lastMessage = messages[messages.length - 1];
      // Fazer scroll apenas se a última mensagem não foi enviada pelo usuário atual
      if (lastMessage.sender_id !== user?.id) {
        console.log("📨 Nova mensagem recebida, fazendo scroll");
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [messages.length, selectedConversation, user?.id]);

  // Focar no campo de input quando o chat for aberto (mas não se estiver editando)
  useEffect(() => {
    if (
      isExpanded &&
      selectedConversation &&
      messageInputRef.current &&
      !editingMessageId
    ) {
      // Pequeno delay para garantir que o campo esteja renderizado
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded, selectedConversation, editingMessageId]);

  // Focar no campo de edição quando iniciar edição
  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      setTimeout(() => {
        editInputRef.current?.focus();
      }, 100);
    }
  }, [editingMessageId]);

  // Auto-scroll quando uma NOVA conversa for selecionada
  useEffect(() => {
    if (
      selectedConversation &&
      selectedConversation.id !== lastConversationId
    ) {
      console.log(
        "🆕 Nova conversa selecionada, fazendo scroll:",
        selectedConversation.id,
      );
      setLastConversationId(selectedConversation.id);
      // Aguardar um pouco mais para garantir que as mensagens foram carregadas
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [selectedConversation, lastConversationId]);

  // Removido auto-scroll automático - usuário tem controle total

  // Detectar quando o usuário rola manualmente (apenas para controle visual)
  const handleScroll = () => {
    // Função mantida para compatibilidade, mas não faz nada
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id || sending)
      return;

    try {
      setSending(true);

      // Verificar se é a primeira mensagem da conversa
      const isFirstMessage = messages.length === 0;

      const messageContent = newMessage.trim();

      // Limpar o campo de mensagem imediatamente para melhor UX
      setNewMessage("");

      // Enviar mensagem
      const success = await sendMessage(
        selectedConversation.id,
        messageContent,
      );

      if (success) {
        // Se for a primeira mensagem, enviar notificação automática
        if (isFirstMessage) {
          await sendNewConversationNotification(selectedConversation);
        }

        // Fazer scroll automático para a nova mensagem
        setTimeout(() => scrollToBottom(), 100);

        // Garantir que o chat permaneça aberto
        if (!isExpanded) {
          setIsExpanded(true);
        }

        // Manter o foco no campo de input após enviar a mensagem (mas não se estiver editando)
        setTimeout(() => {
          if (messageInputRef.current && !editingMessageId) {
            messageInputRef.current.focus();
          }
        }, 150); // Aumentado para 150ms para melhor suporte mobile
      } else {
        // Se falhou, restaurar a mensagem
        setNewMessage(messageContent);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      // Restaurar a mensagem em caso de erro
      setNewMessage(newMessage.trim());
    } finally {
      setSending(false);
    }
  };

  // Função para fechar o chat
  const handleCloseChat = () => {
    setIsExpanded(false);
    closeChat();
  };

  // Voltar para lista de conversas
  const goBackToConversations = () => {
    setSelectedConversation(null);
    selectConversation(undefined);
  };

  // Iniciar edição de mensagem
  const handleStartEdit = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  // Salvar edição
  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingContent.trim()) return;

    try {
      const success = await editMessage(
        editingMessageId,
        editingContent.trim(),
      );
      if (success) {
        setEditingMessageId(null);
        setEditingContent("");
      }
    } catch (error) {
      console.error("Erro ao editar mensagem:", error);
    }
  };

  // Calcular total de mensagens não lidas
  const totalUnread = getTotalUnreadCount();

  // Função para abrir WhatsApp
  const handleOpenWhatsApp = () => {
    if (!selectedConversation || !user?.id) return;

    const otherUser =
      user.id === selectedConversation.client_id
        ? selectedConversation.professional
        : selectedConversation.client;

    if (!otherUser?.phone) {
      toast.error("Número de telefone não disponível para este usuário");
      return;
    }

    // Remover caracteres não numéricos
    let phoneNumber = otherUser.phone.replace(/\D/g, "");

    // Verificar se o número não está vazio
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Número de telefone inválido");
      return;
    }

    // Se não começar com 55 (código do Brasil), adicionar
    if (!phoneNumber.startsWith("55")) {
      phoneNumber = "55" + phoneNumber;
    }

    // Mensagem pré-preenchida para o WhatsApp
    const message = `Olá ${otherUser.full_name}! Vi seu perfil no ConfiLar e gostaria de entrar em contato com você.`;
    const encodedMessage = encodeURIComponent(message);

    // Abrir WhatsApp com mensagem pré-preenchida
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!user || !profile) return null;

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      {isExpanded && (
        <div className="fixed inset-0 z-40" onClick={handleCloseChat} />
      )}

      {/* Chat Flutuante */}
      <div className="floating-chat-fixed">
        {isExpanded ? (
          <div
            className="max-w-[calc(100vw-2rem)] relative"
            style={{
              width: `${chatSize.width}px`,
              height: `${chatSize.height}px`,
              transition: isResizing ? "none" : "all 0.2s ease",
            }}
          >
            <Card className="bg-white/95 dark:bg-black backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl h-full flex flex-col relative text-left">
              {/* Indicador de Resize */}
              <div className="absolute top-2.5 left-2.5 z-50 pointer-events-none opacity-50">
                <ArrowUpLeft
                  className={`w-3.5 h-3.5 cursor-nw-resize ${
                    selectedConversation ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>
              <CardContent className="p-0 flex-1 min-h-0 flex flex-col overflow-hidden">
                {!selectedConversation ? (
                  /* Lista de Conversas */
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg ml-3">
                        Conversas Ativas
                      </h4>
                      <Badge className="bg-blue-500 text-white font-medium px-2 py-1 rounded-full">
                        {conversations.length}
                      </Badge>
                    </div>

                    {/* Campo de busca para favoritos */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar favoritos para conversar..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setShowFavoritesSearch(true)}
                          className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Lista de favoritos filtrados */}
                      {showFavoritesSearch && searchQuery && (
                        <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
                          {filteredFavorites.length > 0 ? (
                            filteredFavorites.map((favorite) => (
                              <div
                                key={favorite.id}
                                className="p-3 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="relative">
                                    <UserAvatar
                                      src={favorite.professional?.avatar_url}
                                      alt={
                                        favorite.professional?.full_name ||
                                        "Usuário"
                                      }
                                      fallback={
                                        favorite.professional?.full_name?.charAt(
                                          0,
                                        ) || "U"
                                      }
                                      size="sm"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">
                                      {favorite.professional?.full_name ||
                                        "Usuário"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {favorite.professional?.location_city &&
                                      favorite.professional?.location_state
                                        ? `${favorite.professional.location_city}, ${favorite.professional.location_state}`
                                        : "Localização não informada"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      startConversationWithFavorite(favorite)
                                    }
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 h-auto"
                                  >
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Chat
                                  </Button>
                                  {favorite.professional?.phone && (
                                    <Button
                                      size="sm"
                                      onClick={(e) =>
                                        handleOpenWhatsAppWithFavorite(
                                          favorite,
                                          e,
                                        )
                                      }
                                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1.5 h-auto"
                                    >
                                      <svg
                                        className="h-3 w-3 mr-1"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                      </svg>
                                      WhatsApp
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-gray-500 text-sm">
                              Nenhum favorito encontrado
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {conversations.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="bg-gray-50 rounded-xl p-6">
                          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="font-medium text-gray-900 mb-1">
                            Nenhuma conversa
                          </p>
                          <p className="text-sm text-gray-500">
                            Inicie uma conversa com outro usuário
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                        {conversations.map((conversation) => {
                          const otherUser =
                            user.id === conversation.client_id
                              ? conversation.professional
                              : conversation.client;
                          const unreadCount = conversation.unread_count || 0;

                          return (
                            <div
                              key={conversation.id}
                              onClick={() =>
                                selectConversation(conversation.id)
                              }
                              className={`bg-white dark:bg-gray-800 border rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 ${
                                unreadCount > 0
                                  ? "border-blue-200 bg-blue-50/30 dark:bg-blue-900/20 dark:border-blue-800"
                                  : "border-gray-200 dark:border-gray-700"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <UserAvatar
                                    src={otherUser.avatar_url}
                                    alt={otherUser.full_name}
                                    fallback={otherUser.full_name
                                      .charAt(0)
                                      .toUpperCase()}
                                    size="md"
                                    className="w-12 h-12"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-semibold text-gray-900 dark:text-white text-sm truncate pr-2">
                                      {otherUser.full_name}
                                    </h5>
                                  </div>

                                  {conversation.last_message ? (
                                    <p className="text-xs text-gray-600 truncate">
                                      {conversation.last_message.sender_id ===
                                      user?.id ? (
                                        <span className="text-gray-400 mr-1">
                                          Você:
                                        </span>
                                      ) : (
                                        <span className="text-gray-500 mr-1">
                                          {otherUser.full_name.split(" ")[0]}
                                          :{" "}
                                        </span>
                                      )}
                                      <span
                                        className={
                                          conversation.last_message
                                            .sender_id !== user?.id &&
                                          unreadCount > 0
                                            ? "font-medium text-gray-900 dark:text-white"
                                            : "text-gray-500 dark:text-gray-400"
                                        }
                                      >
                                        {conversation.last_message.content}
                                      </span>
                                    </p>
                                  ) : (
                                    <p className="text-xs text-gray-400 italic">
                                      Nenhuma mensagem ainda
                                    </p>
                                  )}
                                </div>

                                {/* Coluna da Direita (Tempo e Badge) */}
                                <div className="flex flex-col items-end gap-1 min-w-[50px]">
                                  {conversation.last_message?.created_at && (
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                                      {formatTime(
                                        conversation.last_message.created_at,
                                      )}
                                    </span>
                                  )}
                                  {unreadCount > 0 && (
                                    <Badge className="bg-blue-600 text-white font-medium text-[10px] h-5 min-w-[20px] rounded-full flex items-center justify-center px-1 shadow-sm">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                  {conversation.last_message?.sender_id ===
                                    user?.id && (
                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Chat da Conversa */
                  <div className="flex flex-col h-full">
                    {/* Header da Conversa */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-t-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 ml-4">
                          <MessageCircle className="h-4 w-4 text-white" />
                          <h3 className="font-medium text-white text-sm">
                            Chat
                          </h3>
                          {/* Botão WhatsApp */}
                          {selectedConversation &&
                            (() => {
                              const otherUser =
                                user.id === selectedConversation.client_id
                                  ? selectedConversation.professional
                                  : selectedConversation.client;
                              return otherUser?.phone ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleOpenWhatsApp}
                                  className="text-white hover:bg-white/20 px-2 py-1 rounded-lg ml-2 flex flex-col items-center gap-0.5"
                                  title="Abrir conversa no WhatsApp"
                                >
                                  <svg
                                    className="h-5 w-5"
                                    fill="#25D366"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                  </svg>
                                  <span className="text-[9px] font-medium leading-none">
                                    WhatsApp
                                  </span>
                                </Button>
                              ) : null;
                            })()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMaximize}
                            className="text-white hover:bg-white/20 p-1 rounded-lg"
                            title={isMaximized ? "Restaurar" : "Maximizar"}
                          >
                            {isMaximized ? (
                              <Minimize2 className="h-3 w-3" />
                            ) : (
                              <Maximize2 className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={goBackToConversations}
                            className="text-white hover:bg-white/20 p-1 rounded-lg"
                            title="Voltar para conversas"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCloseChat}
                            className="text-white hover:bg-white/20 p-1 rounded-lg"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Header da Conversa */}
                    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3 animate-slide-in-right">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/perfil/${
                            user.id === selectedConversation.client_id
                              ? selectedConversation.professional.id
                              : selectedConversation.client.id
                          }`}
                          className="flex items-center gap-3 flex-1"
                        >
                          <div className="relative">
                            <UserAvatar
                              src={
                                user.id === selectedConversation.client_id
                                  ? selectedConversation.professional.avatar_url
                                  : selectedConversation.client.avatar_url
                              }
                              alt={
                                user.id === selectedConversation.client_id
                                  ? selectedConversation.professional.full_name
                                  : selectedConversation.client.full_name
                              }
                              fallback={
                                user.id === selectedConversation.client_id
                                  ? selectedConversation.professional.full_name
                                      .charAt(0)
                                      .toUpperCase()
                                  : selectedConversation.client.full_name
                                      .charAt(0)
                                      .toUpperCase()
                              }
                              size="md"
                              className="w-10 h-10"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {user.id === selectedConversation.client_id
                                ? selectedConversation.professional.full_name
                                : selectedConversation.client.full_name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {user.id === selectedConversation.client_id
                                ? selectedConversation.professional.user_type
                                : selectedConversation.client.user_type}
                            </p>
                          </div>
                        </Link>

                        {/* Botões de Ação - Canto Direito */}
                        <div className="flex items-center gap-0.5 ml-4">
                          <RequestEvaluationButton
                            targetUserId={
                              user.id === selectedConversation.client_id
                                ? selectedConversation.professional.id
                                : selectedConversation.client.id
                            }
                            targetUserName={
                              user.id === selectedConversation.client_id
                                ? selectedConversation.professional.full_name
                                : selectedConversation.client.full_name
                            }
                          />
                          <ConversationMenu
                            conversationId={selectedConversation.id}
                            onDelete={async (conversationId) => {
                              const success =
                                await deleteConversation(conversationId);
                              if (success) {
                                goBackToConversations();
                              }
                              return success;
                            }}
                            disabled={sending}
                            conversationData={selectedConversation}
                            messages={messages}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mensagens */}
                    <div
                      ref={messagesContainerRef}
                      onScroll={handleScroll}
                      className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0"
                    >
                      {messages.map((message) => {
                        const isOwn = message.sender_id === user.id;
                        const isEditing = editingMessageId === message.id;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl relative ${
                                isOwn
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3"
                              }`}
                            >
                              {isEditing ? (
                                // Modo de edição
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Edit3 className="h-3 w-3" />
                                    <span className="text-xs font-medium">
                                      Editando mensagem...
                                    </span>
                                  </div>
                                  <Input
                                    ref={editInputRef}
                                    value={editingContent}
                                    onChange={(e) =>
                                      setEditingContent(e.target.value)
                                    }
                                    className="bg-white text-gray-900 border border-gray-300 focus:border-blue-500 rounded-lg"
                                    placeholder="Digite sua mensagem..."
                                    maxLength={1000}
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSaveEdit();
                                      }
                                    }}
                                  />
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      {editingContent.length}/1000 caracteres
                                    </span>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        className="h-6 px-2 text-xs border border-gray-300 hover:border-gray-500 rounded-lg"
                                      >
                                        <XIcon className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={handleSaveEdit}
                                        disabled={
                                          !editingContent.trim() ||
                                          editingContent.trim() ===
                                            message.content
                                        }
                                        className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Modo normal de visualização
                                <>
                                  <p className="text-sm leading-relaxed break-words pr-8">
                                    {message.content}
                                  </p>
                                  <div className="flex items-center justify-end gap-2 mt-2">
                                    <div className="flex items-center gap-1">
                                      {message.is_read ? (
                                        <CheckCheck className="h-2.5 w-2.5 text-green-500" />
                                      ) : (
                                        <Check className="h-2.5 w-2.5 text-gray-400" />
                                      )}
                                      <span className="text-[10px] opacity-70">
                                        {new Date(
                                          message.created_at,
                                        ).toLocaleTimeString("pt-BR", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                        {message.is_edited && (
                                          <span className="ml-1 text-xs opacity-50">
                                            (editado)
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    {!isOwn && (
                                      <MessageMenu
                                        messageId={message.id}
                                        messageContent={message.content}
                                        onDelete={deleteMessage}
                                        onEdit={handleStartEdit}
                                        disabled={sending}
                                        isOwnMessage={false}
                                      />
                                    )}
                                    {isOwn && (
                                      <MessageMenu
                                        messageId={message.id}
                                        messageContent={message.content}
                                        onDelete={deleteMessage}
                                        onEdit={handleStartEdit}
                                        disabled={sending}
                                        isOwnMessage={true}
                                      />
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input de Mensagem */}
                    <div className="border-t border-gray-200 dark:border-gray-800 p-2 pb-1 animate-slide-in-right">
                      <div className="flex gap-2">
                        <Input
                          ref={messageInputRef}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 rounded-xl px-4 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          disabled={sending}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Resize Handles */}
              <>
                {/* Bordas */}
                <div
                  className="resize-handle resize-n"
                  onMouseDown={(e) => handleResizeStart(e, "n")}
                  onTouchStart={(e) => handleResizeStart(e, "n")}
                />
                <div
                  className="resize-handle resize-s"
                  onMouseDown={(e) => handleResizeStart(e, "s")}
                  onTouchStart={(e) => handleResizeStart(e, "s")}
                />
                <div
                  className="resize-handle resize-e"
                  onMouseDown={(e) => handleResizeStart(e, "e")}
                  onTouchStart={(e) => handleResizeStart(e, "e")}
                />
                <div
                  className="resize-handle resize-w"
                  onMouseDown={(e) => handleResizeStart(e, "w")}
                  onTouchStart={(e) => handleResizeStart(e, "w")}
                />

                {/* Cantos */}
                <div
                  className="resize-handle resize-ne"
                  onMouseDown={(e) => handleResizeStart(e, "ne")}
                  onTouchStart={(e) => handleResizeStart(e, "ne")}
                />
                <div
                  className="resize-handle resize-nw"
                  onMouseDown={(e) => handleResizeStart(e, "nw")}
                  onTouchStart={(e) => handleResizeStart(e, "nw")}
                />
                <div
                  className="resize-handle resize-se"
                  onMouseDown={(e) => handleResizeStart(e, "se")}
                  onTouchStart={(e) => handleResizeStart(e, "se")}
                />
                <div
                  className="resize-handle resize-sw"
                  onMouseDown={(e) => handleResizeStart(e, "sw")}
                  onTouchStart={(e) => handleResizeStart(e, "sw")}
                />
              </>
            </Card>
          </div>
        ) : (
          /* Botão Minimizado (mostrar quando houver notificações de mensagem ou mensagens não lidas) */
          <>
            {hasUnreadMessageNotifications || totalUnread > 0 ? (
              <Button
                onClick={() => setIsExpanded(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200 p-4 rounded-full relative"
              >
                <MessageCircle className="h-6 w-6" />
                {(totalUnread > 0 || hasUnreadMessageNotifications) && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white font-medium text-xs min-w-5 h-5 flex items-center justify-center rounded-full">
                    {totalUnread > 0 ? totalUnread : "!"}
                  </Badge>
                )}
              </Button>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
