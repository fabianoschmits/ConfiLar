/**
 * TypeScript types for help system
 */

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  question_example: string | null;
  answer: string;
  action_type: "link" | "email" | null;
  action_value: string | null;
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpSearchResult {
  article: HelpArticle;
  score: number;
  confidence: number;
}

export interface HelpMessage {
  id: string;
  type: "user" | "bot" | "admin" | "system";
  content: string;
  timestamp: Date;
  article?: HelpArticle;
}

export interface HelpLogEntry {
  id?: string;
  user_id?: string | null;
  user_message: string;
  matched_article_id?: string | null;
  created_at?: string;
}

export interface HelpChatState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: HelpMessage[];
  isLoading: boolean;
}

export interface QuickSuggestion {
  id: string;
  label: string;
  query: string;
  icon?: string;
}
