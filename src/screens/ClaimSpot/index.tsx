import React, { FC, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HapticFeedback from "react-native-haptic-feedback";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import PrimaryButton from "../../components/PrimaryButton";
import {
  clearReservationTimer,
  clearReservationToken,
  selectClaimedNumber,
  selectReservationToken,
  setClaimedNumber,
  setReservationToken,
} from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { NumberCheckResponse } from "../../service/ApiResponses/NumberCheckResponse";
import { ReserveNumberResponse } from "../../service/ApiResponses/ReserveNumberResponse";
import { ReserveSpecificNumberResponse } from "../../service/APIResponses/ReserveSpecificNumber";
import { fetchData, postData } from "../../service/ApiService";
import { ClaimSpotProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { verticalScale } from "../../utils/Metrics";
import styles from "./styles";

const ClaimSpot: FC<ClaimSpotProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [number, setNumber] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const reservationToken = useAppSelector(selectReservationToken);
  const claimedNumber = useAppSelector(selectClaimedNumber);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [rangeError, setRangeError] = useState(false);
  const [diceMode, setDiceMode] = useState(false);
  const [startsWithZero, setStartsWithZero] = useState(false);
  const showClaimTitle = !diceMode && (checking || available || unavailable);

  const hapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  const handleChange = (text: string) => {
    setDiceMode(false);
    const numeric = text.replace(/[^0-9]/g, "");

    if (numeric.length > number.length) {
      HapticFeedback.trigger("impactLight", hapticOptions);
    }

    setNumber(numeric);

    if (numeric.startsWith("0")) {
      setStartsWithZero(true);
      setChecking(false);
      setAvailable(false);
      setUnavailable(false);
      return; // Stop further execution
    } else {
      setStartsWithZero(false);
    }

    // If user changes the number and there's an active reservation token, clear it
    if (
      numeric !== number &&
      reservationToken !== null &&
      claimedNumber !== null &&
      claimedNumber !== Number(numeric)
    ) {
      dispatch(clearReservationToken());
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (checkingTimeout.current) clearTimeout(checkingTimeout.current);

    if (!numeric.length) {
      setChecking(false);
      setAvailable(false);
      setUnavailable(false);
      setRangeError(false);
      return;
    }

    const value = Number(numeric);

    if (value > 1_000_000) {
      setRangeError(true);
      setChecking(false);
      setAvailable(false);
      setUnavailable(false);
      return;
    }
    setRangeError(false);

    typingTimeout.current = setTimeout(() => {
      CheckNumberAvailable(numeric);
    }, 700);
  };

  const handleDicePress = async () => {
    setDiceMode(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (checkingTimeout.current) clearTimeout(checkingTimeout.current);

    setIsLoading(true);
    setChecking(false);
    setAvailable(false);
    setUnavailable(false);

    try {
      const response = await fetchData<ReserveNumberResponse>(
        ENDPOINTS.GetRandomNumber,
      );

      const generatedNumber = response?.data?.data?.number;

      if (!generatedNumber) {
        setUnavailable(true);
        return;
      }

      const numString = String(generatedNumber);

      setNumber(numString);

      setAvailable(true);
      setUnavailable(false);
    } catch (error) {
      console.error("Dice API Error:", error);
      setUnavailable(true);
    } finally {
      setIsLoading(false);
    }
  };

  const CheckNumberAvailable = async (num: string) => {
    setIsLoading(true);
    setChecking(true);
    setAvailable(false);
    setUnavailable(false);
    try {
      const response = await fetchData<NumberCheckResponse>(
        `${ENDPOINTS.CheckNumberAvailable}/${num}`,
      );
      setChecking(false);
      if (response?.data?.data?.isAvailable) {
        setAvailable(true);
        setUnavailable(false);
      } else {
        setAvailable(false);
        setUnavailable(true);
      }
    } catch (error) {
      setChecking(false);
      setAvailable(false);
      setUnavailable(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Reserve the specific number via API and navigate on success
  const handleReserveNumber = async () => {
    if (checking || !available || !number) return;

    const numValue = Number(number);

    // If user already has an active reservation for this number, don't call API again
    if (reservationToken !== null && claimedNumber === numValue) {
      // Reservation already exists for this number, proceed to sign-in
      dispatch(setClaimedNumber(numValue));
      dispatch(clearReservationTimer());
      navigation.navigate("missionIntro", { showNumber: true });
      return;
    }

    setIsLoading(true);
    setInputDisabled(true);
    inputRef.current?.blur();
    Keyboard.dismiss();

    try {
      const response = await postData<ReserveSpecificNumberResponse>(
        ENDPOINTS.ReserveSpecificNumber,
        { type: "specific", number: numValue },
      );
      dispatch(setClaimedNumber(numValue));
      dispatch(setReservationToken(response.data.data?.reservationToken));

      dispatch(clearReservationTimer());
      navigation.navigate("missionIntro", { showNumber: true });
    } catch (e) {
      console.error("Error reserving number:", e);
      // On API error, clear the reservation token to allow retry with a different number
      dispatch(clearReservationToken());
    } finally {
      setInputDisabled(false);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          >
            <View style={styles.header}>
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
              <Image source={IMAGES.OnePaliLogo} style={styles.logo} />
            </View>

            <View style={styles.content}>
              <View style={styles.headingContainer}>
                <CustomText
                  fontFamily="GabaritoSemiBold"
                  fontSize={42}
                  color={COLORS.darkText}
                  style={{ textAlign: "center", lineHeight: verticalScale(40) }}
                >
                  Choose your{"\n"}number
                </CustomText>
                <CustomText
                  fontFamily="GabaritoRegular"
                  fontSize={16}
                  color={COLORS.appText}
                  style={{ textAlign: "center" }}
                >
                  Pick between 1 and 1,000,000.
                </CustomText>
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                  <CustomText
                    fontFamily="GabaritoSemiBold"
                    style={styles.hashText}
                  >
                    #
                  </CustomText>

                  <TextInput
                    ref={inputRef}
                    style={styles.textInput}
                    value={number}
                    onChangeText={handleChange}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={7}
                    autoFocus
                    editable={!checking && !inputDisabled}
                  />

                  {checking || !number.length ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleDicePress}
                    >
                      <CustomIcon
                        Icon={ICONS.diceIcon}
                        width={32}
                        height={32}
                      />
                    </TouchableOpacity>
                  ) : available ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleDicePress}
                    >
                      <CustomIcon
                        Icon={ICONS.diceIcon}
                        width={32}
                        height={32}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleDicePress}
                    >
                      <CustomIcon
                        Icon={ICONS.diceIcon}
                        width={32}
                        height={32}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {startsWithZero ? (
                  <View style={styles.statusRow}>
                    <CustomIcon Icon={ICONS.RedClose} width={16} height={16} />
                    <CustomText
                      fontFamily="MontserratRegular"
                      fontSize={12}
                      color={COLORS.redColor}
                    >
                      Number cannot start with zero.
                    </CustomText>
                  </View>
                ) : rangeError ? (
                  <View style={styles.statusRow}>
                    <CustomIcon Icon={ICONS.RedClose} width={16} height={16} />
                    <CustomText
                      fontFamily="MontserratRegular"
                      fontSize={12}
                      color={COLORS.redColor}
                    >
                      Pick a number between 1 and 1,000,000
                    </CustomText>
                  </View>
                ) : checking ? (
                  <View style={styles.statusRow}>
                    <CustomIcon Icon={ICONS.loader} width={16} height={16} />
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={12}
                      color={COLORS.grey}
                    >
                      Checking...
                    </CustomText>
                  </View>
                ) : available ? (
                  <View style={styles.statusRow}>
                    <CustomIcon
                      Icon={ICONS.CheckMarkIcon}
                      width={16}
                      height={16}
                    />
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={12}
                      color={COLORS.green}
                    >
                      Available
                    </CustomText>
                  </View>
                ) : unavailable ? (
                  <View style={styles.statusRow}>
                    <CustomIcon Icon={ICONS.RedClose} width={16} height={16} />
                    <CustomText
                      fontFamily="MontserratRegular"
                      fontSize={12}
                      color={COLORS.redColor}
                    >
                      Taken, try another or click the dice
                    </CustomText>
                  </View>
                ) : (
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={12}
                    color={COLORS.grey}
                  >
                    Each number represents one supporter.
                  </CustomText>
                )}
              </View>
            </View>
            <PrimaryButton
              title="Claim number"
              onPress={handleReserveNumber}
              disabled={!available}
              isLoading={isLoading}
              style={styles.button}
              hapticFeedback
              hapticType="impactLight"
            />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
};

export default ClaimSpot;
