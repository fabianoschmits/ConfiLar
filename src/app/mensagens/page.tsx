"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";

// Preserve links from agreements/notifications while reusing the native chat.
export default function MessagesPage() {
  const { user, loading } = useAuthContext();
  const { openChat, selectConversation } = useFloatingChat();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth?redirect=%2Fmensagens");
      return;
    }
    const conversation = new URLSearchParams(window.location.search).get(
      "conversation",
    );
    openChat();
    if (conversation && /^[0-9a-f-]{36}$/i.test(conversation))
      selectConversation(conversation);
    router.replace("/home");
  }, [loading, user, openChat, selectConversation, router]);
  return (
    <p role="status" className="app-page">
      Abrindo mensagens…
    </p>
  );
}
