export type SupportTicketStatus =
  | "aberto"
  | "em_andamento"
  | "aguardando_usuario"
  | "resolvido"
  | "fechado"
  | "reaberto";
export type SupportTicketPriority = "baixa" | "media" | "alta" | "urgente";
export type SupportSenderType = "user" | "moderator";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  assigned_to: string | null;
  first_response_at: string | null;
  sla_deadline: string | null;
  resolved_at: string | null;
  reopened_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  // Optional relations
  messages?: SupportTicketMessage[];
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface SupportTicketLog {
  id: string;
  ticket_id: string;
  action_type:
    | "status_change"
    | "priority_change"
    | "assigned"
    | "reopened"
    | "closed";
  old_value: string | null;
  new_value: string | null;
  performed_by: string;
  created_at: string;
}

export interface SupportCategory {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface SupportMacro {
  id: string;
  title: string;
  content: string;
  created_by: string | null;
  created_at: string;
}

export interface SupportTicketRating {
  ticket_id: string;
  rating: number;
  feedback: string | null;
  rated_at: string;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: SupportSenderType;
  message: string;
  attachments: any;
  created_at: string;
}

export interface SupportTicketNotification {
  id: string;
  user_id: string;
  ticket_id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateTicketDTO {
  subject: string;
  category: string;
  priority: SupportTicketPriority;
  initial_message: string;
}
