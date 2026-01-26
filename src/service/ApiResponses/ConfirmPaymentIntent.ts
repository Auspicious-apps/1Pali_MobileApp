export interface ConfirmPaymentIntentResponse {
  paymentMethodSaved: boolean;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  message: string;
}
