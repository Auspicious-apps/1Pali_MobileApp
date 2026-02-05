import React, { FC, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import {
  horizontalScale,
  responsiveFontSize,
  verticalScale,
  wp,
} from "../../utils/Metrics";

const ManageDonation: FC<ManageDonationScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { stripePlans, selectedPlanId } = useAppSelector(
    (state) => state.stripePlans,
  );

  const [enabled, setEnabled] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const handlePlanChange = async () => {
    setIsUpdatingPlan(true);
    try {
      const planChangeResponse = await postData(ENDPOINTS.UpdatePlan, {
        newPriceId: selectedPlanId,
      });

      if (planChangeResponse?.data?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your donation plan has been updated.",
        });
      }
    } catch (error) {
      console.log("Error updating plan:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "There was an error updating your plan. Please try again.",
      });
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
        dispatch(setStripePlans(activePlans));
        dispatch(fetchUserProfile());
      }
    } catch (error) {
      console.log("Error fetching plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (!stripePlans.length) {
      getAllPlans();
    }
  }, [stripePlans]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
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

            <View style={styles.toggleWrapper}>
              {stripePlans.map((plan, index) => {
                const isSelected = selectedPlanId === plan.id;
                const isFirst = index === 0;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    activeOpacity={0.8}
                    onPress={() => dispatch(setSelectedPlanId(plan.id))}
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
                  fontFamily="SourceSansMedium"
                  fontSize={14}
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
              title={
                selectedPlanId === user?.stripePriceId
                  ? "Current donation"
                  : "Update donation"
              }
              onPress={handlePlanChange}
              disabled={selectedPlanId === user?.stripePriceId}
              style={styles.saveButton}
              isLoading={isUpdatingPlan}
            />
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
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default ManageDonation;

/* -------------------------------- STYLES -------------------------------- */

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
  },
});
