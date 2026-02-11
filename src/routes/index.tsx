import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Platform } from "react-native";
import "react-native-gesture-handler";
import BottomTabBar from "../components/BottomTabBar";
import Account from "../screens/Account";
import Art from "../screens/Art";
import ArtDetail from "../screens/ArtDetail";
import Badges from "../screens/Badges";
import ClaimSpot from "../screens/ClaimSpot";
import FAQ from "../screens/FAQ";
import Home from "../screens/Home";
import JoinOnePali from "../screens/JoinOnePali";
import ManageDonation from "../screens/ManageDonation";
import MissionIntro from "../screens/MissionIntro";
import Onboarding from "../screens/Onboarding";
import OnePaliWorks from "../screens/OnePaliWorks";
import PrivacyPolicy from "../screens/PrivacyPolicy";
import ReceiptsScreen from "../screens/ReceiptsScreen";
import Splash from "../screens/Splash";
import SplashInitial from "../screens/SplashInitial";
import TermsConditions from "../screens/TermsConditions";
import UpdateDetail from "../screens/UpdateDetail";
import Updates from "../screens/Updates";
import {
  BottomStackParams,
  MainStackParams,
  OnBoardingStackParams,
  RootStackParams,
} from "../typings/routes";
import SignIn from "../screens/SignIn";

const Stack = createNativeStackNavigator<RootStackParams>();
const OnBoardingStackNavigator =
  createNativeStackNavigator<OnBoardingStackParams>();

const Main = createNativeStackNavigator<MainStackParams>();
const Tabs = createBottomTabNavigator<BottomStackParams>();

const navigatorScreenOptions = {
  headerShown: false,
  animation: (Platform.OS === "ios"
    ? "slide_from_right"
    : "slide_from_right") as any,
};

function OnBoardingStack() {
  return (
    <OnBoardingStackNavigator.Navigator screenOptions={navigatorScreenOptions}>
      <OnBoardingStackNavigator.Screen name="splash" component={Splash} />
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
      <OnBoardingStackNavigator.Screen name="signIn" component={SignIn} />
    </OnBoardingStackNavigator.Navigator>
  );
}

export default function Routes() {
  const tabStack: React.FC<any> = ({ route }) => {
    return (
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
        tabBar={(props) => <BottomTabBar {...props} />}
      >
        <Tabs.Screen name="home" component={Home} />
        <Tabs.Screen name="updates" component={Updates} />
        <Tabs.Screen name="art" component={Art} />
        <Tabs.Screen name="account" component={Account} />
      </Tabs.Navigator>
    );
  };

  const MainStack = () => {
    return (
      <Main.Navigator screenOptions={{ headerShown: false }}>
        <Main.Screen name="tabs" component={tabStack} />
        <Main.Screen name="updateDetail" component={UpdateDetail} />
        <Main.Screen name="artDetail" component={ArtDetail} />

        <Main.Screen name="termsConditions" component={TermsConditions} />
        <Main.Screen name="privacyPolicy" component={PrivacyPolicy} />
        <Main.Screen name="receipts" component={ReceiptsScreen} />
        <Main.Screen name="manageDonation" component={ManageDonation} />
        <Main.Screen name="badges" component={Badges} />
        <Main.Screen name="faq" component={FAQ} />
      </Main.Navigator>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={navigatorScreenOptions}>
        <Stack.Screen name="splashInitial" component={SplashInitial} />
        <Stack.Screen name="OnBoardingStack" component={OnBoardingStack} />
        <Stack.Screen name="MainStack" component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
