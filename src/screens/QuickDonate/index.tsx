import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  confirmPlatformPaySetupIntent,
  initPaymentSheet,
  isPlatformPaySupported,
  PlatformPay,
  PlatformPayButton,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import HapticFeedback from "react-native-haptic-feedback";
import { SafeAreaView } from "react-native-safe-area-context";
import FONTS from "../../assets/fonts";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import CustomAmount, {
  CustomAmountSheetRef,
} from "../../components/Modal/CustomAmount";
import PrimaryButton from "../../components/PrimaryButton";
import { setSelectedPlanId } from "../../redux/slices/StripePlans";
import {
  clearReservationTimer,
  selectReservationSeconds,
  setBadges,
  setUserData,
} from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { ConsfirmSetupIntentApiResponse } from "../../service/ApiResponses/ConfirmSetupIntentApiResponse";
import { CreateApplePaySetupIntentApiResponse } from "../../service/ApiResponses/CreateApplePaySetupIntentApiResponse";
import { CreateExternalCheckoutSessionApiResponse } from "../../service/ApiResponses/CreateExternalCheckoutSessionApiResponse";
import { CreateSetupIntentResponse } from "../../service/ApiResponses/CreateSetupIntent";
import { GetUserProfileApiResponse } from "../../service/ApiResponses/GetUserProfile";
import { fetchData, postData } from "../../service/ApiService";
import { QuickDonateProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import STORAGE_KEYS from "../../utils/Constants";
import { deleteLocalStorageData } from "../../utils/Helpers";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";
import ImpactLoader from "../../components/ImpactLoader";

const visiblePlans = [
  {
    id: "plan_1",
    type: "amount",
    amount: 1,
  },
  {
    id: "plan_2",
    type: "amount",
    amount: 3,
  },
  {
    id: "plan_3",
    type: "amount",
    amount: 5,
  },
  {
    id: "custom",
    type: "custom",
  },
];

const QuickDonate: FC<QuickDonateProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  const { user, claimedNumber, reservationToken } = useAppSelector(
    (state) => state.user,
  );

  const reservationSeconds = useAppSelector(selectReservationSeconds);
  const [toggleWidth, setToggleWidth] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(visiblePlans[0]);
  const [customAmount, setCustomAmount] = useState("1");
  const ITEM_WIDTH = toggleWidth > 0 ? toggleWidth / visiblePlans.length : 0;
  const amountSheetRef = useRef<CustomAmountSheetRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showImpactLoader, setShowImpactLoader] = useState(false);

  const [isPlatformPayAvailable, setIsPlatformPayAvailable] = useState(false);

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
        profileResponse?.data?.data.subscriptionStatus === "ACTIVE" &&
        profileResponse.data.data.badges.badges.find(
          (badge) => badge.badge.category === "GROWTH",
        )
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
      if (!selectedPlan) {
        Alert.alert("Error", "Please select a plan");
        return;
      }

      if (user && user.hasPaymentMethod) {
        setShowImpactLoader(true);
        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmSetupIntent,
            {
              amountInDollars: selectedPlan.amount,
              productId: "prod_U37d188P2YNO0d",
              reservationToken: reservationToken,
            },
          );

        setIsLoading(false);
        if (confirmSetupIntentresponse.data.success) {
          // Start polling instead of a single fetch
          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.replace("MainStack", {
              screen: "tabs",
              params: { screen: "home" },
            });
          } else {
            setShowImpactLoader(false);
            Alert.alert(
              "Subscription Pending",
              "Your payment was successful, but your subscription is still activating. Please check your profile in a moment.",
            );
            // Optionally navigate anyway or stay on screen
          }
        }
      } else {
        const response = await postData<CreateSetupIntentResponse>(
          ENDPOINTS.CreateSetupIntent,
          {
            amountInDollars: selectedPlan.amount,
            productId: "prod_U37d188P2YNO0d",
          },
        );

        const { clientSecret, customerId, setupIntentId } =
          response?.data?.data || {};

        const { error: initError } = await initPaymentSheet({
          setupIntentClientSecret: clientSecret,
          merchantDisplayName: "OnePali",
          customerId: customerId,

          googlePay: {
            testEnv: true,
            merchantCountryCode: "US",
          },

          applePay: {
            merchantCountryCode: "US",
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
          console.log(paymentError, "OPOPPOP");

          Alert.alert("Payment failed", paymentError.message);
          return;
        }
        setShowImpactLoader(true);
        setIsLoading(false);

        if (!setupIntentId) {
          throw new Error("Missing setup intent or payment method");
        }

        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmSetupIntent,
            {
              // priceId: planId,
              amountInDollars: selectedPlan.amount,
              productId: "prod_U37d188P2YNO0d",
              reservationToken: reservationToken,
              setupIntentId,
            },
          );

        if (confirmSetupIntentresponse.data.success) {
          setShowImpactLoader(true);

          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.replace("MainStack", {
              screen: "tabs",
              params: { screen: "home" },
            });
          } else {
            Alert.alert(
              "Subscription Pending",
              "Your payment was successful, but your subscription is still activating. Please check your profile in a moment.",
            );
            // Optionally navigate anyway or stay on screen
          }
        }
      }
    } catch (error: any) {
      console.log("SetupIntent error:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setShowImpactLoader(false);
      setIsLoading(false);
    }
  };

  const handlePlatformSetupIntent = async () => {
    try {
      setIsLoading(true);
      if (!selectedPlan) {
        Alert.alert("Error", "Please select a plan");
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
              productId: "prod_U37d188P2YNO0d",
              reservationToken: reservationToken,
              provider: Platform.OS === "ios" ? "APPLE_PAY" : "GOOGLE_PAY",
            },
          );

        if (confirmSetupIntentresponse.data.success) {
          setIsLoading(false);
          setShowImpactLoader(true);
          // Start polling instead of a single fetch
          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.replace("MainStack", {
              screen: "tabs",
              params: { screen: "home" },
            });
          } else {
            Alert.alert(
              "Subscription Pending",
              "Your payment was successful, but your subscription is still activating. Please check your profile in a moment.",
            );
            // Optionally navigate anyway or stay on screen
          }
        }
      } else {
        const response = await postData<CreateApplePaySetupIntentApiResponse>(
          ENDPOINTS.CreateApplePaySetupIntent,
          {
            amountInDollars: selectedPlan.amount,
            productId: "prod_U37d188P2YNO0d",
          },
        );

        const { clientSecret, amount, currency, priceId } =
          response?.data?.data || {};

        const { error: initError, setupIntent } =
          await confirmPlatformPaySetupIntent(clientSecret, {
            applePay: {
              cartItems: [
                {
                  label: "OnePali Supporter Membership",
                  amount: amount.toString(),
                  paymentType: PlatformPay.PaymentType.Immediate,
                },
              ],
              merchantCountryCode: "US",
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
              label: "OnePali Supporter Membership",
              merchantCountryCode: "US",
              testEnv: true,
              merchantName: "OnePali",
              billingAddressConfig: {
                format: PlatformPay.BillingAddressFormat.Full,
                isPhoneNumberRequired: true,
                isRequired: true,
              },
            },
          });

        if (initError) {
          setIsLoading(false);
          throw new Error(
            `Payment initialization failed: ${initError.message}`,
          );
        }

        setIsLoading(false);
        setShowImpactLoader(true);

        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmApplePaySetupIntent,
            {
              paymentMethodId: setupIntent?.paymentMethod?.id,
              priceId: priceId,
              reservationToken: reservationToken,
              provider: Platform.OS === "ios" ? "APPLE_PAY" : "GOOGLE_PAY",
            },
          );

        if (confirmSetupIntentresponse.data.success) {
          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.replace("MainStack", {
              screen: "tabs",
              params: { screen: "home" },
            });
          } else {
            Alert.alert(
              "Subscription Pending",
              "Your payment was successful, but your subscription is still activating. Please check your profile in a moment.",
            );
          }
        }
      }
    } catch (error: any) {
      console.log("SetupIntent error:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExternalPayment = async () => {
    try {
      setIsLoading(true);
      if (!selectedPlan) {
        Alert.alert("Error", "Please select a plan");
        setIsLoading(false);
        return;
      }

      // Get checkout URL from backend
      const response = await postData<CreateExternalCheckoutSessionApiResponse>(
        ENDPOINTS.CreateExternalPaymentCheckoutLink,
        {
          amountInDollars: selectedPlan.amount,
          productId: "prod_U37d188P2YNO0d",
          successUrl:
            "https://onepali-backend.onrender.com/subscription/success",
          cancelUrl:
            "https://onepali-backend.onrender.com/subscription/cancelled",
          reservationToken: reservationToken,
        },
      );

      if (response?.data?.success && response?.data?.data?.checkoutUrl) {
        setIsLoading(false);

        // Alert user that they will be redirected to external payment processor
        Alert.alert(
          "Secure Payment",
          "You will be redirected to a secure payment page. This will open in your browser.",
          [
            {
              text: "Cancel",
              onPress: () => {},
              style: "cancel",
            },
            {
              text: "Continue",
              onPress: async () => {
                try {
                  // Open the checkout URL in default browser (Safari on iOS, Chrome on Android)
                  // COMPLIANT with Apple Guideline 3.2.2 - external payments must happen outside the app
                  await Linking.openURL(response?.data?.data?.checkoutUrl);
                } catch (error) {
                  console.error("Failed to open checkout URL:", error);
                  Alert.alert(
                    "Error",
                    "Unable to open payment page. Please try again.",
                  );
                }
              },
            },
          ],
        );
      } else {
        throw new Error("Invalid checkout URL received from server");
      }
    } catch (error: any) {
      console.log("External payment error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to process payment. Please try again.",
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

  if (showImpactLoader) {
    return <ImpactLoader />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={{ flex: 1, paddingHorizontal: horizontalScale(16) }}>
          <View style={styles.header}>
            <Image source={IMAGES.OnePaliLogo} style={styles.logo} />
          </View>
          <View style={styles.headingContainer}>
            {/* Heading letters */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={42}
                color={COLORS.darkText}
              >
                Start giving
              </CustomText>
            </View>
            {/* Subheading letters */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {reservationSeconds && reservationSeconds > 0 ? (
                <CustomText
                  fontFamily="GabaritoRegular"
                  fontSize={18}
                  color={COLORS.appText}
                  style={{ textAlign: "center", marginTop: 8 }}
                >
                  {`#${claimedNumber} reserved for ${reservationSeconds}s`}
                </CustomText>
              ) : (
                <CustomText
                  color={COLORS.redColor}
                  fontFamily="GabaritoRegular"
                  fontSize={18}
                >
                  {`#${claimedNumber} Expired`}
                </CustomText>
              )}
            </View>
          </View>
          <View>
            <Image source={IMAGES.PeoplesDonating} style={styles.image} />
          </View>
          <View style={styles.donationText}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={72}
              color={COLORS.darkText}
            >
              {selectedPlan.type === "custom"
                ? `$${customAmount}`
                : `$${
                    visiblePlans.find((p) => p.id === selectedPlan.id)
                      ?.amount || 1
                  }`}
            </CustomText>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={42}
              color={COLORS.appText}
            >
              /mo
            </CustomText>
          </View>
          <View
            style={{
              marginTop: verticalScale(12),
              width: wp(100) - horizontalScale(16 * 2),
            }}
          >
            <View style={styles.toggleWrapper}>
              {visiblePlans.map((plan, idx) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.toggleItem,
                      {
                        backgroundColor: isSelected
                          ? COLORS.darkGreen
                          : COLORS.greyish,
                      },
                    ]}
                    activeOpacity={0.9}
                    onPress={() => {
                      HapticFeedback.trigger("impactLight", hapticOptions);
                      if (plan.type === "custom") {
                        amountSheetRef.current?.open();
                        return;
                      }
                      setSelectedPlan(plan);
                    }}
                  >
                    {plan.type === "custom" ? (
                      <CustomIcon
                        Icon={isSelected ? ICONS.WhitePencil : ICONS.PencilIcon}
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
            {/* Custom Amount Modal */}
            <CustomAmount
              ref={amountSheetRef}
              onConfirm={(amount) => {
                setCustomAmount(amount);
                setSelectedPlan({
                  id: "custom",
                  type: "custom",
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
              marginTop: verticalScale(16),
              flexDirection: "row",
              alignItems: "center",
              padding: horizontalScale(12),
              gap: horizontalScale(8),
            }}
          >
            <CustomIcon
              Icon={ICONS.WinterClothes}
              height={verticalScale(36)}
              width={verticalScale(36)}
            />
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={15}
              color={COLORS.darkGreen}
            >
              {`8,339 children received warm winter \nclothes in 2025`}
            </CustomText>
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          <View style={{ alignItems: "center" }}>
            {!reservationSeconds ? (
              <PrimaryButton
                title="Choose a new number"
                onPress={() => {
                  if (Platform.OS === "android") {
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
                style={{ marginTop: verticalScale(20) }}
                hapticFeedback
                hapticType="impactLight"
              />
            ) : Platform.OS === "ios" ? (
              isPlatformPayAvailable ? (
                <View style={{ width: wp(90), alignItems: "center" }}>
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
                </View>
              ) : (
                <PrimaryButton
                  title="Join OnePali"
                  onPress={handleExternalPayment}
                  isLoading={isLoading}
                  style={{ marginTop: verticalScale(20) }}
                  hapticFeedback
                  hapticType="impactLight"
                />
              )
            ) : (
              <View style={{ width: wp(90), alignItems: "center" }}>
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
                    title="Join OnePali"
                    onPress={handleSetupIntent}
                    isLoading={isLoading}
                    style={{ marginTop: verticalScale(20) }}
                    hapticFeedback
                    hapticType="impactLight"
                  />
                )}
                {isPlatformPayAvailable && (
                  <TouchableOpacity
                    onPress={handleSetupIntent}
                    disabled={isLoading}
                    style={{ marginTop: verticalScale(12) }}
                  >
                    <CustomText
                      fontSize={14}
                      color={COLORS.darkText}
                      fontFamily="GabaritoMedium"
                      style={{ textDecorationLine: "underline" }}
                    >
                      Use other payment methods
                    </CustomText>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default QuickDonate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.appBackground,
  },
  safeArea: {
    flex: 1,
    marginTop: verticalScale(15),
  },
  logo: {
    width: horizontalScale(54),
    height: verticalScale(54),
    resizeMode: "contain",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  headingContainer: {
    marginTop: verticalScale(24),
    alignItems: "center",
  },
  image: {
    width: wp(85.2),
    height: hp(19.6),
    resizeMode: "cover",
    alignSelf: "center",
    marginTop: verticalScale(24),
  },
  donationText: {
    marginTop: verticalScale(24),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  toggleWrapper: {
    flexDirection: "row",
    borderRadius: 100,
    gap: horizontalScale(8),
  },
  toggleItem: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
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
    position: "absolute",
    left: 4,
    top: 4,
    bottom: 4,
    backgroundColor: COLORS.darkGreen,
    borderRadius: 999,
  },
});
