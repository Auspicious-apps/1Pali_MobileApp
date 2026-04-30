import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  confirmPlatformPaySetupIntent,
  initPaymentSheet,
  isPlatformPaySupported,
  PlatformPay,
  PlatformPayButton,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import FONTS from '../../assets/fonts';
import ICONS from '../../assets/Icons';
import IMAGES from '../../assets/Images';
import CustomIcon from '../../components/CustomIcon';
import { CustomText } from '../../components/CustomText';
import DonationSlider from '../../components/DonateSlider';
import ImpactLoader from '../../components/ImpactLoader';
import CustomAmounModal from '../../components/Modal/CustomAmounModal';
import PrimaryButton from '../../components/PrimaryButton';
import { setSelectedPlanId } from '../../redux/slices/StripePlans';
import {
  clearReservationTimer,
  selectReservationSeconds,
  setBadges,
  setUserData,
  startReservationTimer,
} from '../../redux/slices/UserSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import ENDPOINTS from '../../service/ApiEndpoints';
import { ConsfirmSetupIntentApiResponse } from '../../service/ApiResponses/ConfirmSetupIntentApiResponse';
import { CreateApplePaySetupIntentApiResponse } from '../../service/ApiResponses/CreateApplePaySetupIntentApiResponse';
import { CreateExternalCheckoutSessionApiResponse } from '../../service/ApiResponses/CreateExternalCheckoutSessionApiResponse';
import { CreateSetupIntentResponse } from '../../service/ApiResponses/CreateSetupIntent';
import { GetUserProfileApiResponse } from '../../service/ApiResponses/GetUserProfile';
import { fetchData, postData } from '../../service/ApiService';
import { QuickDonateProps } from '../../typings/routes';
import COLORS from '../../utils/Colors';
import STORAGE_KEYS from '../../utils/Constants';
import { deleteLocalStorageData, showToast } from '../../utils/Helpers';
import {
  horizontalScale,
  hp,
  isTablet,
  responsiveFontSize,
  verticalScale,
  wp,
} from '../../utils/Metrics';

const visiblePlans = [
  {
    id: 'plan_1',
    type: 'amount',
    amount: 1,
  },
  {
    id: 'plan_2',
    type: 'amount',
    amount: 3,
  },
  {
    id: 'plan_3',
    type: 'amount',
    amount: 5,
  },
  {
    id: 'custom',
    type: 'custom',
  },
];

const getImpactText = (amount: number) => {
  if (amount >= 1 && amount <= 3) {
    return 'A hot meal for a child';
  } else if (amount >= 4 && amount <= 7) {
    return 'Meals and clean water';
  } else if (amount >= 8 && amount <= 14) {
    return 'Meals, water, and art programs for children';
  } else if (amount >= 15 && amount <= 22) {
    return 'Meals, water, art, and trauma support';
  } else if (amount >= 23 && amount <= 30) {
    return 'A full circle of care';
  } else {
    return 'A hot meal for a child'; // fallback
  }
};

const DATA = [
  {
    text: '8,339 children kept warm in winter 2025',
    icon: ICONS.WinterClothes,
  },
  {
    text: '39,418 blankets distributed to families in Gaza in 2025',
    icon: ICONS.Blanket,
  },
  {
    text: 'Summer camps across 9 refugee camps in Palestine',
    icon: ICONS.SummerCamp,
  },
  {
    text: '1M+ gallons of clean water delivered each month',
    icon: ICONS.WaterTap,
  },
  {
    text: '20,000 meals provided daily in Gaza',
    icon: ICONS.MealBowl,
  },
];

