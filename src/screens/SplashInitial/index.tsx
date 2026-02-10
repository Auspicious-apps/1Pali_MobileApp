import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import IMAGES from "../../assets/Images";
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

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      // await AsyncStorage.clear();

      // Check if all required tokens exist
      const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);

      if (accessToken) {
        await verifyUserProfile();
      } else {
        setIsCheckingAuth(false);
        navigation.replace("OnBoardingStack", { screen: "splash" });
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      navigation.replace("OnBoardingStack", { screen: "splash" });
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
          navigation.replace("MainStack", {
            screen: "tabs",
            params: { screen: "home" },
          });
          return;
        } else {
          navigation.replace("OnBoardingStack", { screen: "onboarding" });
        }
        setIsCheckingAuth(false);
      }
    } catch (error: any) {
      console.error("Error verifying user profile:", error);

      // Check if it's a session expired error that requires login
      if (error.requiresLogin) {
        console.log("Session expired, redirecting to login");
      } else {
        // If profile verification fails, clear tokens and show get started
        await AsyncStorage.clear();
      }
      setIsCheckingAuth(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={IMAGES.SplashInitial} style={styles.image} />
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
