import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import IMAGES from "../../assets/Images";
import { syncFCMTokenWithBackend } from "../../Firebase/NotificationService";
import { setSelectedPlanId } from "../../redux/slices/StripePlans";
import {
  setBadges,
  setClaimedNumber,
  setUserData,
} from "../../redux/slices/UserSlice";
import ENDPOINTS from "../../service/ApiEndpoints";
import { GetUserProfileApiResponse } from "../../service/ApiResponses/GetUserProfile";
import { fetchData } from "../../service/ApiService";
import { SplashInitialScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import STORAGE_KEYS from "../../utils/Constants";
import { getLocalStorageData } from "../../utils/Helpers";
import { verticalScale } from "../../utils/Metrics";

const SplashInitial: FC<SplashInitialScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scaleAnim.setValue(1);

    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.78,
          duration: 500,
          useNativeDriver: true,
        }),

        Animated.timing(scaleAnim, {
          toValue: 1.06,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuthenticationStatus();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      // await AsyncStorage.clear();

      // Check if all required tokens exist
      const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);

      if (accessToken) {
        await verifyUserProfile();
      } else {
        navigation.replace("OnBoardingStack", { screen: "splash" });
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      navigation.replace("OnBoardingStack", { screen: "splash" });
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
        // Sync FCM token with backend on splash after successful login
        syncFCMTokenWithBackend(response.data.data.fcmToken).catch((err) =>
          console.log("FCM sync error (non-critical):", err),
        );

        if (
          response.data.data.hasSubscription &&
          response.data.data.assignedNumber
        ) {
          dispatch(setClaimedNumber(response.data.data.assignedNumber));
          dispatch(setSelectedPlanId(response.data.data.stripePriceId));
          navigation.replace("MainStack", {
            screen: "tabs",
            params: { screen: "home" },
          });
          return;
        } else {
          navigation.replace("OnBoardingStack", { screen: "onboarding" });
        }
      }
    } catch (error: any) {
      console.error("Error verifying user profile Initial:", error);

      // Check if it's a session expired error that requires login
      if (error.requiresLogin) {
        console.log("Session expired, redirecting to login Initial");
        await AsyncStorage.clear();
        navigation.replace("OnBoardingStack", {
          screen: "splash",
        });
      } else {
        // If profile verification fails, clear tokens and show get started
        await AsyncStorage.clear();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={IMAGES.SplashInitial}
        style={[
          styles.image,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />
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
});
