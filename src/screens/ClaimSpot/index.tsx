import React, { FC, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ICONS from '../../assets/Icons';
import IMAGES from '../../assets/Images';
import CustomIcon from '../../components/CustomIcon';
import { CustomText } from '../../components/CustomText';
import { KeyboardAvoidingContainer } from '../../components/KeyboardAvoidingComponent';
import PrimaryButton from '../../components/PrimaryButton';
import { logEvent } from '../../Context/analyticsService';
import { trackOnboardingStepCompleted } from '../../Context/klaviyoClientService';
import {
  clearReservationToken,
  selectClaimedNumber,
  selectPreviousReservationToken,
  selectReservationToken,
  setClaimedNumber,
  setReservationToken,
  startReservationTimer,
} from '../../redux/slices/UserSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import ENDPOINTS from '../../service/ApiEndpoints';
import { NumberCheckResponse } from '../../service/ApiResponses/NumberCheckResponse';
import { ReserveNumberResponse } from '../../service/ApiResponses/ReserveNumberResponse';
import { ReserveSpecificNumberResponse } from '../../service/APIResponses/ReserveSpecificNumber';
import { fetchData, postData } from '../../service/ApiService';
import { ClaimSpotProps } from '../../typings/routes';
import COLORS from '../../utils/Colors';
import { isTablet, verticalScale } from '../../utils/Metrics';
import styles from './styles';

const { height } = Dimensions.get('window');

const ClaimSpot: FC<ClaimSpotProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [number, setNumber] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const reservationToken = useAppSelector(selectReservationToken);
  const previousReservationToken = useAppSelector(
    selectPreviousReservationToken,
  );
  const claimedNumber = useAppSelector(selectClaimedNumber);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [rangeError, setRangeError] = useState(false);
  const [startsWithZero, setStartsWithZero] = useState(false);
  const diceShake = useRef(new Animated.Value(0)).current;
  const isIphoneSE = Platform.OS === 'ios' && height <= 667;

  const shakeDice = () => {
    Animated.sequence([
      Animated.timing(diceShake, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(diceShake, {
        toValue: -1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(diceShake, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(diceShake, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  const handleChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length === 1 && numeric === '0') {
      setStartsWithZero(true);
      return;
    }

    if (numeric.startsWith('0')) {
      setStartsWithZero(true);
      return;
    }

    setStartsWithZero(false);

    if (numeric.length > number.length) {
      HapticFeedback.trigger('impactLight', hapticOptions);
    }

    setNumber(numeric);

    if (numeric.startsWith('0')) {
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
    setTimeout(() => {
      HapticFeedback.trigger('impactHeavy', hapticOptions);
    }, 10);
    shakeDice();

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (checkingTimeout.current) clearTimeout(checkingTimeout.current);

    setIsLoading(true);
    setChecking(false);
    setAvailable(false);
    setUnavailable(false);
    setRangeError(false);
    setStartsWithZero(false);

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
      console.error('Dice API Error:', error);
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
      const response = await postData<NumberCheckResponse>(
        `${ENDPOINTS.CheckNumberAvailable}/${num}`,
        {
          previousReservationToken: previousReservationToken,
        },
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
    // if (checking || !available || !number) return;
    if (checking || !available || !number || isLoading) return;

    const numValue = Number(number);

    // If user already has an active reservation for this number, don't call API again
    if (reservationToken !== null && claimedNumber === numValue) {
      // Reservation already exists for this number, proceed to sign-in
      dispatch(setClaimedNumber(numValue));
      navigation.navigate('missionIntro', { showNumber: true });
      return;
    }

    setIsLoading(true);
    setInputDisabled(true);

    try {
      const response = await postData<ReserveSpecificNumberResponse>(
        ENDPOINTS.ReserveSpecificNumber,
        {
          number: numValue,
          previousReservationToken: previousReservationToken,
        },
      );
      if (response.data?.success) {
        dispatch(setClaimedNumber(numValue));
        dispatch(setReservationToken(response.data.data?.reservationToken));

        // Calculate remaining seconds from expiresInMs
        const remainingSeconds = Math.ceil(
          response.data.data?.expiresInMs / 1000,
        );
        dispatch(
          startReservationTimer({
            seconds: remainingSeconds,
            expiresAt: response.data.data?.expiresAt,
          }),
        );
        navigation.navigate('missionIntro', { showNumber: true });
      }
    } catch (e: any) {
      console.error('Error reserving number:', e);

      setAvailable(false);
      setUnavailable(true);
      setChecking(false);

      const message =
        e?.response?.data?.message ||
        'Oops! Something went wrong while reserving your number. Please try again.';

      Toast.show({
        type: 'error',
        text1: message,
      });

      CheckNumberAvailable(number);

      dispatch(clearReservationToken());
    } finally {
      setInputDisabled(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (available) {
      Keyboard.dismiss();
    }
  }, [available]);

  useEffect(() => {
    logEvent('Ob_Number_Claimed');
    trackOnboardingStepCompleted(3, 'Badge Exploration', 3);
  }, []);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingContainer style={styles.keyboardView}>
        <SafeAreaView
          style={[
            styles.safeArea,
            {
              marginTop: Platform.select({
                ios: verticalScale(15),
                android: insets.top ? insets.top : verticalScale(30),
              }),
            },
          ]}
          edges={['top']}
        >
          <Image
            source={IMAGES.OnePaliLogo}
            style={styles.logo}
          />

          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#E5E7EF',
              borderRadius: 100,
              position: 'absolute',
              top: insets.top,
              left: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CustomIcon
              Icon={ICONS.BackArrowBg}
              height={verticalScale(32)}
              width={verticalScale(32)}
            />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.headingContainer}>
              <CustomText
                fontFamily='GabaritoSemiBold'
                fontSize={42}
                color={COLORS.darkText}
                style={{
                  textAlign: 'center',

                  lineHeight: isTablet
                    ? verticalScale(45)
                    : isIphoneSE
                    ? verticalScale(50)
                    : verticalScale(40),
                }}
              >
                Choose your{'\n'}number
              </CustomText>
              <CustomText
                fontFamily='GabaritoRegular'
                fontSize={18}
                color={COLORS.appText}
                style={{ textAlign: 'center' }}
              >
                Your identity among one million supporters
              </CustomText>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <CustomText
                  fontFamily='GabaritoSemiBold'
                  style={styles.hashText}
                >
                  #
                </CustomText>

                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  value={number}
                  onChangeText={handleChange}
                  keyboardType='number-pad'
                  inputMode='numeric'
                  maxLength={7}
                  autoFocus
                  // editable={!checking && !inputDisabled}
                  editable={!inputDisabled}
                />

                {checking || !number.length ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleDicePress}
                  >
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: diceShake.interpolate({
                              inputRange: [-1, 1],
                              outputRange: ['-15deg', '15deg'],
                            }),
                          },
                        ],
                      }}
                    >
                      <CustomIcon
                        Icon={ICONS.SpotDice}
                        width={32}
                        height={32}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                ) : available ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleDicePress}
                  >
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: diceShake.interpolate({
                              inputRange: [-1, 1],
                              outputRange: ['-15deg', '15deg'],
                            }),
                          },
                        ],
                      }}
                    >
                      <CustomIcon
                        Icon={ICONS.SpotDice}
                        width={32}
                        height={32}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleDicePress}
                  >
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: diceShake.interpolate({
                              inputRange: [-1, 1],
                              outputRange: ['-15deg', '15deg'],
                            }),
                          },
                        ],
                      }}
                    >
                      <CustomIcon
                        Icon={ICONS.SpotDice}
                        width={32}
                        height={32}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                )}
              </View>
              {startsWithZero ? (
                <View style={styles.statusRow}>
                  <CustomIcon
                    Icon={ICONS.RedClose}
                    width={16}
                    height={16}
                  />
                  <CustomText
                    fontFamily='GabaritoRegular'
                    fontSize={15}
                    color={COLORS.redColor}
                  >
                    Number cannot start with 0
                  </CustomText>
                </View>
              ) : rangeError ? (
                <View style={styles.statusRow}>
                  <CustomIcon
                    Icon={ICONS.RedClose}
                    width={16}
                    height={16}
                  />
                  <CustomText
                    fontFamily='GabaritoRegular'
                    fontSize={15}
                    color={COLORS.redColor}
                  >
                    Number must be between 1 and 1,000,000
                  </CustomText>
                </View>
              ) : checking ? (
                <View style={styles.statusRow}>
                  <CustomIcon
                    Icon={ICONS.loader}
                    width={16}
                    height={16}
                  />
                  <CustomText
                    fontFamily='GabaritoRegular'
                    fontSize={15}
                    color={COLORS.appText}
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
                    fontFamily='GabaritoRegular'
                    fontSize={15}
                    color={COLORS.green}
                  >
                    Available
                  </CustomText>
                </View>
              ) : unavailable ? (
                <View style={styles.statusRow}>
                  <CustomIcon
                    Icon={ICONS.RedClose}
                    width={16}
                    height={16}
                  />
                  <CustomText
                    fontFamily='GabaritoRegular'
                    fontSize={15}
                    color={COLORS.redColor}
                  >
                    Taken, try another or tap the dice
                  </CustomText>
                </View>
              ) : (
                <CustomText
                  fontFamily='GabaritoRegular'
                  fontSize={15}
                  color={COLORS.appText}
                >
                  {/* {availableSpots ? availableSpots.toLocaleString() : "0"}{" "}
                    spots remaining */}
                  Pick between 1 and 1,000,000
                </CustomText>
              )}
            </View>
          </View>

          <PrimaryButton
            title='Claim number'
            onPress={handleReserveNumber}
            disabled={!available}
            isLoading={isLoading}
            hapticFeedback
            hapticType='impactLight'
            style={{
              marginBottom: Platform.select({
                ios: insets.bottom
                  ? verticalScale(isTablet ? insets.bottom : 20)
                  : verticalScale(15),
                android: insets.bottom ? verticalScale(10) : verticalScale(15),
              }),
            }}
          />
        </SafeAreaView>
      </KeyboardAvoidingContainer>
    </View>
  );
};

export default ClaimSpot;
