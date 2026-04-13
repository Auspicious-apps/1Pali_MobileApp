import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import NumnerDetailModal from "../../components/Modal/NumberDetailModal";
import PrimaryButton from "../../components/PrimaryButton";
import { SlotMachineNumber } from "../../components/SlotMachineNumber";
import {
  clearReservationToken,
  selectClaimedNumber,
  selectPreviousReservationToken,
  selectReservationSeconds,
  selectReservationToken,
  setClaimedNumber,
  setReservationToken,
  startReservationTimer,
} from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { ReserveNumberResponse } from "../../service/ApiResponses/ReserveNumberResponse";
import { ReserveSpecificNumberResponse } from "../../service/APIResponses/ReserveSpecificNumber";
import { fetchData, postData } from "../../service/ApiService";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale, wp } from "../../utils/Metrics";
import { logEvent } from "../../Context/analyticsService";

const AnimatedNumber = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;

  const reservationToken = useAppSelector(selectReservationToken);
  const previousReservationToken = useAppSelector(
    selectPreviousReservationToken,
  );
  const claimedNumber = useAppSelector(selectClaimedNumber);
  const [number, setNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const reservationSeconds = useAppSelector(selectReservationSeconds);
  const isExpired = !reservationSeconds || reservationSeconds <= 0;

  // Fetch random number
  const fetchRandomNumber = async () => {
    setLoading(true);
    setAnimationDone(false);
    // Reset animation values so fade/slide will replay
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    headerSlideAnim.setValue(-50);
    try {
      const response = await fetchData<ReserveNumberResponse>(
        ENDPOINTS.GetRandomNumber,
      );
      const generatedNumber = response?.data?.data?.number;
      const expiresInMs = response?.data?.data?.expiresInMs;
      if (generatedNumber) {
        setNumber(Number(generatedNumber));
        // Reset timer if API provides expiresInMs, else fallback to 60s
        const seconds = expiresInMs ? Math.ceil(expiresInMs / 1000) : 60;
        dispatch(startReservationTimer({ seconds, expiresAt: null as any }));
      }
    } catch (error) {
      console.error("GetRandomNumber API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (animationDone) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // Bottom elements slide up
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        // NEW: Header elements slide down
        Animated.spring(headerSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animationDone]);

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
    logEvent("Ob_Number_Claimed");
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {animationDone && (
        <Animated.View
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: headerSlideAnim }], // Use the header specific anim
              zIndex: 10, // Ensure it stays on top
            },
          ]}
        >
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

            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              activeOpacity={0.8}
            >
              <CustomIcon
                Icon={ICONS.QuestionMark}
                height={verticalScale(32)}
                width={verticalScale(32)}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Center Slot Animation */}
      <View style={styles.centerContainer}>
        {number !== null && (
          <SlotMachineNumber
            key={number}
            number={number}
            onRevealComplete={() => setAnimationDone(true)}
          />
        )}

        <Animated.View
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim, // Apply fade
              transform: [{ translateY: slideAnim }], // Apply slide
            },
          ]}
        >
          {animationDone && (
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={20}
              style={styles.subtext}
            >
              Your identity among {"\n"} one million supporters
            </CustomText>
          )}
        </Animated.View>
      </View>

      {/* Bottom Buttons */}
      {animationDone && (
        <Animated.View
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim, // Apply fade
              transform: [{ translateY: slideAnim }], // Apply slide
            },
          ]}
        >
          {isExpired && !loading ? (
            <PrimaryButton
              title="Claim New Number"
              onPress={fetchRandomNumber}
              isLoading={loading}
              hapticFeedback
              hapticType="impactLight"
            />
          ) : (
            <PrimaryButton
              title={number ? `Claim #${number}` : "Claim Number"}
              onPress={handleReserveNumber}
              isLoading={isLoading || loading}
              hapticFeedback
              hapticType="impactLight"
              disabled={isExpired || loading}
            />
          )}

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
        </Animated.View>
      )}

      <NumnerDetailModal
        isVisible={isModalVisible}
        setIsVisible={setIsModalVisible}
      />
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
    color: COLORS.appText,
    textDecorationLine: "underline",
  },
  subtext: {
    color: COLORS.darkText,
    textAlign: "center",
  },
});
