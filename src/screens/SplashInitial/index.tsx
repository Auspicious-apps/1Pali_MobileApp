import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Linking,
  StyleSheet,
  View,
} from "react-native";
import IMAGES from "../../assets/Images";
import LOTTIES from "../../assets/lotties";
import { CustomText } from "../../components/CustomText";
import { syncFCMTokenWithBackend } from "../../Firebase/NotificationService";
import { setSelectedPlanId } from "../../redux/slices/StripePlans";
import {
  setBadges,
  setClaimedNumber,
  setUserData,
} from "../../redux/slices/UserSlice";
import { useAppDispatch } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { GetUserProfileApiResponse } from "../../service/ApiResponses/GetUserProfile";
import { fetchData } from "../../service/ApiService";
import { SplashInitialScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import STORAGE_KEYS from "../../utils/Constants";
import {
  deleteLocalStorageData,
  getLocalStorageData,
} from "../../utils/Helpers";
import { hp, verticalScale, wp } from "../../utils/Metrics";

const SplashInitial: FC<SplashInitialScreenProps> = ({ navigation }) => {
  const animationProgress = useRef(new Animated.Value(0));
  const animationRef = useRef<LottieView>(null);

  const playTrimmed = () => {
    animationRef.current?.play(0, 200);
  };

  useEffect(() => {
    Animated.timing(animationProgress.current, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  const dispatch = useAppDispatch();
  const [isDeepLinkFlow, setIsDeepLinkFlow] = useState(false);
  const DEEP_LINK_PROFILE_POLL_ATTEMPTS = 3;
  const DEEP_LINK_PROFILE_POLL_DELAY_MS = 3000;

  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      // Check if all required tokens exist
      const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);
      const minimumSplashDurationPromise = new Promise<void>((resolve) =>
        setTimeout(() => resolve(), 4500),
      );
      // await GoogleSignin.signOut()
      // await AsyncStorage.clear();

      if (accessToken) {
        const initialUrl = await Linking.getInitialURL();
        const launchedFromDeepLink = !!initialUrl;

        if (launchedFromDeepLink) {
          setIsDeepLinkFlow(true);
          console.log("[SplashInitial] App opened from deep link:", initialUrl);
          await pollVerifyUserProfileFromDeepLink();
          return;
        }

        await verifyUserProfile(minimumSplashDurationPromise);
      } else {
        await minimumSplashDurationPromise;
        navigation.replace("OnBoardingStack", { screen: "splash" });
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      navigation.replace("OnBoardingStack", { screen: "splash" });
    }
  };

  const verifyUserProfile = async (minDisplayPromise?: Promise<void>) => {
    try {
      const response = await fetchData<GetUserProfileApiResponse>(
        ENDPOINTS.GetUserProfile,
      );
      if (response.data.success) {
        if (
          response.data.data.hasSubscription &&
          response.data.data.assignedNumber
        ) {
          dispatch(setUserData(response.data.data));
          dispatch(setBadges(response.data.data.badges));
          // Sync FCM token with backend on splash after successful login
          syncFCMTokenWithBackend(response.data.data.fcmToken).catch((err) =>
            console.log("FCM sync error (non-critical):", err),
          );
          dispatch(setClaimedNumber(response.data.data.assignedNumber));
          dispatch(setSelectedPlanId(response.data.data.stripePriceId));

          if (minDisplayPromise) {
            await minDisplayPromise;
          }

          navigation.replace("MainStack", {
            screen: "tabs",
            params: { screen: "home" },
          });
          return;
        } else {
          await deleteLocalStorageData(STORAGE_KEYS.accessToken);
          await deleteLocalStorageData(STORAGE_KEYS.refreshToken);
          await deleteLocalStorageData(STORAGE_KEYS.expiresIn);

          if (minDisplayPromise) {
            await minDisplayPromise;
          }

          navigation.replace("OnBoardingStack", { screen: "splash" });
        }
      }
    } catch (error: any) {
      console.error("Error verifying user profile Initial:", error);

      // Check if it's a session expired error that requires login
      if (error.requiresLogin) {
        console.log("Session expired, redirecting to login Initial");
        await AsyncStorage.clear();

        if (minDisplayPromise) {
          await minDisplayPromise;
        }

        navigation.replace("OnBoardingStack", {
          screen: "splash",
        });
      } else {
        // If profile verification fails, clear tokens and show get started
        await AsyncStorage.clear();
      }
    }
  };

  const verifyUserProfileForDeepLink = async (): Promise<boolean> => {
    try {
      const response = await fetchData<GetUserProfileApiResponse>(
        ENDPOINTS.GetUserProfile,
      );

      if (
        response.data.success &&
        response.data.data.hasSubscription &&
        response.data.data.assignedNumber &&
        response.data.data.badges.badges.length >= 2
      ) {
        dispatch(setUserData(response.data.data));
        dispatch(setBadges(response.data.data.badges));
        syncFCMTokenWithBackend(response.data.data.fcmToken).catch((err) =>
          console.log("FCM sync error (non-critical):", err),
        );
        dispatch(setClaimedNumber(response.data.data.assignedNumber));
        dispatch(setSelectedPlanId(response.data.data.stripePriceId));

        navigation.replace("MainStack", {
          screen: "tabs",
          params: { screen: "home" },
        });

        return true;
      }

      return false;
    } catch (error: any) {
      if (error?.requiresLogin) {
        console.log("Session expired, redirecting to login Initial");
        await AsyncStorage.clear();
        navigation.replace("OnBoardingStack", { screen: "splash" });
        return true;
      }

      console.error(
        "Error verifying user profile during deep link poll:",
        error,
      );
      return false;
    }
  };

  const pollVerifyUserProfileFromDeepLink = async (): Promise<void> => {
    for (
      let attempt = 1;
      attempt <= DEEP_LINK_PROFILE_POLL_ATTEMPTS;
      attempt++
    ) {
      const isHandled = await verifyUserProfileForDeepLink();

      if (isHandled) {
        return;
      }

      if (attempt < DEEP_LINK_PROFILE_POLL_ATTEMPTS) {
        await new Promise<void>((resolve) =>
          setTimeout(() => resolve(), DEEP_LINK_PROFILE_POLL_DELAY_MS),
        );
      }
    }

    navigation.replace("OnBoardingStack", { screen: "splash" });
  };

  return (
    <View style={styles.container}>
      {isDeepLinkFlow ? (
        <>
          <Image
            source={IMAGES.OnePaliLogo}
            resizeMode="contain"
            style={styles.logo}
          />
          <View style={{ alignItems: "center", marginTop: verticalScale(32) }}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={32}
              color={COLORS.darkText}
              style={{ textAlign: "center" }}
            >
              {`Thank you for \n supporting Palestine`}
            </CustomText>
            <View
              style={{ marginTop: verticalScale(32), gap: verticalScale(12) }}
            >
              <ActivityIndicator color={COLORS.appText} size={"small"} />
            </View>
          </View>
        </>
      ) : (
        <LottieView
          source={LOTTIES.SplashLottie}
          autoPlay
          loop={false}
          style={{
            width: wp(100),
            height: hp(100),
            transform: [{ scale: 1.1 }],
          }}
        />
      )}
    </View>
  );
};

export default SplashInitial;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.appBackground,
  },
  image: {
    width: "100%",
    height: verticalScale(132),
    resizeMode: "contain",
  },
  logo: {
    width: verticalScale(64),
    height: verticalScale(64),
  },
});
