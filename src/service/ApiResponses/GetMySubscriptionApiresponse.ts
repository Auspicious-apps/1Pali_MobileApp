export interface GetMySubscriptionResponse {
  id: string;
  status: string;
  platform: string;
  amount: number;
  currency: string;
  subscribedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: any;
  stripeSubscriptionId: string;
  stripePriceId: string;
  includedProcessingFees: boolean;
  nextBillingDate: string;
  priceDetails: PriceDetails;
  baseDonationAmount: number;
  hasOptedInForProcessingFees: boolean;
}

export interface PriceDetails {
  id: string;
  amount: number;
  currency: string;
  interval: string;
  nickname: string;
}
