import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParams = {
  splashInitial: undefined;
  OnBoardingStack: NavigatorScreenParams<OnBoardingStackParams>;
  MainStack: NavigatorScreenParams<MainStackParams>;
};

export type OnBoardingStackParams = {
  splash: undefined;
  onboarding: undefined;
  onePaliWorks: undefined;
  claimSpot: undefined;
  missionIntro?: { showNumber?: boolean };
  joinOnePali: undefined;
  signIn: undefined;
};

export type MainStackParams = {
  tabs: NavigatorScreenParams<BottomStackParams>;
  updateDetail: { blogId: string };
  artDetail: { ArtId: string };

  // Account Screen
  termsConditions: undefined;
  privacyPolicy: undefined;
  receipts: undefined;
  manageDonation: undefined;
  badges: undefined;
  faq: undefined;
};

export type UpdateStackParams = {
  updates: undefined;
  updateDetail: { blogId: string };
};

export type ArtStackParams = {
  art: undefined;
  artDetail: { ArtId: string };
};

export type AccountStackParams = {
  account: undefined;
  termsConditions: undefined;
  privacyPolicy: undefined;
  receipts: undefined;
  manageDonation: undefined;
  badges: undefined;
  faq: undefined;
};

export type BottomStackParams = {
  home: undefined;
  updates: undefined;
  art: undefined;
  account: undefined;
};

// SPLASH SCREEN
export type SplashInitialScreenProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  "splashInitial"
>;

// ONBOARDING SCREENS
export type SplashScreenProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  "splash"
>;
export type OnboardingProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  "onboarding"
>;
export type onePaliWorksProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  "onePaliWorks"
>;
export type ClaimSpotProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  "claimSpot"
>;
export type MissionIntroProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams & MainStackParams & BottomStackParams,
  "missionIntro"
>;
export type JoinOnePaliProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  "joinOnePali"
>;
export type SignInProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  "signIn"
>;

// ----------------   MAIN SCREENS ---------------------
export type HomeScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  "home"
>;
export type UpdatesScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  "updates"
>;
export type ArtScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  "art"
>;
export type AccountScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  "account"
>;

// ----------------   UPDATES SCREENS ---------------------
export type UpdateDetailScreenProps = NativeStackScreenProps<
  MainStackParams,
  "updateDetail"
>;

// ----------------   ART SCREENS ---------------------
export type ArtDetailScreenProps = NativeStackScreenProps<
  MainStackParams,
  "artDetail"
>;

// ----------------   ACCOUNT SCREENS ---------------------
export type BadgesScreenProps = NativeStackScreenProps<
  MainStackParams,
  "badges"
>;
export type TermsConditionsScreenProps = NativeStackScreenProps<
  MainStackParams,
  "termsConditions"
>;
export type PrivacyPolicyScreenProps = NativeStackScreenProps<
  MainStackParams,
  "privacyPolicy"
>;
export type ReceiptsScreenProps = NativeStackScreenProps<
  MainStackParams,
  "receipts"
>;
export type ManageDonationScreenProps = NativeStackScreenProps<
  MainStackParams,
  "manageDonation"
>;
export type FaqScreenProps = NativeStackScreenProps<
  MainStackParams & BottomStackParams & RootStackParams,
  "faq"
>;
