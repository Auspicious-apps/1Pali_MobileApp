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
  BottomStackParams,
  MainStackParams,
  OnBoardingStackParams,
  RootStackParams,
} from "../typings/routes";

const Stack = createNativeStackNavigator<RootStackParams>();
const OnBoardingStackNavigator =
  createNativeStackNavigator<OnBoardingStackParams>();
const Main = createNativeStackNavigator<MainStackParams>();
const Tabs = createBottomTabNavigator<BottomStackParams>();

export default function Routes() {
  const navigatorScreenOptions = {
    headerShown: false,
    animation: "ios_from_right" as const,
  };

  function OnBoardingStack() {
    return (
      <OnBoardingStackNavigator.Navigator
        screenOptions={navigatorScreenOptions}
      >
        <OnBoardingStackNavigator.Screen
          name="onboarding"
          component={Onboarding}
        />
        <OnBoardingStackNavigator.Screen
          name="onePaliWorks"
          component={OnePaliWorks}
        />
        <OnBoardingStackNavigator.Screen
          name="claimSpot"
          component={ClaimSpot}
        />
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

  const tabStack: React.FC<any> = ({ route }) => {
    const nestedParams = route?.params as any;
    const initialNumber = nestedParams?.params?.number;

    return (
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <BottomTabBar {...props} />}
      >
        <Tabs.Screen name="home" component={Home} />
        <Tabs.Screen name="updates" component={Updates} />
        <Tabs.Screen name="art" component={Art} />
        <Tabs.Screen name="account" component={Account} />
        <Tabs.Screen name="badges" component={Badges} />
        <Tabs.Screen name="updateDetail" component={UpdateDetail} />
        <Tabs.Screen name="artDetail" component={ArtDetail} />
        <Tabs.Screen name="termsConditions" component={TermsConditions} />
        <Tabs.Screen name="privacyPolicy" component={PrivacyPolicy} />
        <Tabs.Screen name="receipts" component={ReceiptsScreen} />
        <Tabs.Screen name="manageDonation" component={ManageDonation} />
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
