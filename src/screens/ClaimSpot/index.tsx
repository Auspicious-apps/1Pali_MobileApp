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
  selectReservationSeconds,
  setClaimedNumber,
  setReservationToken,
  startReservationTimer,
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
import { useFocusEffect } from "@react-navigation/native";

const ClaimSpot: FC<ClaimSpotProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [number, setNumber] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const reservationSeconds = useAppSelector(selectReservationSeconds);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [rangeError, setRangeError] = useState(false);

  const showClaimTitle = checking || available || unavailable;

  const hapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  const handleChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");

     if (numeric.length > number.length) {
       HapticFeedback.trigger("impactLight", hapticOptions);
     }

    setNumber(numeric);

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

    setIsLoading(true);
    setInputDisabled(true);
    inputRef.current?.blur();
    Keyboard.dismiss();
    try {
      const response = await postData<ReserveSpecificNumberResponse>(
        ENDPOINTS.ReserveSpecificNumber,
        { type: "specific", number: Number(number) },
      );
      dispatch(setClaimedNumber(Number(number)));
      dispatch(setReservationToken(response.data.data?.reservationToken));

      dispatch(clearReservationTimer());
      navigation.navigate("missionIntro", { showNumber: true });
    } catch (e) {
      console.error("Error reserving number:", e);
      setInputDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // screen focused (do nothing)

      return () => {
        setNumber("");
        setChecking(false);
        setAvailable(false);
        setUnavailable(false);
        setIsLoading(false);
        setInputDisabled(false);

        typingTimeout.current && clearTimeout(typingTimeout.current);
        checkingTimeout.current && clearTimeout(checkingTimeout.current);

        inputRef.current?.clear();
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <View style={styles.header}>
              <View style={styles.side}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.8}
                >
                  <CustomIcon Icon={ICONS.backArrow} height={40} width={40} />
                </TouchableOpacity>
              </View>
              <View style={styles.center}>
                <Image source={IMAGES.LogoText} style={styles.logo} />
              </View>
              <View style={styles.side} />
            </View>

            <View style={styles.content}>
              <View style={styles.headingContainer}>
                <CustomText
                  fontFamily="GabaritoSemiBold"
                  fontSize={42}
                  color={COLORS.darkText}
                  style={{ textAlign: "center", lineHeight: verticalScale(40) }}
                >
                  {showClaimTitle
                    ? "Claim your\nnumber"
                    : "Choose your\nnumber"}
                </CustomText>
                <CustomText
                  fontFamily="GabaritoRegular"
                  fontSize={16}
                  color={COLORS.appText}
                  style={{ textAlign: "center" }}
                >
                  {showClaimTitle
                    ? "Each number represents one person."
                    : "Pick between 1 and 1,000,000."}
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
                {rangeError ? (
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
            <View style={{ gap: Platform.OS == "ios" ? 0 : verticalScale(10) }}>
              <PrimaryButton
                title="Claim number"
                onPress={handleReserveNumber}
                disabled={!available}
                isLoading={isLoading}
                style={styles.button}
              />
              <CustomText
                fontFamily="MontserratRegular"
                fontSize={12}
                color={COLORS.grey}
                style={styles.signInText}
              >
                Already have a account?{" "}
                <CustomText
                  fontFamily="MontserratSemiBold"
                  fontSize={12}
                  color={COLORS.darkText}
                  onPress={() => navigation.navigate("missionIntro")}
                >
                  Sign in
                </CustomText>
              </CustomText>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
};

export default ClaimSpot;
