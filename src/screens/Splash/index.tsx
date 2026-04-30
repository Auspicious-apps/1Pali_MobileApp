import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { FC, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { isTablet } from 'react-native-device-info';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import IMAGES from '../../assets/Images';
import { CustomText } from '../../components/CustomText';
import PrimaryButton from '../../components/PrimaryButton';
import { logEvent } from '../../Context/analyticsService';
import { initializeOnboardingTracking } from '../../Context/klaviyoClientService';
import { requestNotificationPermissionDuringOnboarding } from '../../Firebase/NotificationService';
import { setSelectedPlanId } from '../../redux/slices/StripePlans';
import {
  setBadges,
  setClaimedNumber,
  setUserData,
} from '../../redux/slices/UserSlice';
import { useAppSelector } from '../../redux/store';
import ENDPOINTS from '../../service/ApiEndpoints';
import { GetUserProfileApiResponse } from '../../service/ApiResponses/GetUserProfile';
import { fetchData } from '../../service/ApiService';
import { ensureTrackingConsent } from '../../service/TrackingConsentService';
import { SplashScreenProps } from '../../typings/routes';
import COLORS from '../../utils/Colors';
import STORAGE_KEYS from '../../utils/Constants';
import { getLocalStorageData } from '../../utils/Helpers';
import {
  horizontalScale,
  hp,
  responsiveFontSize,
  verticalScale,
  wp,
} from '../../utils/Metrics';

const { height, width } = Dimensions.get('window');
const Splash: FC<SplashScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.user.user);
  const checkAuthenticationStatus = async () => {
    try {
      // Check if all required tokens exist
      const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);
      const refreshToken = await getLocalStorageData(STORAGE_KEYS.refreshToken);
      const expiresIn = await getLocalStorageData(STORAGE_KEYS.expiresIn);

      if (accessToken) {
        await verifyUserProfile();
      } else {
        setIsCheckingAuth(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsCheckingAuth(false);
    }
  };

  const verifyUserProfile = async () => {
    try {
      const response = await fetchData<GetUserProfileApiResponse>(
        ENDPOINTS.GetUserProfile,
      );

      if (response.data.success) {
        dispatch(setUserData(response.data.data));
        dispatch(setBadges(response.data.data.badges));

        if (
          response.data.data.hasSubscription &&
          response.data.data.assignedNumber
        ) {
          dispatch(setClaimedNumber(response.data.data.assignedNumber));
          dispatch(setSelectedPlanId(response.data.data.stripePriceId));
          navigation.replace('MainStack', {
            screen: 'tabs',
            params: { screen: 'home' },
          });
          return;
        } else {
          navigation.replace('OnBoardingStack', {
            screen: 'claimSpot',
          });
        }
        setIsCheckingAuth(false);
      }
    } catch (error: any) {
      console.error('Error verifying user profile:', error);

      // Check if it's a session expired error that requires login
      if (error.requiresLogin) {
        console.log('Session expired, redirecting to login');
      } else {
        // If profile verification fails, clear tokens and show get started
        await AsyncStorage.clear();
      }
      setIsCheckingAuth(false);
    }
  };

  const handleGetStarted = () => {
    // Initialize Klaviyo onboarding tracking
    void initializeOnboardingTracking();

    if (!user?.assignedNumber) {
      navigation.replace('OnBoardingStack', { screen: 'onboarding' });
      return;
    }
    if (user?.assignedNumber && !user?.hasSubscription) {
      navigation.replace('OnBoardingStack', { screen: 'joinOnePali' });
      return;
    }
  };

  useEffect(() => {
    checkAuthenticationStatus();

    let isMounted = true;
    void (async () => {
      await requestNotificationPermissionDuringOnboarding();
      if (!isMounted) {
        return;
      }

      await ensureTrackingConsent();
      if (!isMounted) {
        return;
      }

      logEvent('Ob_Welcome_View');
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ImageBackground
      source={IMAGES.SplashBackground}
      style={styles.container}
    >
      <SafeAreaView
        style={[
          styles.innerContainer,
          {
            marginTop: Platform.select({
              ios: verticalScale(15),
              android: insets.top ? insets.top : verticalScale(30),
            }),
            marginBottom: Platform.select({
              ios: insets.bottom
                ? verticalScale(isTablet() ? 10 : 0)
                : verticalScale(15),
              android: insets.bottom ? verticalScale(10) : verticalScale(30),
            }),
          },
        ]}
      >
        <Image
          source={IMAGES.OnePaliLogo}
          style={styles.logo}
        />
        <View style={styles.titleContainer}>
          <CustomText
            fontFamily='GabaritoSemiBold'
            fontSize={42}
            color={COLORS.appBackground}
            style={styles.titleText}
          >
            Welcome to OnePali
          </CustomText>
          <CustomText
            fontFamily='GabaritoRegular'
            fontSize={18}
            color={COLORS.appBackground}
            style={styles.subtitleText}
          >
            Join a million supporters giving $1/mo {'\n'} to fund relief in
            Palestine.
          </CustomText>
        </View>
        <View style={styles.globalImageContainer}>
          <Image
            source={IMAGES.NewSplashImage}
            resizeMode={Platform.OS === 'android' ? 'contain' : 'cover'}
            style={styles.globalImage}
          />
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          <Image
            source={IMAGES.GetStartedBottomImage}
            style={styles.mecaImage}
          />

          {!isCheckingAuth && (
            <PrimaryButton
              title={isCheckingAuth ? 'Checking...' : 'Get Started'}
              onPress={handleGetStarted}
              activeOpacity={1}
              style={styles.button}
              disabled={isCheckingAuth}
              textSize={responsiveFontSize(isTablet() ? 12 : 18)}
            />
          )}
          <CustomText
            fontFamily='GabaritoRegular'
            fontSize={15}
            color={COLORS.appText}
            style={styles.signInText}
          >
            Have an account?{' '}
            <CustomText
              fontFamily='GabaritoRegular'
              fontSize={15}
              color={COLORS.darkText}
              onPress={() => navigation.navigate('signIn')}
            >
              Log in
            </CustomText>
          </CustomText>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Splash;

const isIphoneSE = Platform.OS === 'ios' && height <= 667;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: horizontalScale(48),
    height: verticalScale(48),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  titleContainer: {
    marginTop: verticalScale(24),
    gap: Platform.OS === 'ios' ? verticalScale(12) : verticalScale(12),
  },
  titleText: {
    textAlign: 'center',
    lineHeight: isIphoneSE ? hp(6.2) : hp(5.5),
    width: '80%',
    alignSelf: 'center',
  },
  subtitleText: {
    textAlign: 'center',
  },
  globalImageContainer: {},
  globalImage: {
    width: wp(100),
    height: hp(42.5),
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3.2),
    marginTop: verticalScale(17),
  },
  dividerLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
    width: wp(20),
  },
  collabText: {
    textAlign: 'center',
    lineHeight: hp(2.7),
  },
  mecaImage: {
    width: wp(80),
    height: hp(5),
    alignSelf: 'center',
    resizeMode: 'contain',
  },

  button: {
    marginTop: verticalScale(30),
    marginBottom: verticalScale(12),
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  loadingText: {
    textAlign: 'center',
  },
  signInText: {
    textAlign: 'center',
  },
});
