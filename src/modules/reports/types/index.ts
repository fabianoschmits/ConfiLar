export type ReportType =
  | "user"
  | "post"
  | "message"
  | "review"
  | "classified"
  | "comment"
  | "story"
  | "other";
export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";
export type ReportPriority = "low" | "medium" | "high" | "urgent";

export interface Report {
  id: string;
  type: ReportType;
  reason: string;
  description: string;
  status: ReportStatus;
  priority: ReportPriority;
  reporter_id: string;
  reported_user_id?: string;
  reported_post_id?: string;
  reported_message_id?: string;
  reported_classified_id?: string;
  reported_story_id?: string;
  admin_notes?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;

  // Joins / Related Data
  reporter?: {
    full_name: string;
    avatar_url: string;
    email: string;
  };
  reported_user?: {
    full_name: string;
    avatar_url: string;
    email: string;
  };
  reported_post?: {
    content: string;
    images?: string[];
    [key: string]: any;
  };
  reported_story?: {
    image_url: string;
  };
  reported_classified?: {
    title: string;
    description: string;
    images?: string[];
    [key: string]: any;
  };
  reported_message?: {
    id?: string;
    content: string;
    conversation_id?: string;
    sender_id?: string;
    created_at?: string;
  };
}

export interface CreateReportDTO {
  type: ReportType;
  reason: string;
  description: string;
  priority: ReportPriority;
  targetId: string;
  reportedUserId?: string;
}
