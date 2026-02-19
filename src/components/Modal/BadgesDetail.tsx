import { BlurView } from "@react-native-community/blur";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Grayscale } from "react-native-color-matrix-image-filters";
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
  isLocked: boolean;
}
const BORDER = 6;

const BadgesDetail: React.FC<BadgesDetailModalProps> = ({
  isVisible,
  setIsVisible,
  badgeLabel,
  badgeMonths,
  badgeDescription,
  isLocked,
}) => {
  const translateY = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 500,
        duration: 150,
        easing: Easing.bezier(0.4, 0, 1, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  useEffect(() => {
    if (isVisible) {
      translateY.setValue(500);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 380,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
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
            style={[StyleSheet.absoluteFill]}
            blurType="dark"
            blurAmount={2}
            pointerEvents="none"
          />
        ) : (
          <View style={styles.androidBackdrop} />
        )}
        {/* 🔹 Modal Content (UNCHANGED) */}
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY }],
              },
            ]}
            onStartShouldSetResponder={() => true}
            onResponderRelease={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.header}>
              <CustomText
                fontFamily="GabaritoMedium"
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
              {isLocked ? (
                <View
                  style={[
                    styles.outerCircle,
                    {
                      width: horizontalScale(151),
                      height: verticalScale(151),
                      borderRadius: horizontalScale(151) / 2,
                    },
                  ]}
                >
                  <Grayscale>
                    <BadgeIcon
                      badge={badgeLabel ?? "speaker"}
                      style={styles.badgeImage}
                    />
                  </Grayscale>

                  <View
                    style={[
                      styles.badgeOverlay,
                      {
                        top: BORDER,
                        bottom: BORDER,
                        left: BORDER,
                        right: BORDER,
                        borderRadius: horizontalScale(151) / 2,
                      },
                    ]}
                  />
                </View>
              ) : (
                <BadgeIcon
                  badge={badgeLabel ?? "speaker"}
                  style={styles.badgeImage}
                />
              )}

              <View style={{ alignItems: "center" }}>
                <CustomText
                  fontFamily="GabaritoSemiBold"
                  fontSize={22}
                  color={COLORS.darkText}
                >
                  {badgeLabel}
                </CustomText>

                <CustomText
                  fontFamily="SourceSansMedium"
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
              {badgeDescription}
            </CustomText>
          </Animated.View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    width: horizontalScale(151),
    height: verticalScale(151),
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
    paddingHorizontal: horizontalScale(20),
  },

  outerCircle: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  innerCircle: {
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  badgeOverlay: {
    position: "absolute",
    backgroundColor: "rgba(25,30,40,0.55)",
  },
});
