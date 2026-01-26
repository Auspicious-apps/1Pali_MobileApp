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
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}