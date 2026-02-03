export interface AppleSigninResponse {
  user: User;
  tokens: Tokens;
  isNewUser: boolean;
}

export interface User {
  id: string;
  email: string;
  name: any;
  profilePicture: any;
  provider: string;
  assignedNumber: any;
  joinedPosition: number;
  createdAt: string;
  hasPaymentMethod: boolean;
  hasSubscription: boolean;
  subscriptionStatus: string;
  stripeCustomerId: string;
  user: User2;
}

export interface User2 {
  id: string;
  email: string;
  name: string;
  profilePicture: string;
  provider: string;
  assignedNumber: number;
  joinedPosition: number;
  createdAt: string;
  totalDonations: number;
  hasPaymentMethod: boolean;
  consecutivePaidMonths: string;
  hasSubscription: boolean;
  subscriptionStatus: string;
  stripeCustomerId: string;
  globalStats: GlobalStats;
  badges: Badges;
  stripePriceId: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
  nextGrowthBadge: NextGrowthBadge;
}

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
  iconPngUrl: string;
  requirement: Requirement;
  milestone: string;

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

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
