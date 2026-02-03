import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParams = {
  splash: undefined;
  OnBoardingStack: NavigatorScreenParams<OnBoardingStackParams>;
  MainStack: NavigatorScreenParams<MainStackParams>;
};

export type OnBoardingStackParams = {
  onboarding: undefined;
  onePaliWorks: undefined;
  claimSpot: undefined;
  missionIntro: undefined;
  joinOnePali: undefined;
};

export type MainStackParams = {
  tabs: NavigatorScreenParams<BottomStackParams>;
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
  updatesStack: NavigatorScreenParams<UpdateStackParams>;
  artStack: NavigatorScreenParams<ArtStackParams>;
  accountStack: NavigatorScreenParams<AccountStackParams>;
};

// SPLASH SCREEN
export type SplashScreenProps = NativeStackScreenProps<
  RootStackParams,
  "splash"
>;

// ONBOARDING SCREENS
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
  UpdateStackParams,
  "updateDetail"
>;

// ----------------   ART SCREENS ---------------------
export type ArtDetailScreenProps = NativeStackScreenProps<
  ArtStackParams,
  "artDetail"
>;

// ----------------   ACCOUNT SCREENS ---------------------
export type BadgesScreenProps = NativeStackScreenProps<
  AccountStackParams,
  "badges"
>;
export type TermsConditionsScreenProps = NativeStackScreenProps<
  AccountStackParams,
  "termsConditions"
>;
export type PrivacyPolicyScreenProps = NativeStackScreenProps<
  AccountStackParams,
  "privacyPolicy"
>;
export type ReceiptsScreenProps = NativeStackScreenProps<
  AccountStackParams,
  "receipts"
>;
export type ManageDonationScreenProps = NativeStackScreenProps<
  AccountStackParams,
  "manageDonation"
>;
export type FaqScreenProps = NativeStackScreenProps<
  AccountStackParams & BottomStackParams & MainStackParams & RootStackParams,
  "faq"
>;
