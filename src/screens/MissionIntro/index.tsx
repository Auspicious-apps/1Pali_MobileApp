import appleAuth from "@invertase/react-native-apple-authentication";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import React, { FC, useEffect, useState } from "react";
import { Alert, Image, Platform, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import { CustomText } from "../../components/CustomText";
import PrimaryButton from "../../components/PrimaryButton";
import {
  selectReservationSeconds,
  selectReservationStatus,
  setBadges,
  setClaimedNumber,
  setUserData,
  startReservationTimer,
} from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { AppleSigninResponse } from "../../service/ApiResponses/AppleSignin";
import { GoogleSigninResponse } from "../../service/ApiResponses/GoogleSignin";
import { postData } from "../../service/ApiService";
import { MissionIntroProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import STORAGE_KEYS from "../../utils/Constants";
import { storeLocalStorageData } from "../../utils/Helpers";
import { hp, verticalScale, wp } from "../../utils/Metrics";
import styles from "./styles";
import CustomIcon from "../../components/CustomIcon";

const initialTimer = 200;

const MissionIntro: FC<MissionIntroProps> = ({ navigation, route }) => {
  const { showNumber } = route.params || {};
  const reservationStatus = useAppSelector(selectReservationStatus);
  const reservationSeconds = useAppSelector(selectReservationSeconds);
  const { claimedNumber } = useAppSelector((state) => state.user);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isReservationExpired = reservationStatus === "EXPIRED";

  const dispatch = useAppDispatch();

  // Start timer only on mount if not already started
  useEffect(() => {
    if (reservationSeconds === null) {
      dispatch(startReservationTimer(initialTimer));
    }
  }, []);

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
        Toast.show({
          type: "error",
          text1: "Apple Sign-In Failed",
          text2: "No sign-in data received from Apple",
        });
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

          navigation.replace("MainStack", {
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

          // Navigate based on user state
          if (isNewUser || !user.assignedNumber) {
            navigation.navigate("joinOnePali");
          } else {
            dispatch(setUserData(signinResponse.data.data.user.user));
            dispatch(setBadges(signinResponse.data.data.user.user.badges));
            dispatch(
              setClaimedNumber(signinResponse.data.data.user.assignedNumber),
            );

            navigation.replace("MainStack", {
              screen: "tabs",
              params: {
                screen: "home",
              },
            });
          }
        } else {
          const errorMessage = signinResponse.data.message || "Sign-in failed";
          console.error("API Error:", errorMessage);
          Toast.show({
            type: "error",
            text1: "Google Sign-In Failed",
            text2: errorMessage,
          });
        }
      } else {
        console.log("error", "signin data not found");
        Toast.show({
          type: "error",
          text1: "Google Sign-In Failed",
          text2: "No sign-in data received from Google",
        });
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);

      let errorMessage = "Something went wrong during sign-in";

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = "Sign-in was cancelled";
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = "Sign-in is already in progress";
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = "Google Play Services not available";
      } else {
        const message = error.message || "An unexpected error occurred";
        errorMessage = message;
        Alert.alert("Sign In Error", message);
      }

      Toast.show({
        type: "error",
        text1: "Google Sign-In Failed",
        text2: errorMessage,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#E5E7EF",
                borderRadius: 100,
                position: "absolute",
                top: 0,
                left: 0,
                height: 32,
                width: 32,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CustomIcon Icon={ICONS.BackArrowWithBg} />
            </TouchableOpacity>
          )}
          <Image source={IMAGES.LogoText} style={styles.logo} />
        </View>

        <View style={styles.headingContainer}>
          <CustomText
            fontFamily="GabaritoSemiBold"
            fontSize={42}
            color={COLORS.darkText}
            style={{ textAlign: "center" }}
          >
            Join OnePali
          </CustomText>

          {showNumber &&
            (reservationSeconds && reservationSeconds > 0 ? (
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={16}
                color={COLORS.grayColor}
                style={{ textAlign: "center", marginTop: 8 }}
              >
                {`Number #${claimedNumber} reserved for ${reservationSeconds}s`}
              </CustomText>
            ) : (
              <CustomText
                color={COLORS.redColor}
                fontFamily="GabaritoRegular"
                fontSize={16}
              >
                {`Number #${claimedNumber} Expired`}
              </CustomText>
            ))}
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

        {reservationSeconds && reservationSeconds > 0 ? (
          <View style={{ marginTop: verticalScale(60), alignItems: "center" }}>
            {Platform.OS === "android" ? (
              <PrimaryButton
                title="Sign in with Google"
                leftIcon={{ Icon: ICONS.GoogleIcon, width: 22, height: 22 }}
                onPress={handleGoogleSignIn}
                isLoading={isSigningIn}
                disabled={isSigningIn || isReservationExpired}
                hapticFeedback
                hapticType="impactLight"
              />
            ) : (
              <PrimaryButton
                title="Sign in with Apple"
                leftIcon={{ Icon: ICONS.AppleLogo, width: 16, height: 22 }}
                onPress={handleAppleSignIn}
                isLoading={isLoading}
                disabled={isLoading || isReservationExpired}
                hapticFeedback
                hapticType="impactLight"
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
        ) : (
          <View style={{ marginTop: verticalScale(60), alignItems: "center" }}>
            <PrimaryButton
              title="Choose a new number"
              onPress={() => navigation.goBack()}
              isLoading={isSigningIn}
              disabled={isSigningIn || isReservationExpired}
              hapticFeedback
              hapticType="impactLight"
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default MissionIntro;
