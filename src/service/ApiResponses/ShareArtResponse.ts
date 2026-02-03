export interface ShareArtResponse {
  success: boolean;
  sharesCount: number;
  platform: string;
  userShareCount: number;
  newBadges: BadgesAwarded[];
}

export interface BadgesAwarded {
  id: string;
  userId: string;
  badge: Badge;
  isViewed: boolean;
  viewedAt: any;
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
  totalShares: number;
}

export interface Metadata {
  totalShares: number;
  achievedAt: string;
}
