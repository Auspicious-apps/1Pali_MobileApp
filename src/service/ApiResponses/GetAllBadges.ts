export interface GetAllBadgesResponse {
  badges: Badge[];
  totalBadges: number;
  unlockedCount: number;
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
  isUnlocked: boolean;
}

export interface Requirement {
  totalShares?: number;
  userNumberMin?: number;
  userNumberMax?: number;
  consecutiveMonths?: number;
  totalDonations?: number;
  monthsRequired?: number;
}
