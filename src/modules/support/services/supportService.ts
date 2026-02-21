import { supabase } from "@/lib/supabase";
import type {
  SupportTicket,
  SupportTicketMessage,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportSenderType,
  CreateTicketDTO,
} from "../types";

const SLA_HOURS: Record<SupportTicketPriority, number> = {
  urgente: 2,
  alta: 8,
  media: 24,
  baixa: 48,
};

export const supportService = {
  // --- Helpers ---

  calculateSLADeadline(
    priority: SupportTicketPriority,
    fromDate: Date = new Date(),
  ): string {
    const hours = SLA_HOURS[priority];
    let deadline = new Date(fromDate);
    let remainingHours = hours;

    while (remainingHours > 0) {
      deadline.setUTCHours(deadline.getUTCHours() + 1);

      const day = deadline.getUTCDay();
      const hour = deadline.getUTCHours();

      // Skip weekends (0 = Sunday, 6 = Saturday) and non-business hours (before 9, after 18 UTC)
      // Note: We are assuming UTC matches the business hours for this simplified test,
      // but in production we should match the users local time or a configured timezone.
      const isWeekend = day === 0 || day === 6;
      const isBusinessHour = hour >= 9 && hour < 18;

      if (!isWeekend && isBusinessHour) {
        remainingHours--;
      }
    }

    return deadline.toISOString();
  },

  async logAction(
    ticketId: string,
    performedBy: string,
    actionType: string,
    oldVal?: string | null,
    newVal?: string | null,
  ) {
    return supabase.from("support_ticket_logs").insert({
      ticket_id: ticketId,
      performed_by: performedBy,
      action_type: actionType,
      old_value: oldVal,
      new_value: newVal,
    });
  },

  async createNotification(
    userId: string,
    ticketId: string,
    type: string,
    content: string,
  ) {
    let title = "Suporte ConfiLar";
    let action_url = `/ajuda?ticket_id=${ticketId}`;

    if (type === "status_update") {
      title = "Atualização de Status (Suporte)";
    } else if (type === "new_message") {
      title = "Nova resposta no ticket";
    }

    return supabase.from("notifications").insert({
      user_id: userId,
      type: "message",
      title,
      message: content,
      action_url,
      priority: "normal",
      metadata: { ticket_id: ticketId, is_support: true, original_type: type },
    });
  },

  async notifyAdmins(ticketId: string, content: string) {
    const { data: admins } = await supabase
      .from("admins")
      .select("user_id")
      .eq("is_active", true);
    if (!admins) return;

    const notifications = admins.map((admin) => ({
      user_id: admin.user_id,
      type: "system",
      title: "Alerta Administrativo (Suporte)",
      message: content,
      action_url: `/gestao-confi/dashboard/tickets/${ticketId}`,
      priority: "normal",
      metadata: {
        ticket_id: ticketId,
        is_support: true,
        original_type: "admin_alert",
      },
    }));

    return supabase.from("notifications").insert(notifications);
  },

  // --- Tickets ---

  async createTicket(
    userId: string,
    data: CreateTicketDTO,
  ): Promise<SupportTicket> {
    const slaDeadline = this.calculateSLADeadline(data.priority);

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject: data.subject,
        category: data.category,
        priority: data.priority,
        status: "aberto",
        sla_deadline: slaDeadline,
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Insert initial message
    const { error: msgError } = await supabase
      .from("support_ticket_messages")
      .insert({
        ticket_id: ticket.id,
        sender_id: userId,
        sender_type: "user",
        message: data.initial_message,
      });

    if (msgError) throw msgError;

    // Notify admins about new ticket
    await this.notifyAdmins(ticket.id, `Novo ticket criado: ${data.subject}`);

    return ticket;
  },

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getTicketById(ticketId: string): Promise<SupportTicket> {
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .select("*, support_ticket_messages(*)")
      .eq("id", ticketId)
      .order("created_at", {
        foreignTable: "support_ticket_messages",
        ascending: true,
      })
      .single();

    if (error) throw error;

    // Fetch profile manually to avoid foreign key issues
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, user_type, is_pro")
      .eq("id", ticket.user_id)
      .single();

    return {
      ...ticket,
      messages: ticket.support_ticket_messages || [],
      profiles: profile || {
        full_name: "Usuário Desconhecido",
        avatar_url: "",
      },
    } as SupportTicket;
  },

  // --- Messages ---

  async sendMessage(
    ticketId: string,
    senderId: string,
    senderType: SupportSenderType,
    message: string,
  ): Promise<SupportTicketMessage> {
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("first_response_at")
      .eq("id", ticketId)
      .single();

    const { data, error } = await supabase
      .from("support_ticket_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_type: senderType,
        message,
      })
      .select()
      .single();

    if (error) throw error;

    const updateData: any = { updated_at: new Date().toISOString() };

    // Mark first response if moderator responds for the first time
    if (senderType === "moderator" && ticket && !ticket.first_response_at) {
      updateData.first_response_at = new Date().toISOString();
    }

    await supabase
      .from("support_tickets")
      .update(updateData)
      .eq("id", ticketId);

    // Notify recipient
    const { data: ticketData } = await supabase
      .from("support_tickets")
      .select("user_id, assigned_to, subject")
      .eq("id", ticketId)
      .single();

    if (senderType === "moderator" && ticketData) {
      await this.createNotification(
        ticketData.user_id,
        ticketId,
        "new_message",
        `Nova resposta no ticket: ${ticketData.subject}`,
      );
    } else if (senderType === "user" && ticketData && ticketData.assigned_to) {
      await this.createNotification(
        ticketData.assigned_to,
        ticketId,
        "user_reply",
        `O usuário respondeu ao ticket: ${ticketData.subject}`,
      );
    } else if (senderType === "user" && ticketData && !ticketData.assigned_to) {
      await this.notifyAdmins(
        ticketId,
        `Nova mensagem no ticket (Não atribuído): ${ticketData.subject}`,
      );
    }

    return data;
  },

  // --- Admin/Moderator Actions ---

  async updateTicketStatus(
    ticketId: string,
    performedBy: string,
    status: SupportTicketStatus,
  ): Promise<void> {
    const { data: current } = await supabase
      .from("support_tickets")
      .select("status")
      .eq("id", ticketId)
      .single();

    const updateData: any = { status, updated_at: new Date().toISOString() };

    if (status === "resolvido") {
      updateData.resolved_at = new Date().toISOString();
    } else if (status === "fechado") {
      updateData.closed_at = new Date().toISOString();
    } else if (status === "reaberto") {
      updateData.reopened_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("support_tickets")
      .update(updateData)
      .eq("id", ticketId);

    if (error) throw error;

    // Log the change
    if (current && current.status !== status) {
      await this.logAction(
        ticketId,
        performedBy,
        "status_change",
        current.status,
        status,
      );

      // Notify user about status change
      const { data: ticket } = await supabase
        .from("support_tickets")
        .select("user_id, subject")
        .eq("id", ticketId)
        .single();
      if (ticket) {
        await this.createNotification(
          ticket.user_id,
          ticketId,
          "status_update",
          `O status do seu ticket "${ticket.subject}" foi alterado para ${status}`,
        );
      }
    }
  },

  async updateTicketPriority(
    ticketId: string,
    performedBy: string,
    priority: SupportTicketPriority,
  ): Promise<void> {
    const { data: current } = await supabase
      .from("support_tickets")
      .select("priority, created_at")
      .eq("id", ticketId)
      .single();

    const newSla = this.calculateSLADeadline(
      priority,
      new Date(current?.created_at || new Date()),
    );

    const { error } = await supabase
      .from("support_tickets")
      .update({
        priority,
        sla_deadline: newSla,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (error) throw error;

    if (current && current.priority !== priority) {
      await this.logAction(
        ticketId,
        performedBy,
        "priority_change",
        current.priority,
        priority,
      );
    }
  },

  async assignTicket(ticketId: string, adminId: string): Promise<void> {
    const { data: current } = await supabase
      .from("support_tickets")
      .select("assigned_to")
      .eq("id", ticketId)
      .single();

    const { error } = await supabase
      .from("support_tickets")
      .update({
        assigned_to: adminId,
        status: "em_andamento",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (error) throw error;

    await this.logAction(
      ticketId,
      adminId,
      "assigned",
      current?.assigned_to || "none",
      adminId,
    );

    // Notify user
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("user_id, subject")
      .eq("id", ticketId)
      .single();
    if (ticket) {
      await this.createNotification(
        ticket.user_id,
        ticketId,
        "assigned",
        `Seu ticket "${ticket.subject}" foi atribuído a um moderador.`,
      );
    }
  },

  async getAllTicketsForAdmin(): Promise<SupportTicket[]> {
    const { data: tickets, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!tickets || tickets.length === 0) return [];

    const userIds = Array.from(
      new Set(tickets.map((t) => t.user_id).filter(Boolean)),
    );

    if (userIds.length === 0) return tickets as SupportTicket[];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, user_type, is_pro")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    return tickets.map((t) => ({
      ...t,
      profiles: profileMap.get(t.user_id) || {
        full_name: "Usuário Desconhecido",
        avatar_url: "",
      },
    })) as SupportTicket[];
  },

  // --- Categories, Macros & Ratings ---

  async getCategories() {
    const { data, error } = await supabase
      .from("support_categories")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return data;
  },

  async getMacros() {
    const { data, error } = await supabase
      .from("support_macros")
      .select("*")
      .order("title");
    if (error) throw error;
    return data;
  },

  async submitRating(ticketId: string, rating: number, feedback?: string) {
    const { error } = await supabase.from("support_ticket_ratings").upsert({
      ticket_id: ticketId,
      rating,
      feedback,
    });
    if (error) throw error;
  },

  async getAdvancedMetrics() {
    // This would ideally be a database function or view for performance
    const { data: tickets } = await supabase
      .from("support_tickets")
      .select("*");
    const { data: ratings } = await supabase
      .from("support_ticket_ratings")
      .select("rating");

    const total = tickets?.length || 0;
    const resolved =
      tickets?.filter((t) => t.status === "resolvido").length || 0;
    const closed = tickets?.filter((t) => t.status === "fechado").length || 0;
    const overdue =
      tickets?.filter(
        (t) =>
          t.sla_deadline &&
          new Date(t.sla_deadline) < new Date() &&
          t.status !== "resolvido" &&
          t.status !== "fechado",
      ).length || 0;

    const avgRating =
      ratings && ratings.length > 0
        ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
        : 0;

    // Calculate average response time
    const ticketsWithResp =
      tickets?.filter((t) => t.first_response_at && t.created_at) || [];
    const avgRespTimeMs =
      ticketsWithResp.length > 0
        ? ticketsWithResp.reduce((acc, t) => {
            const diff =
              new Date(t.first_response_at).getTime() -
              new Date(t.created_at).getTime();
            return acc + diff;
          }, 0) / ticketsWithResp.length
        : 0;

    // Group by category
    const categories: Record<string, number> = {};
    tickets?.forEach((t) => {
      categories[t.category] = (categories[t.category] || 0) + 1;
    });

    return {
      total_tickets: total,
      resolved_tickets: resolved,
      closed_tickets: closed,
      overdue_tickets: overdue,
      avg_rating: avgRating,
      avg_response_time_hours: avgRespTimeMs / (1000 * 60 * 60),
      tickets_per_category: Object.entries(categories).map(
        ([category, count]) => ({ category, count }),
      ),
    };
  },
};