const QuickDonate: FC<QuickDonateProps> = ({ navigation, route }) => {
  const { joinedPosition } = route.params;
  const insets = useSafeAreaInsets();

  const dispatch = useAppDispatch();

  const { user, claimedNumber, reservationToken } = useAppSelector(
    (state) => state.user,
  );
  const stripeProductId = useAppSelector(
    (state) => state.stripeBootstrap.productId,
  );
  const stripeMode = useAppSelector((state) => state.stripeBootstrap.mode);

  const [showCustomAmountModal, setShowCustomAmountModal] = useState(false);

  const reservationSeconds = useAppSelector(selectReservationSeconds);
  const [selectedPlan, setSelectedPlan] = useState(visiblePlans[0]);
  const [customAmount, setCustomAmount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [showImpactLoader, setShowImpactLoader] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [index, setIndex] = useState(0);

  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const [isPlatformPayAvailable, setIsPlatformPayAvailable] = useState(false);

  const selectedPlanAmount =
    selectedPlan.type === 'custom'
      ? parseFloat(customAmount) || 0
      : visiblePlans.find((p) => p.id === selectedPlan.id)?.amount || 0;

  const hapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  const pollUserProfile = async (retries = 3): Promise<boolean> => {
    try {
      const profileResponse = await fetchData<GetUserProfileApiResponse>(
        ENDPOINTS.GetUserProfile,
      );

      // Check if the subscription is active (adjust "active" based on your API's exact string)
      if (
        profileResponse?.data?.data.subscriptionStatus === 'ACTIVE' &&
        profileResponse.data.data.badges.badges.find(
          (badge) => badge.badge.category === 'GROWTH',
        ) &&
        profileResponse.data.data.assignedNumber
      ) {
        dispatch(setUserData(profileResponse?.data?.data));
        dispatch(setBadges(profileResponse?.data?.data?.badges));
        dispatch(setSelectedPlanId(profileResponse.data.data.stripePriceId));

        // You might need to update other pieces of state here
        return true;
      }

      // If not active and we have retries left, wait 5 seconds and try again
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(() => resolve(true), 3000));
        return await pollUserProfile(retries - 1);
      }

      return false; // All retries exhausted without "active" status
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(() => resolve(true), 3000));
        return await pollUserProfile(retries - 1);
      }
      return false;
    }
  };

  const handleSetupIntent = async () => {
    try {
      setIsLoading(true);
      if (!stripeProductId) {
        Alert.alert('Error', 'Stripe product not loaded. Please try again.');
        return;
      }
      if (!selectedPlan) {
        Alert.alert('Error', 'Please select a plan');
        return;
      }

      if (user && user.hasPaymentMethod) {
        setShowImpactLoader(true);
        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmSetupIntent,
            {
              amountInDollars: selectedPlan.amount,
              productId: stripeProductId,
              includesProcessingFees: isChecked,
              reservationToken: reservationToken,
            },
          );

        setIsLoading(false);
        if (confirmSetupIntentresponse.data.success) {
          // Start polling instead of a single fetch
          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.replace('MainStack', {
              screen: 'tabs',
              params: { screen: 'home' },
            });
          } else {
            setShowImpactLoader(false);
            Alert.alert(
              'Subscription Pending',
              'Your payment was successful, but your subscription is still activating. Please check your profile in a moment.',
            );
            // Optionally navigate anyway or stay on screen
          }
        }
      } else {
        const response = await postData<CreateSetupIntentResponse>(
          ENDPOINTS.CreateSetupIntent,
          {
            amountInDollars: selectedPlan.amount,
            productId: stripeProductId,
            includesProcessingFees: isChecked,
            reservationToken: reservationToken,
          },
        );

        const {
          clientSecret,
          customerId,
          setupIntentId,
          timerExtended,
          newExpirationTime,
        } = response?.data?.data || {};

        if (!clientSecret) {
          setIsLoading(false);
          throw new Error('Failed to create payment setup. Please try again.');
        }

        // Show timer extension notification if applicable
        if (timerExtended && newExpirationTime) {
          showToast('info', 'Time Extended', 'Payment in progress');
          dispatch(
            startReservationTimer({
              seconds: Math.ceil(
                (new Date(newExpirationTime).getTime() - Date.now()) / 1000,
              ),
              expiresAt: newExpirationTime,
            }),
          );
        }

        const { error: initError } = await initPaymentSheet({
          setupIntentClientSecret: clientSecret,
          merchantDisplayName: 'OnePali',
          customerId: customerId,
          returnURL: 'onepali://payment-return',

          googlePay: {
            testEnv: stripeMode === 'test',
            merchantCountryCode: 'US',
          },

          applePay: {
            merchantCountryCode: 'US',
          },
        });

        if (initError) {
          setIsLoading(false);
          throw new Error(
            `Payment initialization failed: ${initError.message}`,
          );
        }

        const { error: paymentError } = await presentPaymentSheet();

        if (paymentError) {
          setIsLoading(false);
          console.log(paymentError, 'OPOPPOP');
          paymentError.code === 'Canceled'
            ? Alert.alert('Payment cancelled', 'You cancelled the payment')
            : Alert.alert('Payment failed', paymentError.message);
          return;
        }
        setShowImpactLoader(true);
        setIsLoading(false);

        if (!setupIntentId) {
          throw new Error('Missing setup intent or payment method');
        }

        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmSetupIntent,
            {
              // priceId: planId,
              amountInDollars: selectedPlan.amount,
              productId: stripeProductId,
              includesProcessingFees: isChecked,
              reservationToken: reservationToken,
              setupIntentId,
            },
          );

        if (confirmSetupIntentresponse.data.success) {
          setShowImpactLoader(true);

          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.replace('MainStack', {
              screen: 'tabs',
              params: { screen: 'home' },
            });
          } else {
            Alert.alert(
              'Subscription Pending',
              'Your payment was successful, but your subscription is still activating. Please check your profile in a moment.',
            );
            // Optionally navigate anyway or stay on screen
          }
        }
      }
    } catch (error: any) {
      console.log('SetupIntent error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setShowImpactLoader(false);
      setIsLoading(false);
    }
  };

  const handlePlatformSetupIntent = async () => {
    try {
      setIsLoading(true);
      if (!stripeProductId) {
        Alert.alert('Error', 'Stripe product not loaded. Please try again.');
        setIsLoading(false);
        return;
      }
      if (!selectedPlan) {
        Alert.alert('Error', 'Please select a plan');
        setIsLoading(false);
        return;
      }

      if (user && user.hasPaymentMethod && user.defaultPaymentMethodId) {
        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmApplePaySetupIntent,
            {
              paymentMethodId: user.defaultPaymentMethodId,
              amountInDollars: selectedPlan.amount,
              productId: stripeProductId,
              includesProcessingFees: isChecked,
              reservationToken: reservationToken,
              provider: Platform.OS === 'ios' ? 'APPLE_PAY' : 'GOOGLE_PAY',
            },
          );

        if (confirmSetupIntentresponse.data.success) {
          setIsLoading(false);
          setShowImpactLoader(true);

          // Start polling instead of a single fetch
          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.replace('MainStack', {
              screen: 'tabs',
              params: { screen: 'home' },
            });
          } else {
            Alert.alert(
              'Subscription Pending',
              'Your payment was successful, but your subscription is still activating. Please check your profile in a moment.',
            );
            // Optionally navigate anyway or stay on screen
          }
        }
      } else {
        const response = await postData<CreateApplePaySetupIntentApiResponse>(
          ENDPOINTS.CreateApplePaySetupIntent,
          {
            amountInDollars: selectedPlan.amount,
            productId: stripeProductId,
            includesProcessingFees: isChecked,
            reservationToken: reservationToken,
          },
        );

        const {
          clientSecret,
          amount,
          currency,
          priceId,
          timerExtended,
          newExpirationTime,
        } = response?.data?.data || {};

        // Show timer extension notification if applicable
        if (timerExtended && newExpirationTime) {
          showToast('info', 'Time Extended', 'Payment in progress');
          dispatch(
            startReservationTimer({
              seconds: Math.ceil(
                (new Date(newExpirationTime).getTime() - Date.now()) / 1000,
              ),
              expiresAt: newExpirationTime,
            }),
          );
        }

        const { error: initError, setupIntent } =
          await confirmPlatformPaySetupIntent(clientSecret, {
            applePay: {
              cartItems: [
                {
                  label: 'OnePali Supporter Membership',
                  amount: amount.toString(),
                  paymentType: PlatformPay.PaymentType.Immediate,
                },
              ],
              merchantCountryCode: 'US',
              currencyCode: currency,
              requiredShippingAddressFields: [
                PlatformPay.ContactField.PostalAddress,
              ],
              requiredBillingContactFields: [
                PlatformPay.ContactField.PhoneNumber,
              ],
            },
            googlePay: {
              amount: amount * 100,
              isEmailRequired: true,
              currencyCode: currency,
              label: 'OnePali Supporter Membership',
              merchantCountryCode: 'US',
              testEnv: stripeMode === 'test',
              merchantName: 'OnePali',
              billingAddressConfig: {
                format: PlatformPay.BillingAddressFormat.Full,
                isPhoneNumberRequired: true,
                isRequired: true,
              },
            },
          });

        if (initError) {
          setIsLoading(false);
          throw new Error(`${initError.message}`);
        }

        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmApplePaySetupIntent,
            {
              paymentMethodId: setupIntent?.paymentMethod?.id,
              priceId: priceId,
              reservationToken: reservationToken,
              provider: Platform.OS === 'ios' ? 'APPLE_PAY' : 'GOOGLE_PAY',
            },
          );
        setShowImpactLoader(true);

        if (confirmSetupIntentresponse.data.success) {
          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.replace('MainStack', {
              screen: 'tabs',
              params: { screen: 'home' },
            });
          } else {
            Alert.alert(
              'Subscription Pending',
              'Your payment was successful, but your subscription is still activating. Please check your profile in a moment.',
            );
          }
        }
      }
    } catch (error: any) {
      console.log('SetupIntent error:', error);
      if (
        Platform.OS === 'android' &&
        error.message ===
          'Payment initialization failed: Google Pay has been canceled'
      ) {
        Alert.alert('Payment cancelled', 'You cancelled the payment');
      } else {
        Alert.alert('Note', error.message || 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
      setShowImpactLoader(false);
    }
  };

  const handleExternalPayment = async () => {
    try {
      setIsLoading(true);
      if (!selectedPlan) {
        Alert.alert('Error', 'Please select a plan');
        setIsLoading(false);
        return;
      }

      // Get checkout URL from backend
      const response = await postData<CreateExternalCheckoutSessionApiResponse>(
        ENDPOINTS.CreateExternalPaymentCheckoutLink,
        {
          amountInDollars: selectedPlan.amount,
          productId: stripeProductId,
          includesProcessingFees: isChecked,
          successUrl:
            'https://onepali-backend.onrender.com/subscription/success',
          cancelUrl:
            'https://onepali-backend.onrender.com/subscription/cancelled',
          reservationToken: reservationToken,
        },
      );

      if (response?.data?.success && response?.data?.data?.checkoutUrl) {
        setIsLoading(false);

        // Alert user that they will be redirected to external payment processor
        Alert.alert(
          'Secure Payment',
          'You will be redirected to a secure payment page. This will open in your browser.',
          [
            {
              text: 'Cancel',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'Continue',
              onPress: async () => {
                try {
                  // Open the checkout URL in default browser (Safari on iOS, Chrome on Android)
                  // COMPLIANT with Apple Guideline 3.2.2 - external payments must happen outside the app
                  await Linking.openURL(response?.data?.data?.checkoutUrl);
                } catch (error) {
                  console.error('Failed to open checkout URL:', error);
                  Alert.alert(
                    'Error',
                    'Unable to open payment page. Please try again.',
                  );
                }
              },
            },
          ],
        );
      } else {
        throw new Error('Invalid checkout URL received from server');
      }
    } catch (error: any) {
      console.log('External payment error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to process payment. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!reservationSeconds) {
      dispatch(clearReservationTimer());
    }
  }, [reservationSeconds, dispatch]);

  useEffect(() => {
    (async function () {
      setIsPlatformPayAvailable(await isPlatformPaySupported());
    })();
  }, []);

  useEffect(() => {
    // logEvent("Ob_Paywall_View");
  }, []);

  useEffect(() => {
    const animateStatCard = () => {
      const fadeOutDuration = 400;
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -30,
          duration: fadeOutDuration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: fadeOutDuration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]).start(() => {
        setIndex((prev) => (prev + 1) % DATA.length);

        translateY.setValue(30);
        opacity.setValue(0);

        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.sequence([
            Animated.delay(75),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 550,
              useNativeDriver: true,
              easing: Easing.out(Easing.ease),
            }),
          ]),
        ]).start();
      });
    };

    // initial fade-in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    const interval = setInterval(animateStatCard, 4000);
    return () => {
      clearInterval(interval);
    };
  }, [opacity, translateY]);

  // Handle payment success from deep link
  const handlePaymentSuccessDeepLink = async () => {
    try {
      setShowImpactLoader(true);

      // Poll user profile to check if subscription is active
      const isSubscriptionActive = await pollUserProfile(3);

      if (isSubscriptionActive) {
        // Only navigate once the backend confirms the sub is active
        navigation.replace('MainStack', {
          screen: 'tabs',
          params: { screen: 'home' },
        });
      } else {
        setShowImpactLoader(false);
        Alert.alert(
          'Subscription Pending',
          'Your payment was successful, but your subscription is still activating. Please check your profile in a moment.',
        );
      }
    } catch (error) {
      console.error('Payment success handling error:', error);
      setShowImpactLoader(false);
      Alert.alert(
        'Error',
        'Failed to verify subscription. Please contact support.',
      );
    }
  };

  // Handle deep link for payment success
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('[DeepLink][QuickDonate]', url);
      if (url === 'https://onepali-backend.onrender.com/subscription/success') {
        handlePaymentSuccessDeepLink();
      }
    });

    return () => subscription.remove();
  }, [navigation]);

  const item = DATA[index];

  if (showImpactLoader) {
    return <ImpactLoader />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            marginTop: Platform.select({
              ios: verticalScale(15),
              android: insets.top ? insets.top : verticalScale(30),
            }),
            marginBottom: Platform.select({
              ios: insets.bottom
                ? verticalScale(isTablet ? 10 : 0)
                : verticalScale(15),
              android: insets.bottom ? verticalScale(10) : verticalScale(15),
            }),
          },
        ]}
        edges={['top', 'bottom']}
      >
        <View style={{ flex: 1, paddingHorizontal: horizontalScale(16) }}>
          <View style={styles.header}>
            {!reservationSeconds && (
              <TouchableOpacity
                onPress={() => {
                  navigation.pop(1);
                  navigation.goBack();
                }}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#E5E7EF',
                  borderRadius: 100,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: 32,
                  width: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CustomIcon Icon={ICONS.BackArrowWithBg} />
              </TouchableOpacity>
            )}
            <Image
              source={IMAGES.OnePaliLogo}
              style={styles.logo}
            />
          </View>
          <View style={styles.headingContainer}>
            {/* Heading letters */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <CustomText
                fontFamily='GabaritoSemiBold'
                fontSize={42}
                color={COLORS.darkText}
              >
                Start giving
              </CustomText>
            </View>
            {/* Subheading letters */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {reservationSeconds && reservationSeconds > 0 ? (
                <CustomText
                  fontFamily='GabaritoRegular'
                  fontSize={18}
                  color={COLORS.appText}
                  style={{ textAlign: 'center', marginTop: 8 }}
                >
                  {`#${claimedNumber} reserved for ${reservationSeconds}s`}
                </CustomText>
              ) : (
                <CustomText
                  color={COLORS.redColor}
                  fontFamily='GabaritoRegular'
                  fontSize={18}
                >
                  {`#${claimedNumber} Expired`}
                </CustomText>
              )}
            </View>
          </View>
          <View>
            <Image
              source={IMAGES.PeoplesDonating}
              style={styles.image}
            />
          </View>
          <View style={styles.donationText}>
            <CustomText
              fontFamily='GabaritoSemiBold'
              fontSize={responsiveFontSize(
                selectedPlan.type === 'custom' && Number(customAmount) > 9999
                  ? 68
                  : 72,
              )}
              color={COLORS.darkText}
              style={styles.amountText}
            >
              {selectedPlan.type === 'custom'
                ? `$${customAmount}`
                : `$${
                    visiblePlans.find((p) => p.id === selectedPlan.id)
                      ?.amount || 1
                  }`}
            </CustomText>
            <CustomText
              fontFamily='GabaritoSemiBold'
              fontSize={responsiveFontSize(42)}
              color={COLORS.appText}
              style={styles.perMonthText}
            >
              /mo
            </CustomText>
          </View>

          <View
            style={{
              width: wp(100) - horizontalScale(16 * 2),
            }}
          >
            {joinedPosition! % 2 === 0 && (
              <CustomText
                fontFamily='GabaritoMedium'
                fontSize={15}
                style={{
                  color: COLORS.darkText,
                  marginBottom: verticalScale(16),
                  textAlign: 'center',
                }}
              >
                {getImpactText(selectedPlanAmount)}
              </CustomText>
              // <View
              //   style={{
              //     alignItems: "center",
              //     marginTop: verticalScale(16),
              //   }}
              // >
              //   <TouchableOpacity
              //     style={{
              //       flexDirection: "row",
              //       gap: horizontalScale(6),
              //       width: wp(100) - horizontalScale(14 * 2),
              //       alignItems: "center",
              //     }}
              //     activeOpacity={0.8}
              //     onPress={() => {
              //       setIsChecked((prev) => !prev);
              //     }}
              //   >
              //     {isChecked ? (
              //       <CustomIcon
              //         Icon={ICONS.CheckedIcon}
              //         height={verticalScale(24)}
              //         width={horizontalScale(24)}
              //       />
              //     ) : (
              //       <CustomIcon
              //         Icon={ICONS.CheckboxInput}
              //         height={verticalScale(24)}
              //         width={horizontalScale(24)}
              //       />
              //     )}
              //     <CustomText
              //       fontFamily="SourceSansRegular"
              //       fontSize={13}
              //       color={COLORS.appText}
              //       style={{ flexShrink: 1 }}
              //     >
              //       I’ll cover the $
              //       {(
              //         processingFeeIncludedAmount - Number(selectedPlanAmount)
              //       ).toFixed(2)}{" "}
              //       processing fee to maximize my impact.
              //     </CustomText>
              //   </TouchableOpacity>
              // </View>
            )}
            {joinedPosition! % 2 === 0 ? (
              <DonationSlider
                value={selectedPlanAmount}
                onChange={(val: number) => {
                  setSelectedPlan({
                    id: 'custom',
                    type: 'custom',
                    amount: val,
                  });
                  setCustomAmount(String(val));
                }}
              />
            ) : (
              <View style={styles.toggleWrapper}>
                {visiblePlans.map((plan, idx) => {
                  const isSelected = selectedPlan.id === plan.id;
                  const isDisable = !reservationSeconds || isLoading;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        styles.toggleItem,
                        {
                          backgroundColor: isSelected
                            ? COLORS.darkGreen
                            : COLORS.greyish,
                          opacity: isDisable ? 0.5 : 1,
                        },
                      ]}
                      disabled={isDisable}
                      activeOpacity={0.9}
                      onPress={() => {
                        HapticFeedback.trigger('impactLight', hapticOptions);
                        if (plan.type === 'custom') {
                          setShowCustomAmountModal(true);
                          return;
                        }
                        setSelectedPlan(plan);
                      }}
                    >
                      {plan.type === 'custom' ? (
                        <CustomIcon
                          Icon={
                            isSelected ? ICONS.WhitePencil : ICONS.PencilIcon
                          }
                          width={18}
                          height={18}
                        />
                      ) : (
                        <CustomText
                          fontSize={18}
                          style={{
                            color: isSelected ? COLORS.white : COLORS.darkText,
                            fontFamily: FONTS.GabaritoSemiBold,
                          }}
                        >
                          ${plan.amount}
                        </CustomText>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {/* Custom Amount Modal */}
            <CustomAmounModal
              isVisible={showCustomAmountModal}
              setIsVisible={setShowCustomAmountModal}
              onConfirm={(amount) => {
                setCustomAmount(amount);
                setSelectedPlan({
                  id: 'custom',
                  type: 'custom',
                  amount: parseFloat(amount),
                });
              }}
              initialAmount={customAmount}
            />
          </View>

          <View
            style={{
              backgroundColor: COLORS.liteGreen,
              borderRadius: 50,
              marginVertical: verticalScale(16),
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: horizontalScale(12),
              paddingVertical: verticalScale(12),
              gap: horizontalScale(8),
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                transform: [{ translateY }],
                opacity,
              }}
            >
              <CustomIcon
                Icon={item.icon}
                height={verticalScale(36)}
                width={verticalScale(36)}
              />
            </Animated.View>

            <Animated.View
              style={{
                transform: [{ translateY }],
                opacity,
                flexShrink: 1,
                flex: 1,
              }}
            >
              <CustomText
                fontFamily='GabaritoMedium'
                fontSize={15}
                color={COLORS.darkGreen}
              >
                {item.text}
              </CustomText>
            </Animated.View>
          </View>
        </View>

        <View style={{ alignItems: 'center' }}>
          {!reservationSeconds ? (
            <PrimaryButton
              title='Claim New Number'
              onPress={() => {
                if (Platform.OS === 'android') {
                  GoogleSignin.signOut().then(() => {
                    navigation.pop(1);
                    navigation.goBack();
                    deleteLocalStorageData(STORAGE_KEYS.accessToken);
                    deleteLocalStorageData(STORAGE_KEYS.refreshToken);
                    deleteLocalStorageData(STORAGE_KEYS.expiresIn);
                  });
                } else {
                  navigation.pop(1);
                  navigation.goBack();
                }
              }}
              hapticFeedback
              hapticType='impactLight'
            />
          ) : Platform.OS === 'ios' ? (
            isPlatformPayAvailable ? (
              <View style={{ width: wp(90), alignItems: 'center' }}>
                <PrimaryButton
                  title='Donate with Apple Pay'
                  onPress={handlePlatformSetupIntent}
                  isLoading={isLoading}
                  style={{ marginTop: verticalScale(20) }}
                  hapticFeedback
                  disabled={isLoading}
                  hapticType='impactLight'
                  leftIcon={{
                    Icon: ICONS.AppleLogo,
                    width: verticalScale(16),
                    height: verticalScale(16),
                  }}
                />
              </View>
            ) : (
              <PrimaryButton
                title='Join Onepali'
                onPress={handleExternalPayment}
                isLoading={isLoading}
                style={{ marginTop: verticalScale(20) }}
                hapticFeedback
                hapticType='impactLight'
              />
            )
          ) : (
            <View style={{ width: wp(90), alignItems: 'center' }}>
              {isPlatformPayAvailable ? (
                <PlatformPayButton
                  type={PlatformPay.ButtonType.Donate}
                  onPress={handlePlatformSetupIntent}
                  appearance={PlatformPay.ButtonStyle.Black}
                  borderRadius={10}
                  disabled={isLoading}
                  style={{
                    marginTop: verticalScale(20),
                    height: verticalScale(50),
                    width: wp(90),
                  }}
                />
              ) : (
                <PrimaryButton
                  title='Join OnePali'
                  onPress={handleSetupIntent}
                  isLoading={isLoading}
                  style={{ marginTop: verticalScale(20) }}
                  hapticFeedback
                  hapticType='impactLight'
                />
              )}
              {isPlatformPayAvailable && (
                <TouchableOpacity
                  onPress={handleSetupIntent}
                  // onPress={handleExternalPayment}
                  disabled={isLoading}
                  style={{ marginTop: verticalScale(12) }}
                >
                  <CustomText
                    fontSize={14}
                    color={COLORS.darkText}
                    fontFamily='GabaritoMedium'
                    style={{ textDecorationLine: 'underline' }}
                  >
                    Use other payment methods
                  </CustomText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default QuickDonate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.appBackground,
  },
  safeArea: {
    flex: 1,
    marginTop: verticalScale(15),
  },
  logo: {
    width: horizontalScale(54),
    height: verticalScale(54),
    resizeMode: 'contain',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingContainer: {
    marginTop: verticalScale(24),
    alignItems: 'center',
  },
  image: {
    width: wp(90),
    height: hp(24),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: verticalScale(10),
  },
  donationText: {
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  amountText: {
    marginRight: horizontalScale(0),
  },
  perMonthText: {},
  toggleWrapper: {
    flexDirection: 'row',
    borderRadius: 100,
    gap: horizontalScale(8),
  },
  toggleItem: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: verticalScale(12),
  },

  toggleItemActive: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 30,
  },
  toggleText: {
    fontFamily: FONTS.GabaritoSemiBold,
    color: COLORS.darkText,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  slidingBg: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    backgroundColor: COLORS.darkGreen,
    borderRadius: 999,
  },
});
