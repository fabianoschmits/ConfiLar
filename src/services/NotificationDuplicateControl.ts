import { supabase } from "@/lib/supabase";

export class NotificationDuplicateControl {
  private static processedNotifications = new Set<string>();
  private static lastCleanup = Date.now();

  /**
   * Gera uma chave única para a notificação
   */
  private static generateKey(
    type: string,
    userId: string,
    relatedId: string,
  ): string {
    return `${type}_${userId}_${relatedId}`;
  }

  /**
   * Verifica se uma notificação já foi processada
   */
  static async isNotificationProcessed(
    type: string,
    userId: string,
    relatedId: string,
  ): Promise<boolean> {
    const key = this.generateKey(type, userId, relatedId);

    // Verificar cache local
    if (this.processedNotifications.has(key)) {
      console.log("⏭️ Notificação já processada (cache local):", key);
      return true;
    }

    // Verificar no banco de dados (últimas 2 horas)
    const { data: existingNotification } = await supabase
      .from("notifications")
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("type", type)
      .gte(
        "created_at",
        new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      )
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingNotification && existingNotification.length > 0) {
      console.log("⏭️ Notificação já processada (banco de dados):", key);
      this.processedNotifications.add(key);
      return true;
    }

    return false;
  }

  /**
   * Marca uma notificação como processada
   */
  static markAsProcessed(
    type: string,
    userId: string,
    relatedId: string,
  ): void {
    const key = this.generateKey(type, userId, relatedId);
    this.processedNotifications.add(key);
    console.log("✅ Notificação marcada como processada:", key);
  }

  /**
   * Limpa o cache periodicamente
   */
  static cleanupCache(): void {
    const now = Date.now();
    if (now - this.lastCleanup > 30 * 60 * 1000) {
      // A cada 30 minutos
      this.processedNotifications.clear();
      this.lastCleanup = now;
      console.log("🧹 Cache de notificações limpo");
    }
  }

  /**
   * Verifica se há notificações duplicadas no banco
   */
  static async checkForDuplicates(userId: string): Promise<void> {
    try {
      const { data: notifications, error } = await supabase
        .from("notifications")
        .select("id, type, title, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao verificar duplicatas:", error);
        return;
      }

      if (!notifications || notifications.length === 0) return;

      // Agrupar por tipo e título
      const grouped = notifications.reduce(
        (acc, notification) => {
          const key = `${notification.type}_${notification.title}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(notification);
          return acc;
        },
        {} as Record<string, any[]>,
      );

      // Identificar e remover duplicatas
      const toDelete: string[] = [];
      Object.keys(grouped).forEach((key) => {
        const group = grouped[key];
        if (group.length > 1) {
          console.log(`⚠️ Encontradas ${group.length} duplicatas para: ${key}`);
          // Manter apenas a mais recente, deletar as outras
          const sorted = group.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
          sorted.slice(1).forEach((notification) => {
            toDelete.push(notification.id);
          });
        }
      });

      if (toDelete.length > 0) {
        console.log(
          `🗑️ Removendo ${toDelete.length} notificações duplicadas...`,
        );
        const { error: deleteError } = await supabase
          .from("notifications")
          .delete()
          .in("id", toDelete);

        if (deleteError) {
          console.error("❌ Erro ao remover duplicatas:", deleteError);
        } else {
          console.log("✅ Duplicatas removidas com sucesso!");
        }
      }
    } catch (error) {
      console.error("❌ Erro ao verificar duplicatas:", error);
    }
  }
}
