export interface ConsfirmSetupIntentApiResponse {
  paymentMethodSaved: boolean;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  assignedNumber: number;
  message: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture: string;
  provider: string;
  assignedNumber: number;
  joinedPosition: number;
  consecutivePaidMonths: string;
  createdAt: string;
  totalDonations: number;
  hasPaymentMethod: boolean;
  hasSubscription: boolean;
  subscriptionStatus: string;
  stripeCustomerId: string;
  globalStats: GlobalStats;
  badges: Badges;
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
  milestone: string;
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
