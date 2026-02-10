import { BlurView } from "@react-native-community/blur";
import React, { Dispatch, SetStateAction } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ICONS from "../../assets/Icons";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale } from "../../utils/Metrics";
import BadgeIcon from "../BadgeIcon";
import CustomIcon from "../CustomIcon";
import { CustomText } from "../CustomText";

interface BadgesDetailModalProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  badgeLabel?: string;
  badgeMonths?: string;
  badgeDescription: string | undefined;
}

const BadgesDetail: React.FC<BadgesDetailModalProps> = ({
  isVisible,
  setIsVisible,
  badgeLabel,
  badgeMonths,
  badgeDescription,
}) => {
  const closeModal = () => setIsVisible(false);
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={closeModal}
    >
      {/* 🔹 Blur Background */}
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1 }}
        onPress={closeModal}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={0.1}
            reducedTransparencyFallbackColor="white"
            pointerEvents="none"
          />
        ) : (
          <View style={styles.androidBackdrop} />
        )}
        {/* 🔹 Modal Content (UNCHANGED) */}
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={18}
                color={COLORS.darkText}
              >
                Badge Details
              </CustomText>

              <TouchableOpacity
                onPress={closeModal}
                style={{
                  position: "absolute",
                  right: horizontalScale(8),
                  top: verticalScale(8),
                }}
              >
                <CustomIcon Icon={ICONS.CloseIcon} height={30} width={30} />
              </TouchableOpacity>
            </View>

            {/* Badge Info */}
            <View style={styles.badgeSection}>
              <BadgeIcon
                badge={badgeLabel ?? "speaker"}
                style={styles.badgeImage}
              />

              <View style={{ alignItems: "center" }}>
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={18}
                  color={COLORS.darkText}
                >
                  {badgeLabel}
                </CustomText>

                <CustomText
                  fontFamily="SourceSansRegular"
                  fontSize={15}
                  color={"#1D222B80"}
                  style={{ textAlign: "center" }}
                >
                  {badgeMonths}
                </CustomText>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description */}
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={18}
              color={COLORS.darkText}
              style={styles.description}
            >
              {badgeDescription?.replace(/\. /g, ".\n")}
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default BadgesDetail;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 6,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    width: "100%",
    borderRadius: 30,
    paddingTop: verticalScale(10),
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(50),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  badgeSection: {
    alignItems: "center",
    marginTop: verticalScale(24),
    gap: verticalScale(12),
  },
  badgeImage: {
    width: horizontalScale(66),
    height: verticalScale(66),
    resizeMode: "cover",
  },
  divider: {
    marginVertical: verticalScale(16),
    width: horizontalScale(100),
    alignSelf: "center",
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  description: {
    textAlign: "center",
    alignSelf: "center",
  },
});
