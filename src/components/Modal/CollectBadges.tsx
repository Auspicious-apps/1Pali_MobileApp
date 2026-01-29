import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Alert,
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
import { closeCollectBadgesModal, removeClaimedBadges } from "../../redux/slices/CollectBadgesSlice";
import ENDPOINTS from "../../service/ApiEndpoints";
import { postData } from "../../service/ApiService";

const CollectBadges: React.FC = () => {
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { isVisible, collectibleBadges } = useAppSelector(
    (state) => state.collectBadges,
  );

  const badge = collectibleBadges?.[currentIndex];
  console.log(badge,'KLKLKLK');
  

  if (!badge) return null;

  /* ---------------- UI Helpers ---------------- */
  const getBg = () => {
    switch (badge.badge.category) {
      case "GROWTH":
        return IMAGES.BadgeGreenBg;
      case "ART":
        return IMAGES.BadgeBrownBg;
      case "IMPACT":
        return IMAGES.BadgePinkBg;
      default:
        return IMAGES.BadgeBlackBg;
    }
  };

  /* ---------------- Actions ---------------- */
  const onViewBadge = async () => {

    if (!badge?.id) return;

    try {
      setIsLoading(true);
      const response = await postData(ENDPOINTS.CollectBadges, {
        badgeId: badge.id,
      });

      if (response.data.success) {
        dispatch(removeClaimedBadges(badge.id));
       
        if ((collectibleBadges?.length ?? 0) > 1) {
        setCurrentIndex(0); 
        }
         else {
          setCurrentIndex(0);
        }
        dispatch(closeCollectBadgesModal());
      }
      console.log("Badge collected successfully:", response);
    } catch (e) {
      console.error("Error collecting badge:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = async () => {
    if (badge?.badge?._id) {
      // const success = await handleCollectBadges(badge.badge._id);

      // if (success) {
      //   if (currentIndex < (collectibleBadges?.length ?? 0) - 1) {
      //     setCurrentIndex(prev => prev + 1);
      //   } else {
      //     setCurrentIndex(0);
      //   }
      // }
    }

    dispatch(closeCollectBadgesModal());
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={2}
        />

        <ImageBackground
          source={getBg()}
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
              {badge.badge.category}
            </CustomText>

            <TouchableOpacity
              onPress={closeModal}
              style={{
                position: "absolute",
                right: horizontalScale(0),
                top: verticalScale(-5),
              }}
            >
              <CustomIcon Icon={ICONS.WhiteClose} height={30} width={30} />
            </TouchableOpacity>
          </View>
          {/* Text */}
          <CustomText
            fontFamily="GabaritoBold"
            fontSize={36}
            color={COLORS.white}
            style={{ textAlign: "center", marginTop: verticalScale(24) }}
          >
            {badge.badge.title}
          </CustomText>
          <View
            style={{
              alignItems: "center",
              flex: 1,
              marginTop: verticalScale(16),
            }}
          >
            {/* Badge Image */}
            <Image
              source={{ uri: badge.badge.iconPngUrl }}
              style={styles.badgeImage}
            />

            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={18}
              color={COLORS.white}
              style={{ marginTop: verticalScale(8), textAlign: "center" }}
            >
              {badge.badge.description}
            </CustomText>
          </View>

          {/* Button */}
          <PrimaryButton
            title="Collect Badge"
            onPress={onViewBadge}
            disabled={isLoading}
            textStyle={{
              fontFamily: FONTS.MontserratSemiBold,
              fontSize: responsiveFontSize(16),
              color: COLORS.darkText,
            }}
            style={{
              ...styles.button,
              opacity: isLoading ? 0.6 : 1,
            }}
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
