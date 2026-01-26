import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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

export type BottomStackParams = {
  home: { number?: number } | undefined;
  updates: undefined;
  art: undefined;
  account: { number?: string } | undefined;
  badges: undefined;
  updateDetail: undefined;
  artDetail: undefined;
  termsConditions: undefined;
  privacyPolicy: undefined;
  receipts: undefined;
  manageDonation: undefined;
};

// SPLASH SCREEN
export type SplashScreenProps = NativeStackScreenProps<
  RootStackParams,
  "splash"
>;
// ONBOARDING SCREENS
export type OnboardingProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  'onboarding'
>;
export type onePaliWorksProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  'onePaliWorks'
>;
export type ClaimSpotProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  'claimSpot'
>;
export type MissionIntroProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams & MainStackParams & BottomStackParams,
  "missionIntro"
>;
export type JoinOnePaliProps = NativeStackScreenProps<
  RootStackParams & OnBoardingStackParams,
  'joinOnePali'
>;

// ----------------   MAIN SCREENS ---------------------
 
export type HomeScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  'home'
>;
export type UpdatesScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  'updates'
>;
export type ArtScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  'art'
>;
export type AccountScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  'account'
>;
export type BadgesScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  'badges'
>;
export type UpdateDetailScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  'updateDetail'
>;
export type ArtDetailScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  'artDetail'
>;
export type TermsConditionsScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  'termsConditions'
>;
export type PrivacyPolicyScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  'privacyPolicy'
>;
export type ReceiptsScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  'receipts'
>;
export type ManageDonationScreenProps = NativeStackScreenProps<
  BottomStackParams & MainStackParams & RootStackParams,
  "manageDonation"
>;
