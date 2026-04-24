export interface CreateSetupIntentResponse {
  setupIntentId: string;
  clientSecret: string;
  customerId: string;
  timerExtended?: boolean;
  newExpirationTime?: string;
}
