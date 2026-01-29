import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { getUnViewedBadges } from "../../redux/slices/UserSlice";
import IMAGES from "../../assets/Images";
import { CustomText } from "../CustomText";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";
import PrimaryButton from "../PrimaryButton";
import { BlurView } from "@react-native-community/blur";
import CustomIcon from "../CustomIcon";
import ICONS from "../../assets/Icons";
import { closeCollectBadgesModal } from "../../redux/slices/CollectBadgesSlice";
import { postData } from "../../service/ApiService";
import ENDPOINTS from "../../service/ApiEndpoints";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CollectBadges: React.FC = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const unViewedBadges = useAppSelector(getUnViewedBadges);

  console.log(unViewedBadges);

  const { isVisible } = useAppSelector((state) => state.collectBadges);

  // Helper to get image based on category string
  const getBgImage = (category: string) => {
    switch (category) {
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

  const onViewBadge = async () => {
    try {
      setIsLoading(true);
      const response = await postData(ENDPOINTS.CollectBadges, {
        badgeId: [],
      });

      if (response.data.success) {
        dispatch(closeCollectBadgesModal());
      }
      console.log("Badge collected successfully:", response);
    } catch (e) {
      console.error("Error collecting badge:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <ImageBackground
      source={getBgImage(item.badge.category)}
      style={styles.cardContainer}
    >
      <View style={styles.header}>
        <CustomText
          fontFamily="GabaritoMedium"
          fontSize={18}
          color={COLORS.white}
        >
          {item.badge.category.charAt(0).toUpperCase() +
            item.badge.category.slice(1).toLowerCase()}{" "}
          badge unlocked
        </CustomText>
      </View>

      <CustomText
        fontFamily="GabaritoBold"
        fontSize={36}
        color={COLORS.white}
        style={{ textAlign: "center", marginTop: verticalScale(24) }}
      >
        {item.badge.title}
      </CustomText>

      <View
        style={{ alignItems: "center", flex: 1, marginTop: verticalScale(16) }}
      >
        <Image
          source={{ uri: item.badge.iconPngUrl }}
          style={styles.badgeImage}
        />
        <CustomText
          fontFamily="GabaritoMedium"
          fontSize={18}
          color={COLORS.white}
          style={{ marginTop: verticalScale(8), textAlign: "center" }}
        >
          {item.badge.description}
        </CustomText>
      </View>
    </ImageBackground>
  );

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={2}
        />

        <View style={styles.modalContent}>
          <Animated.FlatList
            data={unViewedBadges}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }, // This is what caused the error with a normal FlatList
            )}
            scrollEventThrottle={16}
          />

          <View
            style={{
              position: "absolute",
              right: horizontalScale(20),
              top: verticalScale(15),
            }}
          >
            <TouchableOpacity
              onPress={() => dispatch(closeCollectBadgesModal())}
              style={styles.closeBtn}
            >
              <CustomIcon Icon={ICONS.WhiteClose} height={30} width={30} />
            </TouchableOpacity>
          </View>

          <PrimaryButton
            title="View Badge"
            onPress={onViewBadge}
            disabled={isLoading}
            textStyle={{ color: COLORS.darkText }}
            style={{
              opacity: isLoading ? 0.6 : 1,
              position: "absolute",
              bottom: verticalScale(20),
              alignSelf: "center",
              backgroundColor: COLORS.white,
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "transparent",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  cardContainer: {
    width: SCREEN_WIDTH, // Essential for carousel
    height: hp(57.5),
    paddingTop: verticalScale(20),
  },
  closeBtn: {},
  badgeImage: {
    width: horizontalScale(162),
    height: verticalScale(162),
    borderRadius: 60,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
});

export default CollectBadges;
