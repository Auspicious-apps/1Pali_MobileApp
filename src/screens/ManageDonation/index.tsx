import React, { FC, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import HapticFeedback from "react-native-haptic-feedback";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import FONTS from "../../assets/fonts";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import CustomSwitch from "../../components/CustomSwitch";
import { CustomText } from "../../components/CustomText";
import PrimaryButton from "../../components/PrimaryButton";
import {
  setSelectedPlanData,
  setSelectedPlanId,
  setStripePlans,
} from "../../redux/slices/StripePlans";
import { fetchUserProfile } from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { GetAllStripeePlansResponse } from "../../service/ApiResponses/GetAllStripePLans";
import { fetchData, postData } from "../../service/ApiService";
import { ManageDonationScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { formatDate } from "../../utils/Helpers";
import {
  horizontalScale,
  responsiveFontSize,
  verticalScale,
  wp,
} from "../../utils/Metrics";

const ManageDonation: FC<ManageDonationScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state?.user);
  const { stripePlans, selectedPlanId, selectedPlanData } = useAppSelector(
    (state) => state.stripePlans,
  );

  const isUserActive = user?.subscriptionStatus === "ACTIVE";

  const [enabled, setEnabled] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [previousPlanId, setPreviousPlanId] = useState<string | null>(null);

  const [feesAmount, setFeesAmount] = useState({
    amount: "",
    planId: "",
  });

  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toggleWidth, setToggleWidth] = useState(0);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const visiblePlans = stripePlans.filter(
    (plan) => plan.metadata.category === "base",
  );
  const ITEM_WIDTH = toggleWidth > 0 ? toggleWidth / visiblePlans.length : 0;

  // Edge case: Determine if plan has changed
  const isPlanChanged =
    (enabled && feesAmount.planId !== user?.stripePriceId) ||
    (!enabled && selectedPlanId !== user?.stripePriceId);

  const hapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  const handlePlanChange = async () => {
    // Edge case: Validate plan selection before API call
    if (enabled && !feesAmount.planId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Processing fee plan is not available for this donation amount.",
      });
      return;
    }

    // Edge case: Prevent update if no actual change
    if (!isPlanChanged) {
      Toast.show({
        type: "info",
        text1: "No Changes",
        text2: "Please select a different plan to update.",
      });
      return;
    }

    setIsUpdatingPlan(true);

    const planId = enabled ? feesAmount.planId : selectedPlanId;
    try {
      const planChangeResponse = await postData(ENDPOINTS.UpdatePlan, {
        newPriceId: planId,
      });

      if (planChangeResponse?.data?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your donation plan has been updated.",
        });
        if (planId) {
          setPreviousPlanId(planId);
        }
        dispatch(fetchUserProfile());
      }
    } catch (error: any) {
      console.log("Error updating plan:", error);
      // Edge case: Handle specific error messages
      if (
        error.message.includes(
          "Cannot switch plans while your subscription is scheduled for cancellation.",
        )
      ) {
        Toast.show({
          type: "error",
          text1: "Cannot Update",
          text2: "Cannot switch plans while scheduled for cancellation.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error updating your plan. Please try again.",
        });
      }
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const getAllPlans = async () => {
    try {
      setLoadingPlans(true);

      const response = await fetchData<GetAllStripeePlansResponse>(
        ENDPOINTS.GetStripePlans,
      );

      if (response?.data?.data?.plans?.length) {
        const activePlans = response?.data?.data?.plans;

        // Use user's actual current plan as the source of truth
        const currentPlanId = user?.stripePriceId || selectedPlanId;
        const selectPlan = activePlans.find((p) => p.id === currentPlanId);

        if (selectPlan) {
          // Set Redux state with the actual current plan
          dispatch(setSelectedPlanId(selectPlan.id));
          dispatch(setSelectedPlanData(selectPlan));

          // Determine if toggle should be enabled based on plan category
          if (selectPlan.metadata.category === "generosity") {
            setEnabled(true);
            // Find the corresponding base plan with the same netAmount
            const basePlan = activePlans.find(
              (p) =>
                p.metadata.category === "base" &&
                p.metadata.netAmount === selectPlan.metadata.netAmount,
            );
            if (basePlan) {
              setPreviousPlanId(basePlan.id);
            }
          } else if (selectPlan.metadata.category === "base") {
            setEnabled(false);
            setPreviousPlanId(null);
          }
        }

        dispatch(setStripePlans(activePlans));
      }
    } catch (error) {
      console.log("Error fetching plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleResubscribe = async () => {
    // Edge case: Validate plan selection before API call
    if (enabled && !feesAmount.planId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Processing fee plan is not available for this donation amount.",
      });
      return;
    }

    setIsUpdatingPlan(true);

    const planId = enabled ? feesAmount.planId : selectedPlanId;

    try {
      const planChangeResponse = await postData(ENDPOINTS.resubscribePlan, {
        priceId: planId,
      });

      if (planChangeResponse?.data?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your donation plan has been reactivated.",
        });
        if (planId) {
          setPreviousPlanId(planId);
        }
        dispatch(fetchUserProfile());
      }
    } catch (error: any) {
      console.log("Error updating plan:", error);
      if (
        error.message.includes(
          "Cannot switch plans while your subscription is scheduled for cancellation.",
        )
      ) {
        Alert.alert(
          "Error",
          `Cannot switch plans while your subscription is scheduled for cancellation. Your current plan will end on ${formatDate(
            error.error.endDate,
          )}. You can switch to a new plan after this date.`,
        );
      } else {
        Alert.alert(
          "Error",
          error.message ||
            "There was an error re-subscribing to your plan. Please try again.",
        );
      }
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const onButtonPress = () => {
    if (isUserActive) {
      handlePlanChange();
    } else {
      handleResubscribe();
    }
  };

  const getButtonTitle = () => {
    const isSamePlan = selectedPlanId === user?.stripePriceId;
    const status = user?.subscriptionStatus;

    if (status === "ACTIVE") {
      return isSamePlan ? "Current Donation" : "Update Donation";
    }

    if (status === "CANCELLING") {
      return "Resume Donation";
    }

    if (status === "CANCELLED") {
      return "Reactivate Donation";
    }

    return "Update Donation";
  };

  useEffect(() => {
    getAllPlans();
  }, [user?.stripePriceId]);

  useEffect(() => {
    if (selectedPlanData && stripePlans.length) {
      // Find both base and generosity plans with the same netAmount
      const matchingNetAmount = selectedPlanData.metadata.netAmount;

      const planWithFees = stripePlans.find(
        (p) =>
          p.metadata.category === "generosity" &&
          p.metadata.netAmount === matchingNetAmount,
      );

      const calculatedFee = planWithFees
        ? (
            planWithFees.amount - parseFloat(planWithFees.metadata.netAmount)
          ).toFixed(2)
        : "0";

      setFeesAmount({ amount: calculatedFee, planId: planWithFees?.id || "" });
    }
  }, [selectedPlanData, stripePlans]);

  useEffect(() => {
    if (!selectedPlanData || ITEM_WIDTH <= 0) return;

    const index = visiblePlans.findIndex(
      (p) => p.metadata.netAmount === selectedPlanData?.metadata.netAmount,
    );

    if (index === -1) return;

    Animated.timing(slideAnim, {
      toValue: index * ITEM_WIDTH,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selectedPlanData, ITEM_WIDTH, visiblePlans]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.headerLogo}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <CustomIcon
            Icon={ICONS.backArrow}
            height={verticalScale(26)}
            width={verticalScale(26)}
          />
        </TouchableOpacity>

        <Image source={IMAGES.LogoText} style={styles.logo} />

        <View style={{ width: 24 }} />
      </View>

      <View style={styles.headingContainer}>
        <CustomText
          fontFamily="GabaritoSemiBold"
          fontSize={36}
          color={COLORS.darkText}
        >
          Manage Donations
        </CustomText>

        <CustomText
          fontFamily="GabaritoRegular"
          fontSize={18}
          color={COLORS.appText}
          style={styles.subHeading}
        >
          Update your OnePali subscription
        </CustomText>
      </View>
      {loadingPlans ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={COLORS.darkText} size={"large"} />
          <CustomText>Loading Plans</CustomText>
        </View>
      ) : (
        <>
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

              {stripePlans
                .filter((plan) => plan.metadata.category === "base")
                .map((plan, index) => {
                  const isSelected =
                    selectedPlanData?.metadata.netAmount ===
                    plan.metadata.netAmount;

                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={styles.toggleItem}
                      activeOpacity={0.9}
                      onPress={() => {
                        HapticFeedback.trigger("impactLight", hapticOptions);
                        setPreviousPlanId(null);
                        dispatch(setSelectedPlanId(plan.id));
                        dispatch(setSelectedPlanData(plan));
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

          <View style={styles.card}>
            <View style={{ gap: verticalScale(8) }}>
              {/* Benefits */}
              <View style={styles.row}>
                <CustomIcon
                  Icon={ICONS.LikedIcon}
                  height={verticalScale(16)}
                  width={verticalScale(16)}
                />
                <CustomText
                  fontFamily="GabaritoRegular"
                  fontSize={15}
                  style={{ color: COLORS.appText }}
                >
                  Monthly donation to Gaza (via MECA)
                </CustomText>
              </View>

              <View style={styles.row}>
                <CustomIcon
                  Icon={ICONS.LikedIcon}
                  height={verticalScale(16)}
                  width={verticalScale(16)}
                />
                <CustomText
                  fontFamily="GabaritoRegular"
                  fontSize={15}
                  style={{ color: COLORS.appText }}
                >
                  Weekly artwork from students in Palestine
                </CustomText>
              </View>

              <View style={styles.row}>
                <CustomIcon
                  Icon={ICONS.LikedIcon}
                  height={verticalScale(16)}
                  width={verticalScale(16)}
                />
                <CustomText
                  fontFamily="GabaritoRegular"
                  fontSize={15}
                  style={{ color: COLORS.appText }}
                >
                  Ongoing updates on how funds are used
                </CustomText>
              </View>
            </View>

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
                onValueChange={(value) => {
                  // Edge case: Prevent toggle while updating plan
                  if (isUpdatingPlan) {
                    return;
                  }

                  // Edge case: Store base plan when enabling, switch to fee plan
                  if (value) {
                    // Prevent toggle if fees plan not available
                    if (!feesAmount.planId || feesAmount.amount === "0") {
                      Toast.show({
                        type: "error",
                        text1: "Not Available",
                        text2:
                          "Processing fees option is not available for this plan.",
                      });
                      return;
                    }

                    // Store current base plan as previousPlanId (in case user disables later)
                    const currentBasePlan = stripePlans.find(
                      (p) =>
                        p.metadata.category === "base" &&
                        p.metadata.netAmount ===
                          selectedPlanData?.metadata.netAmount,
                    );

                    if (currentBasePlan) {
                      setPreviousPlanId(currentBasePlan.id);
                    }

                    setEnabled(true);
                    // Auto-select the fee plan
                    if (feesAmount.planId) {
                      dispatch(setSelectedPlanId(feesAmount.planId));
                      // Find and update selectedPlanData to the fee plan
                      const feePlan = stripePlans.find(
                        (p) => p.id === feesAmount.planId,
                      );
                      if (feePlan) {
                        dispatch(setSelectedPlanData(feePlan));
                      }
                    }
                  } else {
                    // Disable: switch back to base plan
                    setEnabled(false);

                    if (previousPlanId) {
                      dispatch(setSelectedPlanId(previousPlanId));
                      // Find and update selectedPlanData to the base plan
                      const basePlan = stripePlans.find(
                        (p) => p.id === previousPlanId,
                      );
                      if (basePlan) {
                        dispatch(setSelectedPlanData(basePlan));
                      }
                      setPreviousPlanId(null);
                    }
                  }
                }}
                thumbColorOn="#FFFFFF"
                thumbColorOff={COLORS.white}
                trackColorOn={[COLORS.darkGreen, COLORS.darkGreen]}
                trackColorOff={[COLORS.grey, COLORS.grey]}
              />
            </View>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={15}
              style={{ color: COLORS.appText, marginTop: verticalScale(8) }}
            >
              This mission runs on your generosity. $0.25 helps keep OnePali
              running and growing.
            </CustomText>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={15}
              style={{ color: COLORS.appText, marginTop: verticalScale(20) }}
            >
              {user?.cancelAtPeriodEnd
                ? "Your subscription will end on " +
                  new Date(user?.currentPeriodEnd).toLocaleDateString()
                : "Your next billing date is " +
                  new Date(user?.currentPeriodEnd!).toLocaleDateString()}
            </CustomText>

            {/* Save Button */}
            <PrimaryButton
              title={getButtonTitle()}
              onPress={onButtonPress}
              disabled={
                isUserActive // Edge case: Disable if no plan change detected
                  ? !isPlanChanged ||
                    // Edge case: Disable if fees are enabled but plan not available
                    (enabled && !feesAmount.planId) ||
                    // Edge case: Disable while updating
                    isUpdatingPlan
                  : false
              }
              style={styles.saveButton}
              isLoading={isUpdatingPlan}
            />
            {user?.subscriptionStatus === "ACTIVE" && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Cancel Monthly Donation",
                    "Are you sure you want to cancel your monthly donation?",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Confirm",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            const response = await postData(
                              ENDPOINTS.cancelPlan,
                              {},
                            );

                            if (response?.data?.success) {
                              Toast.show({
                                type: "success",
                                text1: "Success",
                                text2:
                                  "Your monthly donation has been cancelled.",
                              });
                              dispatch(fetchUserProfile());
                            }
                          } catch (error) {
                            console.log(
                              "Error cancelling subscription:",
                              error,
                            );
                            Toast.show({
                              type: "error",
                              text1: "Error",
                              text2:
                                "There was an error cancelling your donation. Please try again.",
                            });
                          }
                        },
                      },
                    ],
                  );
                }}
              >
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={16}
                  color={COLORS.darkRed}
                  style={{ textAlign: "center", marginTop: verticalScale(12) }}
                >
                  Cancel Monthly Donation
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={15}
            style={{
              color: COLORS.appText,
              textAlign: "center",
              marginTop: verticalScale(24),
            }}
          >
            Current Subscription:{" "}
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={15}
              style={{
                color: COLORS.darkText,
              }}
            >
              ${user?.currentSubscriptionPrice}/mo
            </CustomText>
          </CustomText>
        </>
      )}
    </SafeAreaView>
  );
};

