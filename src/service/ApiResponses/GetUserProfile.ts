// Type for user profile response
export type GetUserProfileApiResponse = {
  id: string;
  email: string;
  name: any;
  profilePicture: any;
  provider: string;
  assignedNumber: number;
  joinedPosition: number;
  createdAt: string;
  totalDonations: number;
  hasPaymentMethod: boolean;
  hasSubscription: boolean;
  subscriptionStatus: string;
  stripeCustomerId: string;
  globalStats: GlobalStats;
  badges: Badges;
};

export interface GlobalStats {
  totalDonors: number;
  totalDonationsGenerated: number;
  activeSubscribers: number;
}

export interface Badges {
  userId: string;
  growthBadges: GrowthBadge[];
  communityBadge: CommunityBadge;
  impactBadges: any[];
  artBadges: any[];
  totalBadges: number;
  unclaimedCount: number;
}

export interface GrowthBadge {
  id: string;
  userId: string;
  badge: Badge;
  isClaimed: boolean;
  claimedAt: any;
  awardedAt: string;
  metadata: Metadata;
}

export interface Badge {
  id: string;
  category: string;
  name: string;
  title: string;
  description: string;
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

export interface CommunityBadge {
  id: string;
  userId: string;
  badge: Badge2;
  isClaimed: boolean;
  claimedAt: any;
  awardedAt: string;
  metadata: Metadata2;
}

export interface Badge2 {
  id: string;
  category: string;
  name: string;
  title: string;
  description: string;
  iconPngUrl: string;
  requirement: Requirement2;
  sortOrder: number;
  isPermanent: boolean;
  canReset: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Requirement2 {
  userNumberMin: number;
  userNumberMax: number;
}

export interface Metadata2 {
  userNumber: number;
  achievedAt: string;
}
