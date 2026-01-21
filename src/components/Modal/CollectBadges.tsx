import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import COLORS from "../../utils/Colors";
import CustomIcon from "../CustomIcon";
import { CustomText } from "../CustomText";
import { horizontalScale, hp, responsiveFontSize, verticalScale } from "../../utils/Metrics";
import { BlurView } from "@react-native-community/blur";
import PrimaryButton from "../PrimaryButton";
import FONTS from "../../assets/fonts";
import { useDispatch } from "react-redux";
import { RootState, useAppSelector } from "../../redux/store";
import { closeCollectBadgesModal } from "../../redux/slices/CollectBadgesSlice";

const badges = [
  {
    id: 1,
    title: "Sprout",
    description: "Awarded for supporting for 3 months!",
    image: IMAGES.Sprout,
    background: IMAGES.BadgeGreenBg,
    type: "Growth Badge Unlocked",
  },
  {
    id: 2,
    title: "Voice",
    description: "Awarded for sharing one piece of art!",
    image: IMAGES.Voice,
    background: IMAGES.BadgeBrownBg,
    type: "Art Badge Unlocked",
  },
  {
    id: 3,
    title: "Impact",
    description: "Awarded for donating $2 so far!",
    image: IMAGES.Orange,
    background: IMAGES.BadgePinkBg,
    type: "Impact Badge Unlocked",
  },
  {
    id: 4,
    title: "1 Million",
    description: "Awarded for being among 1M donors",
    image: IMAGES.OneMillion,
    background: IMAGES.BadgeBlackBg,
    type: "1M Badge Unlocked ",
  },
];

const CollectBadges: React.FC = () => {
  const dispatch = useDispatch();
  const isVisible = useAppSelector(
    (state: RootState) => state.collectBadges.isVisible,
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const badge = badges[currentIndex];
  
  const closeModal = () => {
    dispatch(closeCollectBadgesModal());
    setCurrentIndex(0);
  };
  const onViewBadge = () => {
    if (currentIndex < badges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      closeModal();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <View
        style={styles.overlay}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={2}
        />

        <ImageBackground
          source={badge.background}
          resizeMode="cover"
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={18}
              color={COLORS.white}
            >
              {badge.type}
            </CustomText>

            <TouchableOpacity
              onPress={closeModal}
              style={{
                position: "absolute",
                right: horizontalScale(0),
                top: verticalScale(6),
              }}
            >
              <CustomIcon Icon={ICONS.WhiteClose} height={30} width={30} />
            </TouchableOpacity>
          </View>
          <View
            style={{ alignItems: "center", flex: 1, justifyContent: "center" }}
          >
            {/* Badge Image */}
            <Image source={badge.image} style={styles.badgeImage} />

            {/* Text */}
            <CustomText
              fontFamily="GabaritoBold"
              fontSize={36}
              color={COLORS.white}
              style={{ marginTop: verticalScale(12) }}
            >
              {badge.title}
            </CustomText>

            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={18}
              color={COLORS.white}
              style={{ marginTop: verticalScale(8) }}
            >
              {badge.description}
            </CustomText>
          </View>

          {/* Button */}
          <PrimaryButton
            title="View Badge"
            onPress={onViewBadge}
            textStyle={{
              fontFamily: FONTS.MontserratSemiBold,
              fontSize: responsiveFontSize(16),
              color: COLORS.darkText,
            }}
            style={styles.button}
          />
        </ImageBackground>
      </View>
    </Modal>
  );
};

export default CollectBadges;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    height: hp(57.5),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(30),
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  badgeImage: {
    width: horizontalScale(162),
    height: verticalScale(162),
    borderRadius: 60,
  },
  button: {
    backgroundColor: COLORS.white,

  },
});
