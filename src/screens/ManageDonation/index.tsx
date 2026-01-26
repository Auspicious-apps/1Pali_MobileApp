import React, { FC, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FONTS from "../../assets/fonts";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import CustomSwitch from "../../components/CustomSwitch";
import { CustomText } from "../../components/CustomText";
import PrimaryButton from "../../components/PrimaryButton";
import { ManageDonationScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import {
  horizontalScale,
  responsiveFontSize,
  verticalScale,
  wp,
} from "../../utils/Metrics";
import { NavigationBar } from "@stripe/stripe-react-native";

const plans = [
  { id: "plan_1", amount: 1, interval: "mo" },
  { id: "plan_2", amount: 3, interval: "mo" },
  { id: "plan_3", amount: 5, interval: "mo" },
];

const ManageDonation: FC<ManageDonationScreenProps> = ({ navigation }) => {
  const [enabled, setEnabled] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(plans[0].id);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate("account");
        }}
      >
        <CustomIcon Icon={ICONS.backArrow} height={24} width={24} />
      </TouchableOpacity>
      {/* Logo */}
      <View style={styles.logoWrapper}>
        <Image source={IMAGES.LogoText} style={styles.logo} />
      </View>

      {/* Heading */}
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

      <CustomText
        fontFamily="SourceSansRegular"
        fontSize={14}
        style={{
          color: COLORS.appText,
          textAlign: "center",
          marginTop: verticalScale(24),
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

      {/* Save Button */}
      <PrimaryButton
        title="Save Changes"
        onPress={() => {}}
        disabled
        style={styles.saveButton}
      />
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
    width: horizontalScale(96),
    height: verticalScale(56),
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
    marginTop: verticalScale(24),
    opacity: 0.6,
  },
});
