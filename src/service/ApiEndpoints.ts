const ENDPOINTS = {
  CheckNumberAvailable: "api/v1/numbers/check",
  ReserveSpecificNumber: "api/v1/numbers/reserve",
  GoogleSignin: "api/v1/auth/google",
  GetUserProfile: "api/v1/auth/profile",
  RefreshToken: "api/v1/auth/refresh",
  AppleSignin: "api/v1/auth/apple",
  RandomNumberReservation: "api/v1/numbers/reserve",
  GetRandomNumber: "api/v1/numbers/random",
  GetStripePlans: "api/v1/subscription/plans",
  CreateSetupIntent: "api/v1/subscription/setup-intent",
  ConfirmSetupIntent: "api/v1/subscription/confirm-setup-intent",
  CollectBadges: "api/v1/badges/claim"
};

export default ENDPOINTS;
