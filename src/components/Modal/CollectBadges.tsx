import { BlurView } from "@react-native-community/blur";
import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ImageBackground,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import { closeCollectBadgesModal } from "../../redux/slices/CollectBadgesSlice";
import {
  getUnViewedBadges,
  markAllBadgesViewed,
} from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { postData } from "../../service/ApiService";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";
import BadgeIcon from "../BadgeIcon";
import CustomIcon from "../CustomIcon";
import { CustomText } from "../CustomText";
import PrimaryButton from "../PrimaryButton";

const CollectBadges = () => {
  const navigation = useNavigation<any>();
  const scrollX = useRef(new Animated.Value(0))?.current;
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const unViewedBadges = useAppSelector(getUnViewedBadges);

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

      dispatch(closeCollectBadgesModal());
      dispatch(markAllBadgesViewed());
      navigation.navigate("accountStack", { screen: "badges" });

      const response = await postData(ENDPOINTS.ViewedBadges, {
        badgeIds: unViewedBadges.map((badge) => badge.id),
      });

      if (response.data.success) {
        console.log("Badge collected successfully:", response);
      }
    } catch (e) {
      console.error("Error collecting badge:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <ImageBackground
      source={getBgImage(item?.badge?.category)}
      style={styles.cardContainer}
    >
      <View style={styles.header}>
        <CustomText
          fontFamily="GabaritoMedium"
          fontSize={18}
          color={COLORS.white}
        >
          {item?.badge?.category.charAt(0).toUpperCase() +
            item?.badge?.category.slice(1).toLowerCase()}{" "}
          badge unlocked
        </CustomText>
      </View>

      <CustomText
        fontFamily="GabaritoBold"
        fontSize={36}
        color={COLORS.white}
        style={{ textAlign: "center", marginTop: verticalScale(24) }}
      >
        {item?.badge?.title}
      </CustomText>

      <View
        style={{ alignItems: "center", flex: 1, marginTop: verticalScale(16) }}
      >
        <BadgeIcon badge={item?.badge?.name} style={styles.badgeImage} />
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
                return `${item?.badge?.requirement?.consecutiveMonths} Month${
                  item?.badge?.requirement?.consecutiveMonths! > 1 ? "s" : ""
                } `;
              }

              if (category === "COMMUNITY") {
                return `${item?.badge?.requirement?.userNumberMax} Donors`;
              }

              if (category === "ART") {
                return `${item?.badge?.requirement?.totalShares} Share${
                  item?.badge?.requirement?.totalShares! > 1 ? "s" : ""
                }`;
              }

              if (category === "IMPACT") {
                return `${item?.badge?.requirement?.totalDonations} Donated`;
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
          {item?.badge?.description}
        </CustomText>
      </View>
    </ImageBackground>
  );

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={2}
        />

        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={async () => {
            dispatch(closeCollectBadgesModal());
            await postData(ENDPOINTS.ViewedBadges, {
              badgeIds: unViewedBadges.map((badge) => badge.id),
            });
          }}
        />

        <View style={styles.modalContent}>
          <Animated.FlatList
            ref={flatListRef}
            data={unViewedBadges}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            bounces={false}
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
              onPress={async () => {
                dispatch(closeCollectBadgesModal());
                const response = await postData(ENDPOINTS.ViewedBadges, {
                  badgeIds: unViewedBadges.map((badge) => badge.id),
                });
              }}
              style={styles.closeBtn}
            >
              <CustomIcon Icon={ICONS.WhiteClose} height={30} width={30} />
            </TouchableOpacity>
          </View>

          {unViewedBadges.length > 1 && (
            <View style={styles.dotsContainer}>
              {unViewedBadges.map((_: any, index: number) => {
                const inputRange = [
                  (index - 1) * wp(100),
                  index * wp(100),
                  (index + 1) * wp(100),
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
          )}

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
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  cardContainer: {
    width: wp(100), // Essential for carousel
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
    position: "absolute",
    bottom: verticalScale(100),
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
