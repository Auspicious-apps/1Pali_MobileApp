import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import IMAGES from "../../assets/Images";
import { CustomText } from "../../components/CustomText";
import PrimaryButton from "../../components/PrimaryButton";
import { setSelectedPlanId } from "../../redux/slices/StripePlans";
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
import {
  horizontalScale,
  hp,
  responsiveFontSize,
  verticalScale,
  wp,
} from "../../utils/Metrics";

const { height, width } = Dimensions.get("window");
const Splash: FC<SplashScreenProps> = ({ navigation }) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const dispatch = useDispatch();
  const isIphoneSE = Platform.OS === "ios" && height <= 667;
  const { user } = useAppSelector((state) => state.user);

  const checkAuthenticationStatus = async () => {
    try {
      // await AsyncStorage.clear();

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
          dispatch(setSelectedPlanId(response.data.data.stripePriceId));
          navigation.replace("MainStack", {
            screen: "tabs",
            params: { screen: "home" },
          });
          return;
        } else {
          navigation.replace("OnBoardingStack", { screen: "claimSpot" });
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
      navigation.replace("OnBoardingStack", { screen: "onboarding" });
      return;
    }
    if (user?.assignedNumber && !user?.hasSubscription) {
      navigation.replace("OnBoardingStack", { screen: "joinOnePali" });
      return;
    }
  };

  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  return (
    <ImageBackground source={IMAGES.SplashBackground} style={styles.container}>
      <SafeAreaView style={styles.innerContainer}>
        <Image source={IMAGES.OnePaliLogo} style={styles.logo} />
        <View style={styles.titleContainer}>
          <CustomText
            fontFamily="GabaritoSemiBold"
            fontSize={42}
            color={COLORS.appBackground}
            style={styles.titleText}
          >
            Welcome to OnePali
          </CustomText>
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={18}
            color={COLORS.appBackground}
            style={styles.subtitleText}
          >
            Be one in a million supporting Palestine.
          </CustomText>
        </View>
        <View style={styles.globalImageContainer}>
          <Image
            source={IMAGES.PeoplesImage}
            resizeMode="contain"
            style={styles.globalImage}
          />
        </View>

        <Image source={IMAGES.GetStartedBottomImage} style={styles.mecaImage} />

        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          {!isCheckingAuth && (
            <PrimaryButton
              title={isCheckingAuth ? "Checking..." : "Get Started"}
              onPress={handleGetStarted}
              activeOpacity={1}
              style={styles.button}
              disabled={isCheckingAuth}
              textSize={responsiveFontSize(18)}
            />
          )}
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={15}
            color={COLORS.appText}
            style={styles.signInText}
          >
            Have an account?{" "}
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={15}
              color={COLORS.darkText}
              onPress={() => navigation.navigate("signIn")}
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

const isIphoneSE = Platform.OS === "ios" && height <= 667;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    marginTop: verticalScale(15),
    marginBottom: verticalScale(12),
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: horizontalScale(54),
    height: verticalScale(54),
    resizeMode: "contain",
    alignSelf: "center",
  },
  titleContainer: {
    marginTop: verticalScale(24),
  },
  titleText: {
    textAlign: "center",
    lineHeight: isIphoneSE ? hp(6.2) : hp(5.5),
    width: "80%",
    alignSelf: "center",
  },
  subtitleText: {
    textAlign: "center",
  },
  globalImageContainer: {
    marginTop: Platform.OS === "ios" ? verticalScale(16) : verticalScale(16),
  },
  globalImage: {
    width: "100%",
    height: hp(42),
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
  mecaImage: {
    width: wp(80),
    height: verticalScale(40),
    alignSelf: "center",
    resizeMode: "contain",
    marginTop: isIphoneSE ? verticalScale(24) : verticalScale(0),
  },

  button: {
    marginTop: verticalScale(32),
    marginBottom: verticalScale(12),
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: verticalScale(20),
  },
  loadingText: {
    textAlign: "center",
  },
  signInText: {
    textAlign: "center",
  },
});
