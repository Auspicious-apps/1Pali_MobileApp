import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useEffect, useState } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import IMAGES from "../../assets/Images";
import { CustomText } from "../../components/CustomText";
import PrimaryButton from "../../components/PrimaryButton";
import {
  setBadges,
  setClaimedNumber,
  setUserData,
} from "../../redux/slices/UserSlice";
import { useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { GetUserProfileApiResponse } from "../../service/ApiResponses/GetUserProfile";
import { fetchData } from "../../service/ApiService";
import { SplashScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import STORAGE_KEYS from "../../utils/Constants";
import { getLocalStorageData } from "../../utils/Helpers";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";
import Badges from "../Badges";

const Splash: FC<SplashScreenProps> = ({ navigation }) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const dispatch = useDispatch();

  const { user } = useAppSelector((state) => state.user);

  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      // Check if all required tokens exist
      const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);
      const refreshToken = await getLocalStorageData(STORAGE_KEYS.refreshToken);
      const expiresIn = await getLocalStorageData(STORAGE_KEYS.expiresIn);

      console.log(accessToken);

      if (accessToken) {
        await verifyUserProfile();
      } else {
        setIsCheckingAuth(false);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
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
          navigation.replace("MainStack", {
            screen: "tabs",
            params: { screen: "home" },
          });
          return;
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

  const handleGetStarted = () => {
    if (!user?.assignedNumber) {
      navigation.replace("OnBoardingStack", { screen: "claimSpot" });
      return;
    }
    if (user?.assignedNumber && !user?.hasSubscription) {
      navigation.replace("OnBoardingStack", { screen: "joinOnePali" });
      return;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.innerContainer}>
        <View style={styles.contentContainer}>
          <Image source={IMAGES.OnePaliLogo} style={styles.logo} />
          <View style={styles.titleContainer}>
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={32}
              color={COLORS.darkText}
              style={styles.titleText}
            >
              OnePali
            </CustomText>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={20}
              color={COLORS.lightPurple}
              style={styles.subtitleText}
            >
              One cause. One million supporters.
            </CustomText>
          </View>
          <View style={styles.globalImageContainer}>
            <Image source={IMAGES.ChangedSplash} style={styles.globalImage} />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={16}
              color={COLORS.greyText}
              style={styles.collabText}
            >
              In collaboration with
            </CustomText>
            <View style={styles.dividerLine} />
          </View>
          <View style={styles.partnersRow}>
            <Image source={IMAGES.MecaImage} style={styles.mecaImage} />
            <Image source={IMAGES.Paliroot} style={styles.palirootImage} />
          </View>
        </View>

        <PrimaryButton
          title={isCheckingAuth ? "Checking..." : "Get Started"}
          onPress={isCheckingAuth ? () => {} : handleGetStarted}
          style={styles.button}
          isLoading={isCheckingAuth}
          disabled={isCheckingAuth}
        />
      </SafeAreaView>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    flex: 1,
    paddingVertical:
      Platform.OS === "ios" ? verticalScale(0) : verticalScale(10),
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: horizontalScale(72),
    height: verticalScale(72),
    resizeMode: "contain",
    alignSelf: "center",
  },
  titleContainer: {
    gap: hp(0.25),
    marginTop: Platform.OS === "ios" ? verticalScale(10) : verticalScale(16),
  },
  titleText: {
    textAlign: "center",
  },
  subtitleText: {
    textAlign: "center",
  },
  globalImageContainer: {
    marginTop: Platform.OS === "ios" ? verticalScale(24) : verticalScale(32),
  },
  globalImage: {
    width: wp(60),
    height: hp(46.6),
    alignSelf: "center",
    resizeMode: "contain",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3.2),
    marginTop: verticalScale(17),
  },
  dividerLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
    width: wp(20),
  },
  collabText: {
    textAlign: "center",
    lineHeight: hp(2.7),
  },
  partnersRow: {
    flexDirection: "row",
    gap: wp(7.7),
    marginTop: hp(1),
  },
  mecaImage: {
    width: wp(36),
    height: hp(6),
    alignSelf: "center",
    resizeMode: "contain",
  },
  palirootImage: {
    width: wp(35.7),
    height: hp(3.3),
    alignSelf: "center",
    resizeMode: "contain",
  },
  button: {
    marginTop: hp(2.5),
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: verticalScale(20),
  },
  loadingText: {
    textAlign: "center",
  },
});
