export interface Collection {
  id: string;
  name: string;
  color: string;
  icon: string;
  isSystem?: boolean;
  parentId?: string | null; // Unlimited nested subcollections
  createdAt: number;
}

export interface SavedItem {
  id: string;
  url: string;
  title: string;
  description: string;
  source: string; // "TikTok", "Instagram", "Pinterest", "X", "YouTube", "Web"
  collectionId: string;
  isPinned: boolean;
  isReviewed: boolean;
  tags: string[];
  notes: string;
  createdAt: number;
  image?: string;
  author?: string;
}

export type SortOption = "newest" | "oldest" | "title" | "unreviewed";

export interface AppSettings {
  darkMode: boolean;
  homeTitle: [string, string];
  cloudSyncEnabled: boolean;
  autoExtractMetadata: boolean;
  lastBackupDate?: string;
}

