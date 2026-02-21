import { supabase } from "@/lib/supabase";
import { Report, CreateReportDTO } from "../types";

export const reportService = {
  async getUserReports(userId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from("reports")
      .select(
        `
                *,
                reporter:reporter_id(id, full_name, avatar_url, email),
                reported_user:reported_user_id(id, full_name, avatar_url, email),
                reported_post:reported_post_id(*),
                reported_story:reported_story_id(image_url),
                reported_classified:reported_classified_id(*),
                reported_message:reported_message_id(id, content, conversation_id, sender_id, created_at)
            `,
      )
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Report[];
  },

  async getReportById(reportId: string): Promise<Report> {
    const { data, error } = await supabase
      .from("reports")
      .select(
        `
                *,
                reporter:reporter_id(id, full_name, avatar_url, email),
                reported_user:reported_user_id(id, full_name, avatar_url, email),
                reported_post:reported_post_id(*),
                reported_story:reported_story_id(image_url),
                reported_classified:reported_classified_id(*),
                reported_message:reported_message_id(id, content, conversation_id, sender_id, created_at)
            `,
      )
      .eq("id", reportId)
      .single();

    if (error) throw error;
    return data as Report;
  },

  async createReport(userId: string, data: CreateReportDTO): Promise<Report> {
    const insertData: any = {
      reporter_id: userId,
      type: data.type,
      reason: data.reason,
      description: data.description,
      priority: data.priority,
      reported_user_id:
        data.reportedUserId || (data.type === "user" ? data.targetId : null),
    };

    // Specific content IDs
    if (data.type === "post") insertData.reported_post_id = data.targetId;
    if (data.type === "message") insertData.reported_message_id = data.targetId;
    if (data.type === "classified")
      insertData.reported_classified_id = data.targetId;
    if (data.type === "story") insertData.reported_story_id = data.targetId;

    const { data: inserted, error } = await supabase
      .from("reports")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return inserted as Report;
  },

  async getAllReportsForAdmin(): Promise<Report[]> {
    const { data, error } = await supabase
      .from("reports")
      .select(
        `
                *,
                reporter:reporter_id(id, full_name, avatar_url, email),
                reported_user:reported_user_id(id, full_name, avatar_url, email),
                reported_post:reported_post_id(*),
                reported_story:reported_story_id(image_url),
                reported_classified:reported_classified_id(*),
                reported_message:reported_message_id(id, content, conversation_id, sender_id, created_at)
            `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Report[];
  },

  async updateReportStatus(
    reportId: string,
    status: string,
    resolution?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("reports")
      .update({
        status,
        resolution,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (error) throw error;
  },

  async deleteReport(reportId: string): Promise<void> {
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);

    if (error) throw error;
  },
};
