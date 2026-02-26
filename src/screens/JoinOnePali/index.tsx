import {
  confirmPlatformPaySetupIntent,
  isPlatformPaySupported,
  PlatformPay,
  PlatformPayButton,
  useStripe,
} from "@stripe/stripe-react-native";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
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
import HapticFeedback from "react-native-haptic-feedback";
import ImpactLoader from "../../components/ImpactLoader";

const JoinOnePali: FC<JoinOnePaliProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const [enabled, setEnabled] = useState(true);
  const { user, claimedNumber, reservationToken } = useAppSelector(
    (state) => state.user,
  );
  const reservationSeconds = useAppSelector(selectReservationSeconds);
  const { stripePlans } = useAppSelector((state) => state.stripePlans);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPlanData, setSelectedPlanData] = useState<Plan | null>(null);
  const [correspondingGenerousPlan, setCorrespondingGenerousPlan] =
    useState<Plan | null>(null);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [showCard, setShowCard] = useState(false);
  const [toggleWidth, setToggleWidth] = useState(0);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const [showImpactLoader, setShowImpactLoader] = useState(false);
  const visiblePlans = stripePlans.filter(
    (p) => p.metadata.category === "base",
  );
  const ITEM_WIDTH = toggleWidth > 0 ? toggleWidth / visiblePlans.length : 0;

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

      const planId = enabled ? correspondingGenerousPlan?.id : selectedPlan;

      console.log(planId);

      if (user && user.hasPaymentMethod) {
        setShowImpactLoader(true);
        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmSetupIntent,
            {
              priceId: planId,
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
            priceId: planId,
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
              priceId: planId,
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

  const handleAppleSetupIntent = async () => {
    try {
      setIsLoading(true);
      if (!selectedPlan) {
        Alert.alert("Error", "Please select a plan");
        setIsLoading(false);
        return;
      }
      const planId = enabled ? correspondingGenerousPlan?.id : selectedPlan;

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
            priceId: planId,
          },
        );

        const { clientSecret, amount, currency } = response?.data?.data || {};

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
              allowCreditCards: true,
              isEmailRequired: true,
              currencyCode: currency,
              label: "OnePali Supporter Membership",
              merchantCountryCode: "US",
              testEnv: true,
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
              priceId: planId,
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
        const corespondingPlan = activePlans.find(
          (p) =>
            p.metadata.category === "generosity" &&
            p.metadata.netAmount === activePlans[0]?.metadata.netAmount,
        );
        setCorrespondingGenerousPlan(corespondingPlan || null);
      }
    } catch (error) {
      console.log("Error fetching plans:", error);
    } finally {
      setLoadingPlans(false);
      setIsInitialLoading(false);
    }
  };

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
    if (!reservationSeconds) {
      setShowCard(false);
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

  if (showImpactLoader) {
    return <ImpactLoader />;
  }

  if (isInitialLoading) {
    return (
      <View style={styles.fullScreenLoader}>
        <ActivityIndicator size="large" color={COLORS.darkText} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
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
              {/* You’re almost in */}
              Start donating
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
                {`Number #${claimedNumber} reserved for ${reservationSeconds}s`}
              </CustomText>
            ) : (
              <CustomText
                color={COLORS.redColor}
                fontFamily="GabaritoRegular"
                fontSize={18}
              >
                {`Number #${claimedNumber} Expired`}
              </CustomText>
            )}
          </View>
        </View>

        <View
          style={{
            paddingVertical: 16,
            marginHorizontal: horizontalScale(10),
            width: wp(90),
          }}
        >
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
                    HapticFeedback.trigger("impactLight", hapticOptions);
                    setSelectedPlan(plan.id);
                    setSelectedPlanData(plan);
                    const corespondingPlan = stripePlans.find(
                      (p) =>
                        p.metadata.category === "generosity" &&
                        p.metadata.netAmount === plan.metadata.netAmount,
                    );

                    setCorrespondingGenerousPlan(corespondingPlan || null);
                  }}
                  disabled={isLoading}
                >
                  <CustomText
                    fontSize={18}
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
          <CustomText
            fontSize={13}
            color={COLORS.appText}
            fontFamily="SourceSansRegular"
          >
            Includes an additional $
            {selectedPlanData?.metadata?.processingFee || 0} for processing to
            maximize impact
          </CustomText>
        </View>

        {/* Payment Plan section  */}
        {!showCard && (
          <View style={styles.card}>
            <CustomText
              fontSize={20}
              fontFamily="GabaritoSemiBold"
              color={COLORS.darkText}
              style={{ marginBottom: verticalScale(12) }}
            >
              What you’ll support
            </CustomText>

            {/* Benefits */}
            <View style={styles.row}>
              <CustomIcon Icon={ICONS.LikedIcon} height={16} width={16} />
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={15}
                style={{ color: COLORS.appText }}
              >
                Monthly donation to Gaza (via MECA)
              </CustomText>
            </View>

            <View style={styles.row}>
              <CustomIcon Icon={ICONS.LikedIcon} height={16} width={16} />
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={15}
                style={{ color: COLORS.appText }}
              >
                Weekly artwork from students in Palestine
              </CustomText>
            </View>

            <View style={styles.row}>
              <CustomIcon Icon={ICONS.LikedIcon} height={16} width={16} />
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={15}
                style={{ color: COLORS.appText }}
              >
                Ongoing updates on how funds are used
              </CustomText>
            </View>
            <View style={styles.divider} />

            {/* Footer */}
            <View style={styles.footer}>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={18}
                style={{ color: COLORS.darkText, flex: 1 }}
              >
                Support OnePali (optional)
              </CustomText>

              <CustomSwitch
                value={enabled}
                onValueChange={setEnabled}
                thumbColorOn="#FFFFFF"
                thumbColorOff={COLORS.white}
                trackColorOn={[COLORS.darkGreen, COLORS.darkGreen]}
                trackColorOff={[COLORS.grey, COLORS.grey]}
              />
            </View>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={15}
              style={{ color: COLORS.appText }}
            >
              This mission runs on your generosity. $0.25 helps keep OnePali
              running and growing.
            </CustomText>
          </View>
        )}

        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            paddingTop: verticalScale(10),
          }}
        >
          {reservationSeconds && reservationSeconds > 0 && (
            <View
              style={{
                flexDirection: "row",
                width: wp(90),
                justifyContent: "space-between",
                marginTop: verticalScale(12),
              }}
            >
              <CustomText
                fontSize={18}
                color={COLORS.darkText}
                fontFamily="GabaritoRegular"
              >
                Total Monthly Donation
              </CustomText>
              <CustomText
                fontSize={18}
                color={COLORS.darkText}
                fontFamily="GabaritoRegular"
              >
                ${selectedPlanData?.amount! + (enabled ? 0.25 : 0)}/mo
              </CustomText>
            </View>
          )}

          <View style={{ alignItems: "center" }}>
            {!reservationSeconds ? (
              <PrimaryButton
                title="Choose a new number"
                onPress={() => {
                  navigation.pop(1);
                  navigation.goBack();
                }}
                style={{ marginTop: verticalScale(20) }}
                hapticFeedback
                hapticType="impactLight"
              />
            ) : isApplePaySupported ? (
              // <PrimaryButton
              //   title={Platform.OS === "ios" ? "Apple Pay" : "Google Pay"}
              //   onPress={handleAppleSetupIntent}
              //   leftIcon={{
              //     Icon: Platform.OS === "ios" ? ICONS.AppleLogo : ICONS.GoogleIcon,
              //     width: 22,
              //     height: 22,
              //   }}
              //   isLoading={isLoading}
              //   style={{ marginTop: verticalScale(20) }}
              //   hapticFeedback
              //   hapticType="impactLight"
              // />
              <PlatformPayButton
                type={PlatformPay.ButtonType.Donate} // This tells Stripe: "Give me the official Apple Donate button"
                onPress={handleAppleSetupIntent}
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

            {reservationSeconds && reservationSeconds > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  width: Platform.OS === "ios" ? wp(50) : wp(50),
                }}
              >
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={12}
                  color={COLORS.grayColor}
                  style={{
                    textAlign: "center",
                    marginTop: verticalScale(16),
                    width: wp(50),
                  }}
                >
                  By joining OnePali, you accept our{" "}
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL("https://onepali.app/terms-condition");
                    }}
                  >
                    <CustomText
                      fontFamily="GabaritoMedium"
                      fontSize={12}
                      color={COLORS.grayColor}
                      style={{ textDecorationLine: "underline" }}
                    >
                      Terms of Use
                    </CustomText>
                  </TouchableOpacity>{" "}
                  <TouchableOpacity activeOpacity={1}>
                    <CustomText
                      fontFamily="GabaritoMedium"
                      fontSize={12}
                      color={COLORS.grayColor}
                    >
                      and{" "}
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL("https://onepali.app/privacy-policy");
                    }}
                  >
                    <CustomText
                      fontFamily="GabaritoMedium"
                      fontSize={12}
                      color={COLORS.grayColor}
                      style={{ textDecorationLine: "underline" }}
                    >
                      Privacy Policy
                    </CustomText>
                  </TouchableOpacity>
                </CustomText>
              </View>
            )}
          </View>
        </View>
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
    marginTop: verticalScale(5),
  },
  header: {
    width: wp(90),
    flexDirection: "row",
    marginTop: Platform.OS === "android" ? verticalScale(15) : verticalScale(0),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(12),
  },
  logo: {
    width: horizontalScale(54),
    height: verticalScale(54),
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
    marginTop: verticalScale(5),
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

  divider: {
    borderBottomWidth: 1,
    borderColor: COLORS.inputBackground,
    marginVertical: verticalScale(12),
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
    gap: horizontalScale(10),
    marginBottom: verticalScale(8),
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
    marginBottom: verticalScale(8),
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
    paddingHorizontal: horizontalScale(20),
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
  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
