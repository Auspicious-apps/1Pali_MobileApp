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
  stripePriceId: string;
  consecutivePaidMonths: number;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
  defaultPaymentMethodId: string;
  subscribedAt: string;
  globalStats: GlobalStats;
  badges: Badges;
  nextGrowthBadge: NextGrowthBadge;
  nextCommunityMilestone: NextCommunityMilestone;
  fcmToken: string;
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
  viewedAt: string;
  awardedAt: string;
  metadata: Metadata;
  visibility: Visibility;
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
  threshold?: number;
  userNumberMin?: number;
  userNumberMax?: number;
  consecutiveMonths?: number;
  totalShares?: number;
}

export interface Metadata {
  consecutiveMonths?: number;
  achievedAt?: string;
  joinedPosition?: number;
  awardedAt?: string;
}

export interface Visibility {
  isVisible: boolean;
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

export interface NextCommunityMilestone {
  name: string;
  threshold: number;
  usersUntilUnlock: number;
  communityProgressPercentage: number;
  totalCommunityUsers: number;
  requirement: Requirement3;
  milestone: Milestone;
}

export interface Requirement3 {
  threshold: number;
}

export interface Milestone {
  threshold: number;
  achieved: boolean;
  totalUsersAt: any;
  achievedAt: any;
}