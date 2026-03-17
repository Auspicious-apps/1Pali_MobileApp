import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { fetchData, postData } from "../../service/ApiService";
import ENDPOINTS from "../../service/ApiEndpoints";

import { ReserveNumberResponse } from "../../service/ApiResponses/ReserveNumberResponse";
import { ReserveSpecificNumberResponse } from "../../service/APIResponses/ReserveSpecificNumber";

import { SlotMachineNumber } from "../../components/SlotMachineNumber";
import { CustomText } from "../../components/CustomText";

import IMAGES from "../../assets/Images";
import { horizontalScale, verticalScale, wp } from "../../utils/Metrics";

import {
  selectReservationToken,
  selectPreviousReservationToken,
  selectClaimedNumber,
  setClaimedNumber,
  setReservationToken,
  startReservationTimer,
  clearReservationToken,
} from "../../redux/slices/UserSlice";

import { useAppDispatch, useAppSelector } from "../../redux/store";

import Toast from "react-native-toast-message";
import PrimaryButton from "../../components/PrimaryButton";
import COLORS from "../../utils/Colors";
import CustomIcon from "../../components/CustomIcon";
import ICONS from "../../assets/Icons";

const AnimatedNumber = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();

  const reservationToken = useAppSelector(selectReservationToken);
  const previousReservationToken = useAppSelector(
    selectPreviousReservationToken,
  );
  const claimedNumber = useAppSelector(selectClaimedNumber);

  const [number, setNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch random number
  const fetchRandomNumber = async () => {
    try {
      const response = await fetchData<ReserveNumberResponse>(
        ENDPOINTS.GetRandomNumber,
      );

      const generatedNumber = response?.data?.data?.number;

      if (generatedNumber) {
        setNumber(Number(generatedNumber));
      }
    } catch (error) {
      console.error("GetRandomNumber API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reserve number API
  const handleReserveNumber = async () => {
    if (!number || isLoading) return;

    const numValue = Number(number);

    if (reservationToken !== null && claimedNumber === numValue) {
      dispatch(setClaimedNumber(numValue));
      navigation.navigate("missionIntro", { showNumber: true });
      return;
    }

    setIsLoading(true);

    try {
      const response = await postData<ReserveSpecificNumberResponse>(
        ENDPOINTS.ReserveSpecificNumber,
        {
          number: numValue,
          previousReservationToken: previousReservationToken,
        },
      );

      if (response?.data?.success) {
        dispatch(setClaimedNumber(numValue));
        dispatch(setReservationToken(response.data.data?.reservationToken));

        const remainingSeconds = Math.ceil(
          response.data.data?.expiresInMs / 1000,
        );

        dispatch(
          startReservationTimer({
            seconds: remainingSeconds,
            expiresAt: response.data.data?.expiresAt,
          }),
        );

        navigation.navigate("missionIntro", { showNumber: true });
      }
    } catch (e: any) {
      console.error("Error reserving number:", e);

      const message =
        e?.response?.data?.message ||
        "Oops! Something went wrong while reserving your number.";

      Toast.show({
        type: "error",
        text1: message,
      });

      dispatch(clearReservationToken());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomNumber();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {animationDone ? (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <CustomIcon
              Icon={ICONS.BackArrowBg}
              height={verticalScale(32)}
              width={verticalScale(32)}
            />
          </TouchableOpacity>

          <Image source={IMAGES.OnePaliLogo} style={styles.logo} />

          <CustomIcon
            Icon={ICONS.QuestionMark}
            height={verticalScale(32)}
            width={verticalScale(32)}
          />
        </View>
      ) : (
        <View style={styles.logoContainer}>
          <Image source={IMAGES.OnePaliLogo} style={styles.appIcon} />
        </View>
      )}

      {/* Center Slot Animation */}
      <View style={styles.centerContainer}>
        {number !== null && (
          <SlotMachineNumber
            number={number}
            onRevealComplete={() => setAnimationDone(true)}
          />
        )}
      </View>

      {/* Bottom Buttons */}
      {animationDone && (
        <View style={styles.bottomContainer}>
          <PrimaryButton
            title={`Claim #${number}`}
            onPress={handleReserveNumber}
            isLoading={isLoading}
            hapticFeedback
            hapticType="impactLight"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("claimSpot")}
            style={styles.chooseContainer}
          >
            <CustomText
              fontFamily="MontserratSemiBold"
              fontSize={16}
              style={styles.chooseText}
            >
              Choose my own number
            </CustomText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AnimatedNumber;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.appBackground,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(100) - horizontalScale(32),
    alignSelf: "center",
    marginTop: verticalScale(15),
  },

  logoContainer: {
    alignItems: "center",
    marginTop: verticalScale(15),
  },

  appIcon: {
    width: horizontalScale(54),
    height: verticalScale(54),
    resizeMode: "contain",
  },

  logo: {
    width: horizontalScale(54),
    height: verticalScale(54),
    resizeMode: "contain",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomContainer: {
    alignItems: "center",
  },

  chooseContainer: {
    paddingVertical: verticalScale(18),
    paddingHorizontal: horizontalScale(70),
  },

  chooseText: {
    color: COLORS.darkText,
    textDecorationLine: "underline",
  },
});
