import React, { Dispatch, SetStateAction } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { CustomText } from '../CustomText';
import COLORS from '../../utils/Colors';
import CustomIcon from '../CustomIcon';
import ICONS from '../../assets/Icons';
import IMAGES from '../../assets/Images';
import { horizontalScale, verticalScale } from '../../utils/Metrics';

interface BadgesDetailModalProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  badgeLabel?: string;
  badgeMonths?: string;
  badgeImage?: ImageSourcePropType;
  badgeDescription: string | undefined;
}

const BadgesDetail: React.FC<BadgesDetailModalProps> = ({
  isVisible,
  setIsVisible,
  badgeLabel,
  badgeMonths,
  badgeImage,
  badgeDescription,
}) => {
  const closeModal = () => setIsVisible(false);

  const displayLabel = badgeLabel ?? "Seed";
  const displaySubtitle = badgeMonths
    ? `Awarded for supporting for ${badgeMonths}`
    : "Awarded for supporting for 1 month";

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      {/* 🔹 Blur Background */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeModal}
        style={{ flex: 1 }}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={0.1}
          reducedTransparencyFallbackColor="white"
        />

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
              <Image
                source={badgeImage ?? IMAGES.SpeakerBadge}
                resizeMode="contain"
                style={styles.badgeImage}
              />

              <View style={{ alignItems: "center" }}>
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={18}
                  color={COLORS.darkText}
                >
                  {displayLabel}
                </CustomText>

                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={14}
                  color={"#1D222B80"}
                  style={{ textAlign: "center" }}
                >
                  {displaySubtitle}
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
