import {
  confirmPlatformPaySetupIntent,
  isPlatformPaySupported,
  PlatformPay,
  PlatformPayButton,
  useStripe,
} from "@stripe/stripe-react-native";
import React, { FC, useEffect, useState } from "react";
import {
  Alert,
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
  setBadges,
  setUserData,
} from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { ConsfirmSetupIntentApiResponse } from "../../service/ApiResponses/ConfirmSetupIntentApiResponse";
import { CreateApplePaySetupIntentApiResponse } from "../../service/ApiResponses/CreateApplePaySetupIntentApiResponse";
import { CreateSetupIntentResponse } from "../../service/ApiResponses/CreateSetupIntent";
import { GetAllStripeePlansResponse } from "../../service/ApiResponses/GetAllStripePLans";
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
  const { user, claimedNumber, reservationToken, reservationSeconds } =
    useAppSelector((state) => state.user);
  const { stripePlans } = useAppSelector((state) => state.stripePlans);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);

  const [isExpired, setIsExpired] = useState(false);

  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [showCard, setShowCard] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showButton, setShowButton] = useState(false);

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

      if (user && user.hasPaymentMethod) {
        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmSetupIntent,
            {
              priceId: selectedPlan,
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
            priceId: selectedPlan,
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
              priceId: selectedPlan,
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

      if (user && user.hasPaymentMethod && user.defaultPaymentMethodId) {
        const confirmSetupIntentresponse =
          await postData<ConsfirmSetupIntentApiResponse>(
            ENDPOINTS.ConfirmApplePaySetupIntent,
            {
              paymentMethodId: user.defaultPaymentMethodId,
              priceId: selectedPlan,
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
        const response = await postData<CreateApplePaySetupIntentApiResponse>(
          ENDPOINTS.CreateApplePaySetupIntent,
          {
            priceId: selectedPlan,
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
              amount: amount,
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
              priceId: selectedPlan,
              reservationToken: reservationToken,
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
      }
    } catch (error) {
      console.log("Error fetching plans:", error);
    } finally {
      setLoadingPlans(false);
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

  useEffect(() => {
    if (reservationSeconds !== null && reservationSeconds <= 0) {
      setIsExpired(true);
      dispatch(clearReservationTimer());
    }
  }, [reservationSeconds]);

  useEffect(() => {
    if (isExpired) {
      setShowCard(false);
      setShowDisclaimer(false);
      setShowButton(true);
    }
  }, [isExpired]);

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
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={16}
              color={isExpired ? COLORS.redColor : COLORS.appText}
              style={{ textAlign: "center" }}
            >
              {isExpired
                ? "Number Expired"
                : `Number #${claimedNumber} reserved for ${reservationSeconds}s`}
            </CustomText>
          </View>
        </View>

        {/* Payment Plan section  */}
        {!showCard && (
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <CustomText
                fontFamily="GabaritoMedium"
                fontSize={22}
                color={COLORS.darkText}
              >
                {isExpired ? "OnePali Membership" : "OnePali Supporter"}
              </CustomText>
            </View>

            <View style={styles.toggleWrapper}>
              {stripePlans.map((plan, index) => {
                const isSelected = selectedPlan === plan.id;
                const isFirst = index === 0;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPlan(plan.id)}
                    style={[
                      styles.toggleItem,
                      !isFirst && styles.toggleItemDivider,
                      isSelected && styles.toggleItemActive,
                    ]}
                  >
                    <CustomText
                      style={[
                        styles.toggleText,
                        isSelected && styles.toggleTextActive,
                      ]}
                    >
                      ${plan?.amount}/{plan?.interval}
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
                  Sure, I’ll cover the $0.43 processing fee
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
        {!isExpired && (
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
        {isApplePaySupported ? (
          isLoading ? (
            <PrimaryButton
              title={""}
              onPress={() => {}}
              isLoading={isLoading}
              style={{ marginTop: verticalScale(20) }}
            />
          ) : (
            <PlatformPayButton
              onPress={handleAppleSetupIntent}
              style={{
                width: wp(90),
                height: hp(6),
                borderRadius: 10,
                marginTop: verticalScale(20),
              }}
            />
          )
        ) : (
          <PrimaryButton
            title={isExpired ? "Choose a new number" : "Join OnePali"}
            onPress={() => {
              if (isExpired) {
                navigation.navigate("claimSpot");
              } else {
                handleSetupIntent();
              }
            }}
            isLoading={isLoading}
            style={{ marginTop: verticalScale(20) }}
          />
        )}
        {!isExpired && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              width: Platform.OS === "ios" ? wp(50) : wp(50),
              marginTop: verticalScale(24),
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
    borderWidth: 1,
    borderColor: COLORS.greyish,
    alignSelf: "stretch",
    borderRadius: 100,
    marginBottom: verticalScale(12),
    width: "100%",
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  toggleItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(10),
    backgroundColor: COLORS.white,
  },
  toggleItemDivider: {
    borderLeftWidth: 1,
    borderColor: COLORS.greyish,
  },
  toggleItemActive: {
    backgroundColor: COLORS.darkGreen,
  },
  toggleText: {
    fontFamily: FONTS.GabaritoMedium,
    fontSize: responsiveFontSize(16),
    color: COLORS.darkText,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
});
