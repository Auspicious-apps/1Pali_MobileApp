export interface GetAllStripeePlansResponse {
  plans: Plan[];
  totalPlans: number;
}

export interface Plan {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  nickname: string;
  type: string;
  active: boolean;
  createdAt: string;
}
