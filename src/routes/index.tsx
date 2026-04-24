import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  CommonActions,
  NavigationContainer,
  StackActions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { InteractionManager, Linking, Platform } from 'react-native';
import 'react-native-gesture-handler';
import BottomTabBar from '../components/BottomTabBar';
import Account from '../screens/Account';
import AidSupportScreen from '../screens/AidSupportScreen';
import AnimatedNumber from '../screens/AnimatedNumber';
import Art from '../screens/Art';
import ArtDetail from '../screens/ArtDetail';
import Badges from '../screens/Badges';
import ClaimSpot from '../screens/ClaimSpot';
import FAQ from '../screens/FAQ';
import Home from '../screens/Home';
import HowItWorks from '../screens/HowItWorks';
import JoinOnePali from '../screens/JoinOnePali';
import ManageDonation from '../screens/ManageDonation';
import MecaPrivacyPolicy from '../screens/MecaPrivacyPolicy';
import MissionIntro from '../screens/MissionIntro';
import Onboarding from '../screens/Onboarding';
import OnePaliWorks from '../screens/OnePaliWorks';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import QuickDonate from '../screens/QuickDonate';
import ReceiptsScreen from '../screens/ReceiptsScreen';
import SignIn from '../screens/SignIn';
import Splash from '../screens/Splash';
import SplashInitial from '../screens/SplashInitial';
import TermsConditions from '../screens/TermsConditions';
import UpdateDetail from '../screens/UpdateDetail';
import Updates from '../screens/Updates';
import {
  BottomStackParams,
  MainStackParams,
  OnBoardingStackParams,
  RootStackParams,
} from '../typings/routes';
import STORAGE_KEYS from '../utils/Constants';
import { getLocalStorageData, navigationRef } from '../utils/Helpers';
import { resolveDeepLinkTarget } from '../utils/deepLinks';

const Stack = createNativeStackNavigator<RootStackParams>();
const OnBoardingStackNavigator =
  createNativeStackNavigator<OnBoardingStackParams>();

const Main = createNativeStackNavigator<MainStackParams>();
const Tabs = createBottomTabNavigator<BottomStackParams>();

const navigatorScreenOptions = {
  headerShown: false,
  animation: (Platform.OS === 'ios'
    ? 'slide_from_right'
    : 'slide_from_right') as any,
};

const MAIN_STACK_DETAIL_SCREENS = new Set([
  'updateDetail',
  'artDetail',
  'termsConditions',
  'privacyPolicy',
  'receipts',
  'manageDonation',
  'badges',
  'faq',
]);

const getActiveRouteName = (state: any): string | undefined => {
  if (!state?.routes?.length) {
    return undefined;
  }

  const route = state.routes[state.index ?? 0];

  if (route?.state) {
    return getActiveRouteName(route.state);
  }

  return route?.name;
};

function OnBoardingStack() {
  return (
    <OnBoardingStackNavigator.Navigator screenOptions={navigatorScreenOptions}>
      <OnBoardingStackNavigator.Screen
        name='splash'
        component={Splash}
      />
      <OnBoardingStackNavigator.Screen
        name='onboarding'
        component={Onboarding}
      />
      <OnBoardingStackNavigator.Screen
        name='aidSupportScreen'
        component={AidSupportScreen}
      />
      <OnBoardingStackNavigator.Screen
        name='howItWorks'
        component={HowItWorks}
      />
      <OnBoardingStackNavigator.Screen
        name='onePaliWorks'
        component={OnePaliWorks}
      />
      <OnBoardingStackNavigator.Screen
        name='animatedNumber'
        component={AnimatedNumber}
      />
      <OnBoardingStackNavigator.Screen
        name='claimSpot'
        component={ClaimSpot}
      />
      <OnBoardingStackNavigator.Screen
        name='missionIntro'
        component={MissionIntro}
      />
      <OnBoardingStackNavigator.Screen
        name='joinOnePali'
        component={JoinOnePali}
      />
      <OnBoardingStackNavigator.Screen
        name='quickDonate'
        component={QuickDonate}
        options={{ gestureEnabled: false }}
      />
      <OnBoardingStackNavigator.Screen
        name='signIn'
        component={SignIn}
      />
    </OnBoardingStackNavigator.Navigator>
  );
}

export default function Routes() {
  useEffect(() => {
    const handleRuntimeDeepLink = async (url: string) => {
      const deepLinkTarget = resolveDeepLinkTarget(url);

      if (!deepLinkTarget || !navigationRef.isReady()) {
        return;
      }

      const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);

      if (!accessToken) {
        return;
      }

      const currentRouteName = getActiveRouteName(navigationRef.getRootState());
      const isOnMainStackDetailScreen = !!(
        currentRouteName && MAIN_STACK_DETAIL_SCREENS.has(currentRouteName)
      );

      const popCurrentScreenIfNeeded = async () => {
        if (!isOnMainStackDetailScreen) {
          return;
        }

        navigationRef.dispatch(StackActions.pop(1));

        await new Promise<void>((resolve) => {
          InteractionManager.runAfterInteractions(() => resolve());
        });
      };

      if (deepLinkTarget.type === 'tab') {
        if (currentRouteName === deepLinkTarget.screen) {
          return;
        }

        await popCurrentScreenIfNeeded();

        navigationRef.dispatch(
          CommonActions.navigate({
            name: 'MainStack',
            params: {
              screen: 'tabs',
              params: { screen: deepLinkTarget.screen },
            },
            merge: true,
          }),
        );
        return;
      }

      if (currentRouteName === deepLinkTarget.screen) {
        return;
      }

      await popCurrentScreenIfNeeded();

      navigationRef.dispatch(
        CommonActions.navigate({
          name: 'MainStack',
          params: { screen: deepLinkTarget.screen as any },
          merge: true,
        }),
      );
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleRuntimeDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const tabStack: React.FC<any> = ({ route }) => {
    return (
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
        tabBar={(props) => <BottomTabBar {...props} />}
      >
        <Tabs.Screen
          name='home'
          component={Home}
        />
        <Tabs.Screen
          name='updates'
          component={Updates}
        />
        <Tabs.Screen
          name='art'
          component={Art}
        />
        <Tabs.Screen
          name='account'
          component={Account}
        />
      </Tabs.Navigator>
    );
  };

  const MainStack = () => {
    return (
      <Main.Navigator screenOptions={{ headerShown: false }}>
        <Main.Screen
          name='tabs'
          component={tabStack}
        />
        <Main.Screen
          name='updateDetail'
          component={UpdateDetail}
        />
        <Main.Screen
          name='artDetail'
          component={ArtDetail}
        />

        <Main.Screen
          name='termsConditions'
          component={TermsConditions}
        />
        <Main.Screen
          name='privacyPolicy'
          component={PrivacyPolicy}
        />
        <Main.Screen
          name='mecaPrivacyPolicy'
          component={MecaPrivacyPolicy}
        />
        <Main.Screen
          name='receipts'
          component={ReceiptsScreen}
        />
        <Main.Screen
          name='manageDonation'
          component={ManageDonation}
        />
        <Main.Screen
          name='badges'
          component={Badges}
        />
        <Main.Screen
          name='faq'
          component={FAQ}
        />
      </Main.Navigator>
    );
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={navigatorScreenOptions}>
        <Stack.Screen
          name='splashInitial'
          component={SplashInitial}
        />
        <Stack.Screen
          name='OnBoardingStack'
          component={OnBoardingStack}
        />
        <Stack.Screen
          name='MainStack'
          component={MainStack}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
