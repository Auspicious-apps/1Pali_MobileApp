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
import {
  getUnViewedBadges,
  markAllBadgesViewed,
  selectArtBadges,
  selectCommunityBadges,
  selectGrowthBadges,
  selectImpactBadges,
} from "../../redux/slices/UserSlice";
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
  const scrollX = useRef(new Animated.Value(0))?.current;
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const unViewedBadges = useAppSelector(getUnViewedBadges);
  const growthBadges = useAppSelector(selectGrowthBadges);
  const communityBadges = useAppSelector(selectCommunityBadges);
  const artBadges = useAppSelector(selectArtBadges);
  const impactBadges = useAppSelector(selectImpactBadges);

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
      const response = await postData(ENDPOINTS.ViewedBadges, {
        badgeIds: unViewedBadges.map((badge) => badge.id),
      });

      if (response.data.success) {
        dispatch(closeCollectBadgesModal());
        dispatch(markAllBadgesViewed());
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
        <View style={styles.wrapper}>
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={14}
            color={COLORS.white}
            style={styles.text}
          >
            {(() => {
              const category = item.badge.category;

              if (category === "GROWTH") {
                return `${growthBadges?.map(
                  (item) => item?.badge?.requirement?.consecutiveMonths,
                )} Months `;
              }

              if (category === "COMMUNITY") {
                return `${communityBadges?.map(
                  (item) => item?.badge?.requirement?.userNumberMax,
                )} Donors`;
              }

              if (category === "ART") {
                return `${artBadges?.map(
                  (item) => item?.badge?.requirement?.totalDonations,
                )}Share `;
              }

              if (category === "IMPACT") {
                return `$${impactBadges?.map(
                  (item) => item?.badge?.requirement?.totalDonations,
                )} Donated`;
              }

              return "";
            })()}
          </CustomText>
        </View>
        <View style={styles.devider} />
        <CustomText
          fontFamily="GabaritoMedium"
          fontSize={18}
          color={COLORS.white}
          style={{
            textAlign: "center",
            width: "70%",
          }}
        >
          {item.badge.description}
        </CustomText>
        <View style={styles.dotsContainer}>
          {unViewedBadges.map((_: any, index: number) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() =>
                  flatListRef.current?.scrollToIndex({
                    index,
                    animated: true,
                  })
                }
              >
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      opacity,
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
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
            ref={flatListRef}
            data={unViewedBadges}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false },
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
              bottom: verticalScale(30),
              alignSelf: "center",
              backgroundColor: COLORS.white,
              zIndex: 10000,
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
    height: hp(70),
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
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: horizontalScale(8),
    alignSelf: "center",
    marginTop: verticalScale(24),
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  wrapper: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(6),
    borderRadius: 30,
    alignSelf: "center",
    marginTop: verticalScale(16),
    backgroundColor: "#FFFFFF10",
    borderWidth: 2,
    borderColor: "#FFFFFF50",
  },
  text: {
    textAlign: "center",
  },
  devider: {
    width: verticalScale(100),
    borderBottomWidth: 1,
    borderColor: "#FFFFFF50",
    marginVertical: verticalScale(20),
    alignSelf: "center",
  },
});

export default CollectBadges;
