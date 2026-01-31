import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import "react-native-gesture-handler";
import BottomTabBar from "../components/BottomTabBar";
import Account from "../screens/Account";
import Art from "../screens/Art";
import ArtDetail from "../screens/ArtDetail";
import Badges from "../screens/Badges";
import ClaimSpot from "../screens/ClaimSpot";
import Home from "../screens/Home";
import JoinOnePali from "../screens/JoinOnePali";
import ManageDonation from "../screens/ManageDonation";
import MissionIntro from "../screens/MissionIntro";
import Onboarding from "../screens/Onboarding";
import OnePaliWorks from "../screens/OnePaliWorks";
import PrivacyPolicy from "../screens/PrivacyPolicy";
import ReceiptsScreen from "../screens/ReceiptsScreen";
import Splash from "../screens/Splash";
import TermsConditions from "../screens/TermsConditions";
import UpdateDetail from "../screens/UpdateDetail";
import Updates from "../screens/Updates";
import {
  AccountStackParams,
  ArtStackParams,
  BottomStackParams,
  MainStackParams,
  OnBoardingStackParams,
  RootStackParams,
  UpdateStackParams,
} from "../typings/routes";
import FAQ from "../screens/FAQ";

const Stack = createNativeStackNavigator<RootStackParams>();
const OnBoardingStackNavigator =
  createNativeStackNavigator<OnBoardingStackParams>();

const Main = createNativeStackNavigator<MainStackParams>();
const Tabs = createBottomTabNavigator<BottomStackParams>();

const UpdateStack = createNativeStackNavigator<UpdateStackParams>();
const ArtStack = createNativeStackNavigator<ArtStackParams>();
const AccountStack = createNativeStackNavigator<AccountStackParams>();

const navigatorScreenOptions = {
  headerShown: false,
  animation: "ios_from_right" as const,
};

function OnBoardingStack() {
  return (
    <OnBoardingStackNavigator.Navigator screenOptions={navigatorScreenOptions}>
      <OnBoardingStackNavigator.Screen
        name="onboarding"
        component={Onboarding}
      />
      <OnBoardingStackNavigator.Screen
        name="onePaliWorks"
        component={OnePaliWorks}
      />
      <OnBoardingStackNavigator.Screen name="claimSpot" component={ClaimSpot} />
      <OnBoardingStackNavigator.Screen
        name="missionIntro"
        component={MissionIntro}
      />
      <OnBoardingStackNavigator.Screen
        name="joinOnePali"
        component={JoinOnePali}
      />
    </OnBoardingStackNavigator.Navigator>
  );
}

function UpdatesStack() {
  return (
    <UpdateStack.Navigator screenOptions={navigatorScreenOptions}>
      <UpdateStack.Screen name="updates" component={Updates} />
      <UpdateStack.Screen name="updateDetail" component={UpdateDetail} />
    </UpdateStack.Navigator>
  );
}

function ArtStackRoutes() {
  return (
    <ArtStack.Navigator screenOptions={navigatorScreenOptions}>
      <ArtStack.Screen name="art" component={Art} />
      <ArtStack.Screen name="artDetail" component={ArtDetail} />
    </ArtStack.Navigator>
  );
}

function AccountStackRoutes() {
  return (
    <AccountStack.Navigator screenOptions={navigatorScreenOptions}>
      <AccountStack.Screen name="account" component={Account} />
      <AccountStack.Screen name="termsConditions" component={TermsConditions} />
      <AccountStack.Screen name="privacyPolicy" component={PrivacyPolicy} />
      <AccountStack.Screen name="receipts" component={ReceiptsScreen} />
      <AccountStack.Screen name="manageDonation" component={ManageDonation} />
      <AccountStack.Screen name="badges" component={Badges} />
      <AccountStack.Screen name="faq" component={FAQ} />
    </AccountStack.Navigator>
  );
}

export default function Routes() {
  const tabStack: React.FC<any> = ({ route }) => {
    return (
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <BottomTabBar {...props} />}
      >
        <Tabs.Screen name="home" component={Home} />
        <Tabs.Screen name="updatesStack" component={UpdatesStack} />
        <Tabs.Screen name="artStack" component={ArtStackRoutes} />
        <Tabs.Screen name="accountStack" component={AccountStackRoutes} />
      </Tabs.Navigator>
    );
  };

  const MainStack = () => {
    return (
      <Main.Navigator screenOptions={{ headerShown: false }}>
        <Main.Screen name="tabs" component={tabStack} />
      </Main.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={navigatorScreenOptions}>
        <Stack.Screen name="splash" component={Splash} />
        <Stack.Screen name="OnBoardingStack" component={OnBoardingStack} />
        <Stack.Screen name="MainStack" component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
