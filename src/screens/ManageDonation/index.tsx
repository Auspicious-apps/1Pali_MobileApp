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
import HapticFeedback from "react-native-haptic-feedback";

const ManageDonation: FC<ManageDonationScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { stripePlans, selectedPlanId, selectedPlanData } = useAppSelector(
    (state) => state.stripePlans,
  );

  const isSamePlanAsCurrent = selectedPlanId === user?.stripePriceId;
  const isUserActive = user?.subscriptionStatus === "ACTIVE";
  const isCancelling =
    user?.subscriptionStatus === "CANCELLING" || user?.cancelAtPeriodEnd;

  const [enabled, setEnabled] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [previousPlanId, setPreviousPlanId] = useState<string | null>(null);

  const [feesAmount, setFeesAmount] = useState({
    amount: "",
    planId: "",
  });

  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toggleWidth, setToggleWidth] = useState(0);
    const slideAnim = React.useRef(new Animated.Value(0)).current;
    const visiblePlans = stripePlans.filter(
      (plan) => !plan.metadata.calculationMethod,
    );
    const ITEM_WIDTH = toggleWidth > 0 ? toggleWidth / visiblePlans.length : 0;
  

  // Edge case: Check if fee plan is available
  const isFeesPlanAvailable = !!feesAmount.planId && feesAmount.amount !== "0";

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

        const selectPlan = activePlans.filter(
          (p) => p.id === selectedPlanId,
        )[0];

        if (selectPlan.metadata.calculationMethod === "reverse-fee") {
          setEnabled(true);
        }

        dispatch(setStripePlans(activePlans));
        dispatch(setSelectedPlanData(selectPlan));
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
  }, []);

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
  }, [selectedPlanData, stripePlans, selectedPlanId]);

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
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.headerLogo}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <CustomIcon Icon={ICONS.backArrow} height={26} width={26} />
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
          fontFamily="SourceSansRegular"
          fontSize={14}
          color={COLORS.appText}
          style={styles.subHeading}
        >
          Change donation amount, or cancel recurring donations
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
          {/* Heading */}

          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={14}
            style={{
              color: COLORS.appText,
              textAlign: "center",
              marginTop: verticalScale(32),
            }}
          >
            Current Selection:
          </CustomText>

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

            {/* <View style={styles.toggleWrapper}>
              {stripePlans
                .filter((plan) => !plan.metadata.calculationMethod)
                .map((plan, index) => {
                  const isSelected = selectedPlanData?.nickname.includes(
                    plan.nickname,
                  );
                  const isFirst = index === 0;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        // Edge case: Reset fees toggle when manually selecting a different plan
                        setEnabled(false);
                        setPreviousPlanId(null);
                        dispatch(setSelectedPlanId(plan.id));
                        dispatch(setSelectedPlanData(plan));
                      }}
                      disabled={isUpdatingPlan}
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
            </View> */}

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
                .filter((plan) => !plan.metadata.calculationMethod)
                .map((plan, index) => {
                  const isSelected = selectedPlanData?.nickname.includes(
                    plan.nickname,
                  );

                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={styles.toggleItem}
                      activeOpacity={0.9}
                      onPress={() => {
                        HapticFeedback.trigger("impactLight", hapticOptions);
                        setEnabled(false);
                        setPreviousPlanId(null);
                        setSelectedPlan(plan.id);
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
                  fontFamily="SourceSansMedium"
                  fontSize={14}
                  style={{ color: COLORS.appText }}
                >
                  Sure, I’ll cover the ${feesAmount.amount} processing fee
                </CustomText>
              </View>

              <CustomSwitch
                value={enabled}
                onValueChange={(value) => {
                  // Edge case: Prevent toggle if fees plan not available
                  if (value && !isFeesPlanAvailable) {
                    Toast.show({
                      type: "error",
                      text1: "Not Available",
                      text2:
                        "Processing fees option is not available for this plan.",
                    });
                    return;
                  }

                  // Edge case: Prevent toggle while updating plan
                  if (isUpdatingPlan) {
                    return;
                  }

                  // Edge case: Store previous plan when enabling, restore when disabling
                  if (value) {
                    if (selectedPlanId) {
                      setPreviousPlanId(selectedPlanId);
                    }
                    setEnabled(true);
                    // Auto-select the fee plan
                    if (feesAmount.planId) {
                      dispatch(setSelectedPlanId(feesAmount.planId));
                    }
                  } else {
                    setEnabled(false);
                    // Restore previous plan
                    if (previousPlanId) {
                      dispatch(setSelectedPlanId(previousPlanId));
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
              fontFamily="SourceSansMedium"
              fontSize={14}
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
    marginTop: verticalScale(32),
  },

  subHeading: {
    textAlign: "center",
  },

  card: {
    backgroundColor: "rgba(248, 248, 251, 1)",
    borderRadius: 20,
    padding: 16,
    marginTop: verticalScale(8),
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