export default ManageDonation;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: horizontalScale(20),
  },

  logoWrapper: {
    alignItems: "center",
  },

  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
  },

  headingContainer: {
    alignItems: "center",
    marginTop: verticalScale(15),
  },

  subHeading: {
    textAlign: "center",
    marginTop: verticalScale(8),
  },

  card: {
    backgroundColor: "rgba(248, 248, 251, 1)",
    borderRadius: 20,
    padding: 16,
    marginTop: verticalScale(14),
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
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(12),
    gap: horizontalScale(10),
  },
  trialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(4),
  },
  // toggleWrapper: {
  //   flexDirection: "row",
  //   borderWidth: 1,
  //   borderColor: COLORS.greyish,
  //   alignSelf: "stretch",
  //   borderRadius: 100,
  //   marginBottom: verticalScale(12),
  //   width: "100%",
  //   backgroundColor: COLORS.white,
  //   overflow: "hidden",
  // },
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
  // toggleItem: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   paddingVertical: verticalScale(10),
  //   backgroundColor: COLORS.white,
  // },
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
    borderLeftWidth: 1,
    borderColor: COLORS.greyish,
  },
  toggleItemActive: {
    backgroundColor: COLORS.darkGreen,
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

  currentSelection: {
    marginTop: verticalScale(22),
    marginBottom: verticalScale(8),
  },
  saveButton: {
    width: "100%",
    marginTop: verticalScale(12),
  },
  headerLogo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
    marginTop: verticalScale(10),
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
