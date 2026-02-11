import {
  confirmPlatformPaySetupIntent,
  isPlatformPaySupported,
  PlatformPay,
  useStripe
} from "@stripe/stripe-react-native";
import React, { FC, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FONTS from "../../assets/fonts";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import CustomSwitch from "../../components/CustomSwitch";
import { CustomText } from "../../components/CustomText";
import PrimaryButton from "../../components/PrimaryButton";
import {
  setSelectedPlanId,
  setStripePlans,
} from "../../redux/slices/StripePlans";
import {
  clearReservationTimer,
  selectReservationSeconds,
  selectReservationStatus,
  setBadges,
  setUserData,
} from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { ConsfirmSetupIntentApiResponse } from "../../service/ApiResponses/ConfirmSetupIntentApiResponse";
import { CreateApplePaySetupIntentApiResponse } from "../../service/ApiResponses/CreateApplePaySetupIntentApiResponse";
import { CreateSetupIntentResponse } from "../../service/ApiResponses/CreateSetupIntent";
import {
  GetAllStripeePlansResponse,
  Plan,
} from "../../service/ApiResponses/GetAllStripePLans";
import { GetUserProfileApiResponse } from "../../service/ApiResponses/GetUserProfile";
import { fetchData, postData } from "../../service/ApiService";
import { JoinOnePaliProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import {
  horizontalScale,
  hp,
  responsiveFontSize,
  verticalScale,
  wp,
} from "../../utils/Metrics";

const JoinOnePali: FC<JoinOnePaliProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const [enabled, setEnabled] = useState(true);
  const { user, claimedNumber, reservationToken } = useAppSelector(
    (state) => state.user,
  );
  const reservationStatus = useAppSelector(selectReservationStatus);
  const reservationSeconds = useAppSelector(selectReservationSeconds);
  const { stripePlans } = useAppSelector((state) => state.stripePlans);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);

  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPlanData, setSelectedPlanData] = useState<Plan | null>(null);
  const [feesAmount, setFeesAmount] = useState({
    amount: "",
    planId: "",
  });

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [showCard, setShowCard] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [toggleWidth, setToggleWidth] = useState(0);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const visiblePlans = stripePlans.filter((p) => !p.metadata.calculationMethod);

  const ITEM_WIDTH = toggleWidth > 0 ? toggleWidth / visiblePlans.length : 0;

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
        await new Promise((resolve) => setTimeout(() => resolve(true), 5000));
        return await pollUserProfile(retries - 1);
      }

      return false; // All retries exhausted without "active" status
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(() => resolve(true), 5000));
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

      const planId = enabled ? feesAmount.planId : selectedPlan;

      if (user && user.hasPaymentMethod) {
        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmSetupIntent,
            {
              priceId: planId,
              reservationToken: reservationToken,
            },
          );

        if (confirmSetupIntentresponse.data.success) {
          // Start polling instead of a single fetch
          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.navigate("MainStack", {
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
        const response = await postData<CreateSetupIntentResponse>(
          ENDPOINTS.CreateSetupIntent,
          {
            priceId: planId,
          },
        );

        const { clientSecret, customerId, setupIntentId } =
          response?.data?.data || {};

        const { error: initError } = await initPaymentSheet({
          setupIntentClientSecret: clientSecret,
          merchantDisplayName: "1Pali",
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
          throw new Error(
            `Payment initialization failed: ${initError.message}`,
          );
        }

        const { error: paymentError } = await presentPaymentSheet();

        if (paymentError) {
          Alert.alert("Payment failed", paymentError.message);
          return;
        }

        if (!setupIntentId) {
          throw new Error("Missing setup intent or payment method");
        }

        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmSetupIntent,
            {
              priceId: planId,
              reservationToken: reservationToken,
              setupIntentId,
            },
          );

        if (confirmSetupIntentresponse.data.success) {
          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.navigate("MainStack", {
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
      setIsLoading(false);
    }
  };

  const handleAppleSetupIntent = async () => {
    try {
      setIsLoading(true);
      if (!selectedPlan) {
        Alert.alert("Error", "Please select a plan");
        return;
      }
      const planId = enabled ? feesAmount.planId : selectedPlan;

      if (user && user.hasPaymentMethod && user.defaultPaymentMethodId) {
        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmApplePaySetupIntent,
            {
              paymentMethodId: user.defaultPaymentMethodId,
              priceId: planId,
              reservationToken: reservationToken,
              provider: Platform.OS === "ios" ? "APPLE_PAY" : "GOOGLE_PAY",
            },
          );

        if (confirmSetupIntentresponse.data.success) {
          // Start polling instead of a single fetch
          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.navigate("MainStack", {
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
            priceId: planId,
          },
        );

        const { clientSecret, amount, currency } = response?.data?.data || {};

        const { error: initError, setupIntent } =
          await confirmPlatformPaySetupIntent(clientSecret, {
            applePay: {
              cartItems: [
                {
                  label: "1Pali Supporter Membership",
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
              allowCreditCards: true,
              isEmailRequired: true,
              currencyCode: currency,
              label: "1Pali Supporter Membership",
              merchantCountryCode: "US",
              testEnv: true,
            },
          });

        if (initError) {
          throw new Error(
            `Payment initialization failed: ${initError.message}`,
          );
        }

        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmApplePaySetupIntent,
            {
              paymentMethodId: setupIntent?.paymentMethod?.id,
              priceId: planId,
              reservationToken: reservationToken,
              provider: Platform.OS === "ios" ? "APPLE_PAY" : "GOOGLE_PAY",
            },
          );

        if (confirmSetupIntentresponse.data.success) {
          const isSubscriptionActive = await pollUserProfile(3);

          if (isSubscriptionActive) {
            // Only navigate once the backend confirms the sub is active
            navigation.navigate("MainStack", {
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

  const getAllPlans = async () => {
    try {
      setLoadingPlans(true);

      const response = await fetchData<GetAllStripeePlansResponse>(
        ENDPOINTS.GetStripePlans,
      );

      if (response?.data?.data?.plans?.length) {
        const activePlans = response?.data?.data?.plans.filter(
          (plans) => plans?.active && plans?.interval === "month",
        );

        dispatch(setStripePlans(activePlans));
        setSelectedPlan(activePlans[0]?.id);
        setSelectedPlanData(activePlans[0]);
      }
    } catch (error) {
      console.log("Error fetching plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (selectedPlanData && stripePlans.length) {
      const currentBothPLans = stripePlans.filter((p) =>
        p.nickname.includes(selectedPlanData?.nickname),
      );

      const planWithFees = currentBothPLans.find(
        (p) => p.metadata.calculationMethod === "reverse-fee",
      );

      const calculatedFee = planWithFees
        ? (
            planWithFees.amount - parseFloat(planWithFees.metadata.netAmount)
          ).toFixed(2)
        : "0";

      setFeesAmount({ amount: calculatedFee, planId: planWithFees?.id || "" });
    }
  }, [selectedPlan, selectedPlanData, stripePlans]);

  useEffect(() => {
    getAllPlans();
  }, []);

  useEffect(() => {
    (async function () {
      setIsApplePaySupported(await isPlatformPaySupported());
    })();
  }, [isPlatformPaySupported]);

  // Handle UI changes when reservation expires
  useEffect(() => {
    if (reservationSeconds === 0) {
      setShowCard(false);
      setShowDisclaimer(false);
      setShowButton(true);
      dispatch(clearReservationTimer());
    }
  }, [reservationSeconds, dispatch]);

  useEffect(() => {
    const index = visiblePlans.findIndex((p) => p.id === selectedPlan);

    if (index >= 0 && ITEM_WIDTH > 0) {
      Animated.timing(slideAnim, {
        toValue: index * ITEM_WIDTH,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [selectedPlan, ITEM_WIDTH]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <Image source={IMAGES.LogoText} style={styles.logo} />
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
              You’re almost in
            </CustomText>
          </View>

          {/* Subheading letters */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            {reservationSeconds && reservationSeconds > 0 ? (
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
            )}
          </View>
        </View>

        {/* Payment Plan section  */}
        {!showCard && (
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={22}
                color={COLORS.darkText}
              >
                {reservationSeconds === 0
                  ? "OnePali Membership"
                  : "OnePali Supporter"}
              </CustomText>
            </View>

            <View
              style={styles.toggleWrapper}
              onLayout={(e) => {
                setToggleWidth(e.nativeEvent.layout.width - 8);
              }}
            >
              {ITEM_WIDTH > 0 && (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.slidingBg,
                    {
                      width: ITEM_WIDTH,
                      transform: [{ translateX: slideAnim }],
                    },
                  ]}
                />
              )}

              {visiblePlans.map((plan) => {
                const isSelected = selectedPlan === plan.id;

                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={styles.toggleItem}
                    activeOpacity={0.9}
                    onPress={() => {
                      setSelectedPlan(plan.id);
                      setSelectedPlanData(plan);
                    }}
                    disabled={isLoading}
                  >
                    <CustomText
                      style={[
                        styles.toggleText,
                        isSelected && styles.toggleTextActive,
                      ]}
                    >
                      ${plan.metadata.netAmount || plan.amount}/mo
                    </CustomText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Benefits */}
            <View style={styles.row}>
              <CustomIcon Icon={ICONS.LikedIcon} height={16} width={16} />
              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={14}
                style={{ color: COLORS.appText }}
              >
                Monthly donation to Gaza (via MECA)
              </CustomText>
            </View>

            <View style={styles.row}>
              <CustomIcon Icon={ICONS.LikedIcon} height={16} width={16} />
              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={14}
                style={{ color: COLORS.appText }}
              >
                Weekly artwork from students in Palestine
              </CustomText>
            </View>

            <View style={styles.row}>
              <CustomIcon Icon={ICONS.LikedIcon} height={16} width={16} />
              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={14}
                style={{ color: COLORS.appText }}
              >
                Ongoing updates on how funds are used
              </CustomText>
            </View>
            <View style={styles.divider} />

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.trialRow}>
                <CustomText
                  fontFamily="SourceSansRegular"
                  fontSize={15}
                  style={{ color: COLORS.appText }}
                >
                  Sure, I’ll cover the ${feesAmount.amount} processing fee
                </CustomText>
              </View>

              <CustomSwitch
                value={enabled}
                onValueChange={setEnabled}
                thumbColorOn="#FFFFFF"
                thumbColorOff={COLORS.white}
                trackColorOn={[COLORS.darkGreen, COLORS.darkGreen]}
                trackColorOff={[COLORS.grey, COLORS.grey]}
              />
            </View>
          </View>
        )}
        {reservationSeconds !== 0 && (
          <Image
            source={IMAGES.JoinImage}
            resizeMode="cover"
            style={{
              width: wp(70),
              height: hp(18),
              marginTop: verticalScale(16),
            }}
          />
        )}
        {reservationSeconds === 0 ? (
          <PrimaryButton
            title="Choose a new number"
            onPress={() => {
              navigation.pop(1);
              navigation.goBack();
            }}
            style={{ marginTop: verticalScale(20) }}
          />
        ) : isApplePaySupported ? (
          <PrimaryButton
            title={Platform.OS === "ios" ? "Apple Pay" : "Google Pay"}
            onPress={handleAppleSetupIntent}
            leftIcon={{
              Icon: Platform.OS === "ios" ? ICONS.AppleLogo : ICONS.GoogleIcon,
              width: 22,
              height: 22,
            }}
            isLoading={isLoading}
            style={{ marginTop: verticalScale(20) }}
          />
        ) : (
          <PrimaryButton
            title="Join OnePali"
            onPress={handleSetupIntent}
            isLoading={isLoading}
            style={{ marginTop: verticalScale(20) }}
          />
        )}

        {reservationSeconds && reservationSeconds > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              width: Platform.OS === "ios" ? wp(50) : wp(50),
              marginTop: verticalScale(16),
            }}
          >
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={12}
              color={COLORS.grayColor}
              style={{ textAlign: "center", width: wp(50) }}
            >
              By joining OnePali, you accept our Terms of Use and Privacy Policy
            </CustomText>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default JoinOnePali;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.appBackground,
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
  },
  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
  },
  headingContainer: {
    marginTop: verticalScale(32),
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(248, 248, 251, 1)",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: horizontalScale(10),
    marginTop: verticalScale(16),
    width: wp(90),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: verticalScale(12),
  },

  divider: {
    borderBottomWidth: 1,
    borderColor: COLORS.inputBackground,
    marginBottom: verticalScale(8),
    marginTop: verticalScale(4),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
    marginBottom: verticalScale(4),
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(4),
  },
  toggleWrapper: {
    flexDirection: "row",
    alignSelf: "stretch",
    borderRadius: 100,
    marginBottom: verticalScale(12),
    width: "100%",
    backgroundColor: COLORS.white,
    padding: verticalScale(4),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 6,
  },
  toggleItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 2,
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(24),
  },
  toggleItemDivider: {
    // borderLeftWidth: 1,
    // borderColor: COLORS.greyish,
  },
  toggleItemActive: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 30,
  },
  toggleText: {
    fontFamily: FONTS.GabaritoSemiBold,
    fontSize:
      Platform.OS === "android"
        ? responsiveFontSize(16)
        : responsiveFontSize(18),
    color: COLORS.appText,
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
