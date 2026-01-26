import {
  Image,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import React, { FC, useState, useRef, useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import IMAGES from "../../assets/Images";
import { CustomText } from "../../components/CustomText";
import COLORS from "../../utils/Colors";
import {
  horizontalScale,
  hp,
  responsiveFontSize,
  verticalScale,
  wp,
} from "../../utils/Metrics";
import { JoinOnePaliProps } from "../../typings/routes";
import CustomSwitch from "../../components/CustomSwitch";
import CustomMaskedText from "../../components/CustomMaskedText";
import FONTS from "../../assets/fonts";
import CustomIcon from "../../components/CustomIcon";
import ICONS from "../../assets/Icons";
import PrimaryButton from "../../components/PrimaryButton";
import { fetchData, postData } from "../../service/ApiService";
import {
  GetAllStripeePlansResponse,
  Plan,
} from "../../service/ApiResponses/GetAllStripePLans";
import ENDPOINTS from "../../service/ApiEndpoints";
import { PaymentMethod, useStripe } from "@stripe/stripe-react-native";
import { CreateSetupIntentResponse } from "../../service/ApiResponses/CreateSetupIntent";
import { ConfirmPaymentIntentResponse } from "../../service/ApiResponses/ConfirmPaymentIntent";
import { RootState, useAppSelector } from "../../redux/store";

const JoinOnePali: FC<JoinOnePaliProps> = ({ navigation, route }) => {
  const [enabled, setEnabled] = useState(true);
  const { user, claimedNumber, reservationToken } = useAppSelector(
    (state) => state.user,
  );

  // Animation setup
  const heading = "You’re almost in";
  const initialTimer = undefined;
  const subheadingBase = `Number #${claimedNumber} reserved for `;
  const disclaimer =
    "By joining OnePali, you accept our Terms of Use and Privacy Policy";

  const headingLetters = useMemo(
    () => heading.split("").map((l) => (l === " " ? "\u00A0" : l)),
    [],
  );
  const [timer, setTimer] = useState<any>(initialTimer);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const subheading = `${subheadingBase}${timer}s`;
  const subheadingLetters = useMemo(
    () => subheading.split("").map((l) => (l === " " ? "\u00A0" : l)),
    [subheading],
  );
  const disclaimerLetters = useMemo(
    () => disclaimer.split("").map((l) => (l === " " ? "\u00A0" : l)),
    [],
  );

  const headingLetterAnims = useRef(
    headingLetters.map(() => new Animated.Value(100)),
  ).current;
  const subheadingLetterAnims = useRef(
    subheadingLetters.map(() => new Animated.Value(100)),
  ).current;
  const disclaimerLetterAnims = useRef(
    disclaimerLetters.map(() => new Animated.Value(100)),
  ).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const smallImpactAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const [showSubheading, setShowSubheading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleSetupIntent = async () => {
    try {
      setIsLoading(true);
      if (!selectedPlan) {
        Alert.alert("Error", "Please select a plan");
        return;
      }

      if (user && user.hasPaymentMethod) {
        const confirmSetupIntentresponse = await postData(
          ENDPOINTS.ConfirmSetupIntent,
          {
            // setupIntentId: setupIntentId,
            priceId: selectedPlan,
            reservationToken: reservationToken,
          },
        );

        if (confirmSetupIntentresponse.data.success) {
          navigation.navigate("MainStack", {
            screen: "tabs",
            params: { screen: "home", params: { number: claimedNumber! } },
          });
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
          await postData<ConfirmPaymentIntentResponse>(
            ENDPOINTS.ConfirmSetupIntent,
            {
              priceId: selectedPlan,
              reservationToken: reservationToken,
              setupIntentId,
            },
          );

        if (confirmSetupIntentresponse?.data?.success) {
          if (confirmSetupIntentresponse.data.success) {
            navigation.navigate("MainStack", {
              screen: "tabs",
              params: { screen: "home", params: { number: claimedNumber! } },
            });
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

        setPlans(activePlans);
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
    // Animation timings for letters
    const letterDuration = 220;
    const letterDelay = 20;

    // Animate heading letters
    Animated.stagger(
      letterDelay,
      headingLetterAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: letterDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start(() => {
      setShowSubheading(true);
      // Animate subheading letters
      Animated.stagger(
        letterDelay,
        subheadingLetterAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 0,
            duration: letterDuration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ).start(() => {
        setShowCard(true);
        // Animate card (Payment Plan section)
        Animated.timing(cardAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          // Animate "Small amount, collective impact." line
          Animated.timing(smallImpactAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            setShowImage(true);
            // Animate image
            Animated.timing(imageAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }).start(() => {
              setShowButton(true);
              // Animate button
              Animated.timing(buttonAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }).start(() => {
                setShowDisclaimer(true);
                // Animate disclaimer letters
                Animated.stagger(
                  letterDelay,
                  disclaimerLetterAnims.map((anim) =>
                    Animated.timing(anim, {
                      toValue: 0,
                      duration: letterDuration,
                      easing: Easing.out(Easing.cubic),
                      useNativeDriver: true,
                    }),
                  ),
                ).start(() => {
                  setTimerStarted(true);
                });
              });
            });
          });
        });
      });
    });
  }, []);

  // Timer countdown effect (must be a separate effect)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timerStarted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev: any) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStarted, timer]);

  useEffect(() => {
    if (timerStarted && timer === 0) {
      setIsExpired(true);
    }
  }, [timerStarted, timer]);

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
            {headingLetters.map((letter, i) => (
              <Animated.View
                key={i}
                style={{
                  transform: [{ translateX: headingLetterAnims[i] ?? 0 }],
                  opacity: headingLetterAnims[i].interpolate({
                    inputRange: [0, 100],
                    outputRange: [1, 0],
                  }),
                }}
              >
                <CustomText
                  fontFamily="GabaritoSemiBold"
                  fontSize={42}
                  color={COLORS.darkText}
                >
                  {letter}
                </CustomText>
              </Animated.View>
            ))}
          </View>

          {/* Subheading letters */}
          {showSubheading && !isExpired && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              {subheadingLetters.map((letter, i) => (
                <Animated.View
                  key={i}
                  style={{
                    transform: [{ translateX: subheadingLetterAnims[i] ?? 0 }],
                    opacity: subheadingLetterAnims[i].interpolate({
                      inputRange: [0, 100],
                      outputRange: [1, 0],
                    }),
                  }}
                >
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={16}
                    color={COLORS.appText}
                    style={{ textAlign: "center" }}
                  >
                    {letter}
                  </CustomText>
                </Animated.View>
              ))}
            </View>
          )}
          {showSubheading && isExpired && (
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={16}
              color={COLORS.redColor}
              style={{ textAlign: "center", marginTop: 8 }}
            >
              Number expired
            </CustomText>
          )}
        </View>

        {/* Payment Plan section  */}
        {showCard && (
          <Animated.View
            style={{
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            }}
          >
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={22}
                  color={COLORS.darkText}
                >
                  OnePali Supporter
                </CustomText>
              </View>

              <View style={styles.toggleWrapper}>
                {plans.map((plan, index) => {
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
                <CustomIcon Icon={ICONS.HeartFill} height={16} width={16} />
                <CustomText
                  fontFamily="SourceSansRegular"
                  fontSize={14}
                  style={{ color: COLORS.appText }}
                >
                  Monthly donation to Gaza (via MECA)
                </CustomText>
              </View>

              <View style={styles.row}>
                <CustomIcon Icon={ICONS.HeartFill} height={16} width={16} />
                <CustomText
                  fontFamily="SourceSansRegular"
                  fontSize={14}
                  style={{ color: COLORS.appText }}
                >
                  Weekly artwork from students in Palestine
                </CustomText>
              </View>

              <View style={styles.row}>
                <CustomIcon Icon={ICONS.HeartFill} height={16} width={16} />
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
          </Animated.View>
        )}
        {showImage && !isExpired && (
          <Animated.View
            style={{
              opacity: imageAnim,
              transform: [
                {
                  scale: imageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
              marginTop: verticalScale(16),
            }}
          >
            <Image
              source={IMAGES.JoinImage}
              resizeMode="cover"
              style={{ width: wp(70), height: hp(18) }}
            />
          </Animated.View>
        )}
        {showButton && (
          <Animated.View
            style={{
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
              alignItems: "center",
            }}
          >
            <PrimaryButton
              title={isExpired ? "Choose a new number" : "Join OnePali"}
              onPress={() => {
                if (isExpired) {
                  navigation.navigate("claimSpot");
                } else {
                  // navigation.navigate("MainStack", {
                  //   screen: "tabs",
                  //   params: { screen: "home", params: { number } },
                  // });
                  handleSetupIntent();
                  // PaymentIntent();
                }
              }}
              isLoading={isLoading}
              style={{ marginTop: verticalScale(20) }}
            />
          </Animated.View>
        )}
        {showDisclaimer && !isExpired && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              width: Platform.OS === "ios" ? wp(50) : wp(53),
              marginTop: verticalScale(15),
            }}
          >
            {disclaimerLetters.map((letter, i) => (
              <Animated.View
                key={i}
                style={{
                  transform: [{ translateX: disclaimerLetterAnims[i] ?? 0 }],
                  opacity: disclaimerLetterAnims[i].interpolate({
                    inputRange: [0, 100],
                    outputRange: [1, 0],
                  }),
                }}
              >
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={12}
                  color={COLORS.grayColor}
                  style={{ textAlign: "center" }}
                >
                  {letter}
                </CustomText>
              </Animated.View>
            ))}
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
    backgroundColor: "rgba(255, 255, 255, 1)",
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
