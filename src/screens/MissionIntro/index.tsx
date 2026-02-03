import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  Platform,
  Alert,
} from "react-native";
import React, { FC, useEffect, useRef, useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import IMAGES from "../../assets/Images";
import styles from "./styles";
import { CustomText } from "../../components/CustomText";
import COLORS from "../../utils/Colors";
import { MissionIntroProps } from "../../typings/routes";
import { hp, verticalScale, wp } from "../../utils/Metrics";
import PrimaryButton from "../../components/PrimaryButton";
import ICONS from "../../assets/Icons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { postData } from "../../service/ApiService";
import ENDPOINTS from "../../service/ApiEndpoints";
import { showCustomToast, storeLocalStorageData } from "../../utils/Helpers";
import { GoogleSigninResponse } from "../../service/ApiResponses/GoogleSignin";
import STORAGE_KEYS from "../../utils/Constants";
import appleAuth from "@invertase/react-native-apple-authentication";
import { AppleSigninResponse } from "../../service/ApiResponses/AppleSignin";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  decrementReservationTimer,
  setBadges,
  setClaimedNumber,
  setUserData,
  startReservationTimer,
} from "../../redux/slices/UserSlice";

const initialTimer = 300;

const MissionIntro: FC<MissionIntroProps> = ({ navigation, route }) => {
  const { showNumber } = route.params || {};
  const { reservationSeconds } = useAppSelector((state) => state.user);
  const { claimedNumber } = useAppSelector((state) => state.user);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      if (Platform.OS !== "ios") {
        return;
      }

      if (!appleAuth.isSupported) {
        Alert.alert("Not Supported", "Apple Sign-In not supported");
        return;
      }

      const rawNonce = "Wfghrwrthhfjhreghfjyerwghliueghterui";

      const appleResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        nonce: rawNonce,
      });
      const { identityToken, authorizationCode, user, nonce } = appleResponse;

      if (!identityToken || !authorizationCode) {
        showCustomToast("error", "Apple Sign-In failed");
        return;
      }

      const signInResponse = await postData<AppleSigninResponse>(
        ENDPOINTS.AppleSignin,
        {
          identityToken,
          nonce: nonce,
        },
      );

      if (signInResponse?.data.success) {
        const { tokens, user, isNewUser } = signInResponse?.data?.data;

        // Store all tokens in local storage
        await storeLocalStorageData(
          STORAGE_KEYS?.accessToken,
          tokens?.accessToken,
        );
        await storeLocalStorageData(
          STORAGE_KEYS?.refreshToken,
          tokens.refreshToken,
        );
        await storeLocalStorageData(STORAGE_KEYS?.expiresIn, tokens?.expiresIn);
        await storeLocalStorageData("userData", user);

        // Navigate based on user state
        if (user.hasSubscription && user.hasSubscription) {
          dispatch(setUserData(signInResponse.data?.data?.user?.user));
          dispatch(setBadges(signInResponse.data?.data?.user?.user?.badges));
          dispatch(
            setClaimedNumber(signInResponse.data?.data?.user?.assignedNumber),
          );

          navigation.navigate("MainStack", {
            screen: "tabs",
            params: {
              screen: "home",
            },
          });
          return;
        }

        navigation.navigate("joinOnePali");
      }
    } catch (error: any) {
      console.log("error", error);

      if (error?.code === appleAuth.Error.CANCELED) {
        console.log("User cancelled Apple Sign-In");
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const { data } = await GoogleSignin.signIn();

      if (data?.idToken) {
        const signinResponse = await postData<GoogleSigninResponse>(
          ENDPOINTS.GoogleSignin,
          { idToken: data?.idToken },
        );
        if (signinResponse.data.success) {
          const { tokens, user, isNewUser } = signinResponse?.data?.data;

          // Store all tokens in local storage
          await storeLocalStorageData(
            STORAGE_KEYS?.accessToken,
            tokens?.accessToken,
          );
          await storeLocalStorageData(
            STORAGE_KEYS?.refreshToken,
            tokens.refreshToken,
          );
          await storeLocalStorageData(
            STORAGE_KEYS?.expiresIn,
            tokens?.expiresIn,
          );
          await storeLocalStorageData("userData", user);

          console.log("Tokens and user data saved successfully");

          // Navigate based on user state
          if (isNewUser || !user.assignedNumber) {
            navigation.navigate("joinOnePali");
          } else {
            dispatch(setUserData(signinResponse.data.data.user.user));
            dispatch(setBadges(signinResponse.data.data.user.user.badges));
            dispatch(
              setClaimedNumber(signinResponse.data.data.user.assignedNumber),
            );

            navigation.navigate("MainStack", {
              screen: "tabs",
              params: {
                screen: "home",
              },
            });
          }
        } else {
          const errorMessage = signinResponse.data.message || "Sign-in failed";
          console.error("API Error:", errorMessage);
          showCustomToast("error", errorMessage);
        }
      } else {
        console.log("error", "signin data not found");
        showCustomToast("error", "No sign-in data received from Google");
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);

      let errorMessage = "Something went wrong during sign-in";

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = "Sign-in was cancelled";
        Alert.alert("Sign In Cancelled", "User cancelled the sign in flow.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = "Sign-in is already in progress";
        Alert.alert(
          "Sign In In Progress",
          "Operation (e.g. sign in) is already in progress.",
        );
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = "Google Play Services not available";
        Alert.alert(
          "Play Services Not Available",
          "Google Play Services not available or outdated.",
        );
      } else {
        const message = error.message || "An unexpected error occurred";
        errorMessage = message;
        Alert.alert("Sign In Error", message);
      }

      showCustomToast("error", errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Start reservation timer on mount
  useEffect(() => {
    if (reservationSeconds === null) {
      dispatch(startReservationTimer(initialTimer));
    }
  }, []);

  // Timer countdown effect (must be a separate effect)
  useEffect(() => {
    if (reservationSeconds === null || reservationSeconds <= 0) return;

    const interval = setInterval(() => {
      dispatch(decrementReservationTimer());
    }, 1000);

    return () => clearInterval(interval);
  }, [reservationSeconds]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Image source={IMAGES.LogoText} style={styles.logo} />

        <View style={styles.headingContainer}>
          <CustomText
            fontFamily="GabaritoSemiBold"
            fontSize={42}
            color={COLORS.darkText}
            style={{ textAlign: "center" }}
          >
            Join OnePali
          </CustomText>

          {showNumber && (
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={16}
              color={COLORS.grayColor}
              style={{ textAlign: "center", marginTop: 8 }}
            >
              Number #{claimedNumber} reserved for {reservationSeconds}s
            </CustomText>
          )}
        </View>

        <Image
          source={IMAGES.MissionImage}
          resizeMode="cover"
          style={{
            width: wp(73),
            height: hp(42),
            alignSelf: "center",
            marginTop: verticalScale(20),
          }}
        />

        <View style={{ marginTop: verticalScale(30), alignItems: "center" }}>
          {Platform.OS === "android" ? (
            <PrimaryButton
              title="Sign in with Google"
              leftIcon={{ Icon: ICONS.GoogleIcon, width: 22, height: 22 }}
              onPress={handleGoogleSignIn}
              isLoading={isSigningIn}
              disabled={isSigningIn}
            />
          ) : (
            <PrimaryButton
              title="Sign in with Apple"
              leftIcon={{ Icon: ICONS.AppleLogo, width: 16, height: 22 }}
              onPress={handleAppleSignIn}
              isLoading={isLoading}
            />
          )}

          <CustomText
            fontFamily="GabaritoMedium"
            fontSize={12}
            color={COLORS.grayColor}
            style={{
              textAlign: "center",
              marginTop: verticalScale(16),
              width: wp(50),
            }}
          >
            By joining OnePali, you accept our Terms of Use and Privacy Policy
          </CustomText>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default MissionIntro;
