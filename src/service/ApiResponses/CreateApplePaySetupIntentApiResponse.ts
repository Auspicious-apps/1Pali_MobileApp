export interface CreateApplePaySetupIntentApiResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}
