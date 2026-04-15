import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { CustomText } from "../../components/CustomText";
import CustomAmount, {
  CustomAmountSheetRef,
} from "../../components/Modal/CustomAmount";
import PrimaryButton from "../../components/PrimaryButton";
import { fetchMySubscription } from "../../redux/slices/SubscriptionSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { postData } from "../../service/ApiService";
import { ManageDonationScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import {
  calculateProcessingFeeIncludedAmount,
  formatDate,
} from "../../utils/Helpers";
import {
  horizontalScale,
  responsiveFontSize,
  verticalScale,
  wp,
} from "../../utils/Metrics";

const donationPlans = [
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

const presetDonationPlans = donationPlans.filter(
  (plan) => plan.type === "amount",
);

const ManageDonation: FC<ManageDonationScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { subscriptionData, loading: loadingPlans } = useAppSelector(
    (state) => state.subscription,
  );
  const stripeProductId = useAppSelector(
    (state) => state.stripeBootstrap.productId,
  );

  const [selectedPlan, setSelectedPlan] = useState(donationPlans[0]);
  const [customAmount, setCustomAmount] = useState("1");
  const amountSheetRef = useRef<CustomAmountSheetRef>(null);

  const isUserActive = subscriptionData?.status === "ACTIVE";

  const [enabled, setEnabled] = useState(false);
  const [currentSubscriptionAmount, setCurrentSubscriptionAmount] = useState<
    number | null
  >(null);
  const [currentOptedInFees, setCurrentOptedInFees] = useState(false);

  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const selectedPlanAmountNumber =
    selectedPlan.type === "custom"
      ? Number(customAmount)
      : selectedPlan.amount ?? 0;
  const normalizedSelectedAmount = Number.isFinite(selectedPlanAmountNumber)
    ? selectedPlanAmountNumber
    : 0;

  const processingFeeIncludedAmount = normalizedSelectedAmount
    ? calculateProcessingFeeIncludedAmount(normalizedSelectedAmount)
    : 0;
  const processingFeeDifference = Math.max(
    0,
    processingFeeIncludedAmount - normalizedSelectedAmount,
  );
  const displayAmountLabel =
    selectedPlan.type === "custom"
      ? customAmount
      : `${selectedPlan.amount ?? 0}`;

  const processingFeeLabel =
    processingFeeDifference && Number.isFinite(Number(processingFeeDifference))
      ? Number(processingFeeDifference).toFixed(2)
      : "0";

  const planOptions = useMemo(() => {
    return presetDonationPlans.map((plan) => ({
      plan,
    }));
  }, []);

  const handleProcessingFeeToggle = () => {
    setEnabled((prev) => !prev);
  };

  const handlePresetPlanSelect = (plan: (typeof donationPlans)[number]) => {
    setSelectedPlan(plan);
    setCustomAmount(String(plan.amount));
  };

  // Edge case: Determine if plan has changed
  const isPlanChanged =
    normalizedSelectedAmount !== currentSubscriptionAmount ||
    enabled !== currentOptedInFees;

  const hapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  const handlePlanChange = async () => {
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

    try {
      if (!stripeProductId) {
        Toast.show({
          type: "error",
          text1: "Stripe not ready",
          text2: "Please try again in a moment.",
        });
        return;
      }
      const planChangeResponse = await postData(ENDPOINTS.UpdatePlan, {
        amountInDollars: normalizedSelectedAmount,
        productId: stripeProductId,
        includesProcessingFees: enabled,
      });

      if (planChangeResponse?.data?.success) {
     
        // Refresh subscription data after updating
        dispatch(fetchMySubscription());
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

  // Watch Redux subscription data and update local state
  useEffect(() => {
    if (subscriptionData) {
      // Convert from cents to dollars
      const baseDonationAmount = subscriptionData.baseDonationAmount;
      const hasOptedIn = subscriptionData.hasOptedInForProcessingFees;

      // Set the current subscription amount and fees opt-in status
      setCurrentSubscriptionAmount(baseDonationAmount);
      setCurrentOptedInFees(hasOptedIn);
      setEnabled(hasOptedIn);

      // Find matching preset plan or set custom
      const matchingPlan = presetDonationPlans.find(
        (plan) => Number(plan.amount) === baseDonationAmount,
      );

      if (matchingPlan) {
        setSelectedPlan(matchingPlan);
        setCustomAmount(String(matchingPlan.amount));
      } else {
        // Amount doesn't match preset, set to custom
        setSelectedPlan({
          id: "custom",
          type: "custom",
          amount: baseDonationAmount,
        });
        setCustomAmount(baseDonationAmount.toString());
      }
    }
  }, [subscriptionData]);

  // Fetch subscription data on component mount if not already cached
  useEffect(() => {
    // if (!subscriptionData) {
    dispatch(fetchMySubscription());
    // }
  }, []);

  const handleResubscribe = async () => {
    setIsUpdatingPlan(true);

    try {
      if (!stripeProductId) {
        Toast.show({
          type: "error",
          text1: "Stripe not ready",
          text2: "Please try again in a moment.",
        });
        return;
      }
      const planChangeResponse = await postData(ENDPOINTS.resubscribePlan, {
        amountInDollars: normalizedSelectedAmount,
        productId: stripeProductId,
        includesProcessingFees: enabled,
      });

      if (planChangeResponse?.data?.success) {
        setTimeout(() => {
          dispatch(fetchMySubscription());
          setIsUpdatingPlan(false);
        }, 2000);
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
      setIsUpdatingPlan(false);
    } finally {
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
    const isSameAmount = normalizedSelectedAmount === currentSubscriptionAmount;
    const isSameFees = enabled === currentOptedInFees;
    const isNoChange = isSameAmount && isSameFees;
    const status = subscriptionData?.status;

    if (status === "ACTIVE") {
      return isNoChange ? "Current Donation" : "Update Donation";
    }

    if (status === "CANCELLING") {
      return "Restart Donation";
    }

    if (status === "CANCELLED") {
      return "Reactivate Donation";
    }

    return "Update Donation";
  };

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
        <Image source={IMAGES.OnePaliLogo} style={styles.logo} />
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
          <View style={styles.donationText}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={responsiveFontSize(72)}
              color={COLORS.darkText}
              style={styles.amountText}
            >
              {`$${displayAmountLabel}`}
            </CustomText>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={responsiveFontSize(42)}
              color={COLORS.appText}
              style={styles.perMonthText}
            >
              /mo
            </CustomText>
          </View>
          <View style={styles.toggleWrapper}>
            {planOptions.map(({ plan }) => {
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
                    handlePresetPlanSelect(plan);
                  }}
                >
                  <CustomText
                    fontSize={18}
                    style={{
                      color: isSelected ? COLORS.white : COLORS.darkText,
                      fontFamily: FONTS.GabaritoSemiBold,
                    }}
                  >
                    ${plan.amount}
                  </CustomText>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[
                styles.toggleItem,
                {
                  backgroundColor:
                    selectedPlan.type === "custom"
                      ? COLORS.darkGreen
                      : COLORS.greyish,
                },
              ]}
              activeOpacity={0.9}
              onPress={() => {
                HapticFeedback.trigger("impactLight", hapticOptions);
                amountSheetRef.current?.open();
              }}
            >
              <CustomIcon
                Icon={
                  selectedPlan.type === "custom"
                    ? ICONS.WhitePencil
                    : ICONS.PencilIcon
                }
                width={18}
                height={18}
              />
            </TouchableOpacity>
          </View>

          {/* {normalizedSelectedAmount > 0 && (
            <View style={styles.processingRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.processingCheckbox}
                onPress={handleProcessingFeeToggle}
              >
                {enabled ? (
                  <CustomIcon
                    Icon={ICONS.CheckedIcon}
                    height={verticalScale(24)}
                    width={horizontalScale(24)}
                  />
                ) : (
                  <CustomIcon
                    Icon={ICONS.CheckboxInput}
                    height={verticalScale(24)}
                    width={horizontalScale(24)}
                  />
                )}
                <CustomText
                  fontFamily="SourceSansRegular"
                  fontSize={13}
                  color={COLORS.appText}
                  style={{ flexShrink: 1 }}
                >
                  {`I'll cover the $${processingFeeLabel} processing fee to maximize my impact.`}
                </CustomText>
              </TouchableOpacity>
            </View>
          )} */}

          <View style={styles.card}>
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={20}
              color={COLORS.darkText}
            >
              With your donation
            </CustomText>
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
                Direct aid to children & families via MECA
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
                Weekly artwork from children in Palestine
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
                Updates on where funds are directed.
              </CustomText>
            </View>
          </View>

          {/* Save Button */}
          <PrimaryButton
            title={getButtonTitle()}
            onPress={onButtonPress}
            disabled={
              isUserActive // Edge case: Disable if no plan change detected
                ? !isPlanChanged || isUpdatingPlan
                : false
            }
            style={styles.saveButton}
            isLoading={isUpdatingPlan}
          />
          {subscriptionData?.status === "ACTIVE" && (
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
                            dispatch(fetchMySubscription());
                          }
                        } catch (error) {
                          console.log("Error cancelling subscription:", error);
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
          {/* <View
            style={{
              marginTop: verticalScale(24),
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={18}
              style={{
                color: COLORS.darkText,
              }}
            >
              Current Subscription:{" "}
            </CustomText>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={18}
              style={{
                color: COLORS.darkText,
              }}
            >
              ${user?.currentSubscriptionPrice}/mo
            </CustomText>
          </View> */}

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
    width: horizontalScale(54),
    height: verticalScale(54),
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: Platform.OS === "ios" ? verticalScale(0) : verticalScale(10),
  },

  header: {
    alignItems: "center",
    marginBottom: verticalScale(12),
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
    paddingVertical: verticalScale(30),
    paddingHorizontal: horizontalScale(10),
    borderTopWidth: 1,
    borderTopColor: "#E5E7EF",
    marginTop: verticalScale(20),
    width: wp(90),
    gap: verticalScale(10),
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
  processingRow: {
    alignItems: "center",
    marginTop: verticalScale(16),
  },
  processingCheckbox: {
    flexDirection: "row",
    gap: horizontalScale(6),
    width: wp(100) - horizontalScale(14 * 2),
    alignItems: "center",
  },
  processingRowDisabled: {
    opacity: 0.5,
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

  donationText: {
    marginTop: verticalScale(12),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
  },

  amountText: {
    marginRight: horizontalScale(0),
  },
  perMonthText: {
    marginBottom: verticalScale(4),
  },

  toggleWrapper: {
    flexDirection: "row",
    borderRadius: 100,
    gap: horizontalScale(8),
    marginTop: verticalScale(16),
  },

  toggleItem: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: verticalScale(12),
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
