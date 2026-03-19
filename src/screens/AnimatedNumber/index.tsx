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
import ENDPOINTS from "../../service/ApiEndpoints";
import { fetchData, postData } from "../../service/ApiService";
import { ReserveNumberResponse } from "../../service/ApiResponses/ReserveNumberResponse";
import { ReserveSpecificNumberResponse } from "../../service/APIResponses/ReserveSpecificNumber";
import { CustomText } from "../../components/CustomText";
import { SlotMachineNumber } from "../../components/SlotMachineNumber";
import IMAGES from "../../assets/Images";
import { horizontalScale, verticalScale, wp } from "../../utils/Metrics";
import {
  clearReservationToken,
  selectClaimedNumber,
  selectPreviousReservationToken,
  selectReservationToken,
  setClaimedNumber,
  setReservationToken,
  startReservationTimer,
} from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import Toast from "react-native-toast-message";
import PrimaryButton from "../../components/PrimaryButton";
import COLORS from "../../utils/Colors";
import CustomIcon from "../../components/CustomIcon";
import ICONS from "../../assets/Icons";
import DonationSlider from "../../components/DonationSlider";
import NumnerDetailModal from "../../components/Modal/NumberDetailModal";

const AnimatedNumber = () => {
  const navigation: any = useNavigation();
  const dispatch = useAppDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;
  const [donationAmount, setDonationAmount] = useState(1);

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

      {!animationDone ? (
        <View style={styles.logoContainer}>
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
      ) : (
        <View style={styles.logoContainer}>
          <Image source={IMAGES.OnePaliLogo} style={styles.appIcon} />
        </View>
      )}

      {/* <DonationSlider
        min={1}
        max={100}
        onValueChange={(value) => {
          setDonationAmount(value);
        }}
      /> */}

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
        <Animated.View
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim, // Apply fade
              transform: [{ translateY: slideAnim }], // Apply slide
            },
          ]}
        >
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
    color: COLORS.darkText,
    textDecorationLine: "underline",
  },
});
