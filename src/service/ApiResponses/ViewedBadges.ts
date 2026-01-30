export interface ViewedBadgesResponse {
  viewedBadges: ViewedBadge[];
  count: number;
  message: string;
}

export interface ViewedBadge {
  id: string;
  userId: string;
  badge: Badge;
  isViewed: boolean;
  viewedAt: string;
  awardedAt: string;
  metadata: Metadata;
}

export interface Badge {
  id: string;
  category: string;
  name: string;
  title: string;
  description: string;
  milestone: string;
  iconPngUrl: string;
  requirement: Requirement;
  sortOrder: number;
  isPermanent: boolean;
  canReset: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Requirement {
  consecutiveMonths: number;
}

export interface Metadata {
  consecutiveMonths: number;
  achievedAt: string;
}
