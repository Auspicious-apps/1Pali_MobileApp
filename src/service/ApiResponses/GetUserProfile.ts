// Type for user profile response
export type GetUserProfileApiResponse = {
  id: string;
  email: string;
  name: string;
  profilePicture: string;
  provider: string;
  assignedNumber: number;
  consecutivePaidMonths: string;
  joinedPosition: number;
  createdAt: string;
  totalDonations: number;
  hasPaymentMethod: boolean;
  hasSubscription: boolean;
  subscriptionStatus: string;
  stripeCustomerId: string;
  stripePriceId: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
  globalStats: GlobalStats;
  nextGrowthBadge: NextGrowthBadge;
  badges: Badges;
};

export interface GlobalStats {
  totalDonors: number;
  totalDonationsGenerated: number;
  activeSubscribers: number;
}

export interface Badges {
  userId: string;
  badges: Badge[];
  totalBadges: number;
  unviewedCount: number;
}

export interface Badge {
  id: string;
  userId: string;
  badge: Badge2;
  isViewed: boolean;
  viewedAt: any;
  awardedAt: string;
  metadata: Metadata;
}

export interface Badge2 {
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
  totalDonations?: number;
  monthsRequired?: number;
  userNumberMin?: number;
  userNumberMax?: number;
  consecutiveMonths?: number;
}

export interface Metadata {
  totalDonations?: number;
  achievedAt: string;
  userNumber?: number;
  consecutiveMonths?: number;
}

export interface NextGrowthBadge {
  id: string;
  name: string;
  title: string;
  description: string;
  iconPngUrl: string;
  unlocksAt: number;
  monthsRemaining: number;
  currentProgress: number;
  requirement: Requirement2;
  progressPercentage: number;
}

export interface Requirement2 {
  consecutiveMonths: number;
}
