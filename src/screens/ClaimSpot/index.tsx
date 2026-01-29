import {
  View,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import React, { useState, useRef, FC } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import IMAGES from "../../assets/Images";
import COLORS from "../../utils/Colors";
import { CustomText } from "../../components/CustomText";
import CustomIcon from "../../components/CustomIcon";
import ICONS from "../../assets/Icons";
import PrimaryButton from "../../components/PrimaryButton";
import styles from "./styles";
import { ClaimSpotProps } from "../../typings/routes";
import { fetchData, postData } from "../../service/ApiService";
import ENDPOINTS from "../../service/ApiEndpoints";
import { NumberCheckResponse } from "../../service/ApiResponses/NumberCheckResponse";
import { ReserveSpecificNumberResponse } from "../../service/APIResponses/ReserveSpecificNumber";
import { ReserveNumberResponse } from "../../service/ApiResponses/ReserveNumberResponse";
import { useAppDispatch } from "../../redux/store";
import {
  setClaimedNumber,
  setReservationToken,
} from "../../redux/slices/UserSlice";
import { verticalScale } from "../../utils/Metrics";

const ClaimSpot: FC<ClaimSpotProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [number, setNumber] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setNumber(numeric);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (checkingTimeout.current) clearTimeout(checkingTimeout.current);

    if (!numeric.length) {
      setAvailable(false);
      setUnavailable(false);
      setChecking(false);
      return;
    }

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
    setIsLoading(true);
    if (!available || !number) return;
    try {
      const response = await postData<ReserveSpecificNumberResponse>(
        ENDPOINTS.ReserveSpecificNumber,
        { type: "specific", number: Number(number) },
      );
      dispatch(setClaimedNumber(Number(number)));
      dispatch(setReservationToken(response.data.data?.reservationToken));
      navigation.navigate("missionIntro");
    } catch (e) {
      console.error("Error reserving number:", e);
    } finally {
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
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          >
            <View style={styles.logoContainer}>
              <Image source={IMAGES.LogoText} style={styles.logo} />
            </View>

            <View style={styles.content}>
              <View style={styles.headingContainer}>
                <CustomText
                  fontFamily="GabaritoSemiBold"
                  fontSize={42}
                  color={COLORS.darkText}
                  style={{ textAlign: "center" }}
                >
                  Claim your number
                </CustomText>
                <CustomText
                  fontFamily="GabaritoRegular"
                  fontSize={16}
                  color={COLORS.appText}
                  style={{ textAlign: "center" }}
                >
                  Each number represents one person.
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
                    style={styles.textInput}
                    value={number}
                    onChangeText={handleChange}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={7}
                  />

                  {checking || !number.length ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleDicePress}
                    >
                      <CustomIcon
                        Icon={ICONS.DarkDice}
                        width={24}
                        height={24}
                      />
                    </TouchableOpacity>
                  ) : available ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleDicePress}
                    >
                      <CustomIcon
                        Icon={ICONS.diceIcon}
                        width={24}
                        height={24}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleDicePress}
                    >
                      <CustomIcon
                        Icon={ICONS.DarkDice}
                        width={24}
                        height={24}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {checking ? (
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
                    Pick a number between 1 and 1,000,000.
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
