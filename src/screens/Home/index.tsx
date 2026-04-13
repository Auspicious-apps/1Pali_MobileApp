import { useIsFocused } from "@react-navigation/native";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import InAppReview from "react-native-in-app-review";
import { SafeAreaView } from "react-native-safe-area-context";
import IMAGES from "../../assets/Images";
import BadgeIcon from "../../components/BadgeIcon";
import { CustomText } from "../../components/CustomText";
import CollectBadges from "../../components/Modal/CollectBadges";
import MyBadgesModal from "../../components/Modal/MyBadgesModal";
import ProgressBar from "../../components/ProgressBar";
import { initializeFirebaseMessaging } from "../../Firebase/NotificationService";
import { openCollectBadgesModal } from "../../redux/slices/CollectBadgesSlice";
import {
  getUnViewedBadges,
  selectLatestGrowthBadges
} from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { HomeScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { formatNumber, getSupportingDuration } from "../../utils/Helpers";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";
import GrowthStageCard from "../../components/GrowthStageCard";
import CustomIcon from "../../components/CustomIcon";
import ICONS from "../../assets/Icons";

const badgeMetadata = [
  {
    name: "Seed",
    description: "You’ve planted a promise",
  },
  {
    name: "Sprout",
    description: "Your support is breaking through",
  },
  {
    name: "Sapling",
    description: "A steady presence is forming",
  },
  {
    name: "Rooted",
    description: "You are part of this land now",
  },
  {
    name: "Branch",
    description: "Your impact is reaching further",
  },
  {
    name: "Trunk",
    description: "You are part of the foundation",
  },
  { name: "Bloom", description: "Your commitment has brought life" },
  {
    name: "Eternal",
    description: "Your presence is now part of our history",
  },
];

const Home: FC<HomeScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  const { badges, user } = useAppSelector((state) => state.user);
  const latestGrowthBadge = useAppSelector(selectLatestGrowthBadges);
  const unViewedBadges = useAppSelector(getUnViewedBadges);
  const [isBadgesSHeet, setIsBadgesSheet] = useState(false);
  const pulseScale = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const [active, setActive] = useState<"MILESTONE" | "GOAL">("MILESTONE");
  const translateX = useRef(new Animated.Value(0)).current;

  const handleModeChange = (mode: "MILESTONE" | "GOAL") => {
    setActive(mode);

    Animated.timing(translateX, {
      toValue: mode === "MILESTONE" ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  // const openRateUs = () => {
  //   if (InAppReview.isAvailable()) {
  //     InAppReview.RequestInAppReview();
  //   } else {
  //     // fallback if native review not available
  //     const storeUrl = Platform.select({
  //       android: "https://play.google.com/store/apps/details?id=com.onepali",
  //       ios: "https://apps.apple.com/in/app/onepali-%241-for-palestine/id6758080916",
  //     });

  //     Linking.openURL(storeUrl!);
  //   }
  // };

  useEffect(() => {
    const loop = () => {
      pulseScale.setValue(0);
      pulseOpacity.setValue(0.7);

      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 2200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => loop());
    };

    loop();
  }, []);

  const navigateToBadge = () => {
    navigation.navigate("MainStack", {
      screen: "badges",
    });
  };

  useEffect(() => {
    if (badges && badges.badges.length > 0) {
      const timer = setTimeout(() => {
        if (unViewedBadges.length > 0) {
          dispatch(openCollectBadgesModal());
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [unViewedBadges, dispatch]);

  useEffect(() => {
    initializeFirebaseMessaging();
  }, []);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     openRateUs();
  //   }, 15000);

  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Image source={IMAGES.OnePaliLogo} style={styles.logo} />
        <View style={{ marginTop: verticalScale(32) }}>
          <CustomText
            fontFamily="GabaritoSemiBold"
            fontSize={42}
            color={COLORS.darkText}
            style={{ textAlign: "center" }}
          >
            #{user?.assignedNumber}
          </CustomText>
          {user?.subscribedAt && (
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={18}
              color={COLORS.appText}
              style={{ textAlign: "center" }}
            >
              {getSupportingDuration(user?.subscribedAt)}{" "}
            </CustomText>
          )}
        </View>
        <View style={{ alignItems: "center" }}>
          <GrowthStageCard stage="seed" />
        </View>
        <View style={styles.outerCard}>
          <View style={styles.card}>
            <View style={styles.InnerContainer}>
              {/* Next Milestone */}
              <TouchableOpacity
                onPress={() => handleModeChange("MILESTONE")}
                style={[styles.tab, active === "MILESTONE" && styles.activeTab]}
              >
                <CustomText
                  fontFamily="GabaritoSemiBold"
                  fontSize={15}
                  color={
                    active === "MILESTONE" ? COLORS.darkText : COLORS.appText
                  }
                >
                  Next Milestone
                </CustomText>
              </TouchableOpacity>

              {/* 1M Goal */}
              <TouchableOpacity
                onPress={() => handleModeChange("GOAL")}
                style={[styles.tab, active === "GOAL" && styles.activeTab]}
              >
                <CustomText
                  fontFamily="GabaritoSemiBold"
                  fontSize={15}
                  color={active === "GOAL" ? COLORS.darkText : COLORS.appText}
                >
                  1M Goal
                </CustomText>
              </TouchableOpacity>
            </View>
            {/* Progress Bar */}
            <ProgressBar activeMode={active} onToggle={handleModeChange} />
          </View>
          <View
            style={{
              marginTop: verticalScale(16),
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: horizontalScale(24),
              alignItems: "center",
            }}
          >
            <View style={{ gap: verticalScale(2) }}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={22}
                color={COLORS.darkGreen}
              >
                ${user?.globalStats?.totalDonationsGenerated}
              </CustomText>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={15}
                color={COLORS.lightGreyText}
              >
                Total raised for Palestine
              </CustomText>
            </View>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("tabs", { screen: "updates" });
              }}
              style={{ padding: verticalScale(4) }}
              activeOpacity={0.8}
            >
              <CustomIcon
                Icon={ICONS.RightCircleArrow}
                height={24}
                width={24}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Image source={IMAGES.GetStartedBottomImage} style={styles.mecaImage} />
        <MyBadgesModal
          isVisible={isBadgesSHeet}
          setIsVisible={setIsBadgesSheet}
          navigateToBadge={navigateToBadge}
        />
        {isFocused && <CollectBadges />}
      </SafeAreaView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(15),
  },
  logo: {
    width: horizontalScale(54),
    height: verticalScale(54),
    resizeMode: "contain",
    marginTop: Platform.OS === "ios" ? verticalScale(0) : verticalScale(10),
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 24,
    paddingHorizontal: horizontalScale(10),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(20),
    width: wp(90),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3.2),
    marginTop: verticalScale(32),
  },
  dividerLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
    width: wp(20),
  },
  collabText: {
    textAlign: "center",
    lineHeight: hp(2.7),
  },

  mecaImage: {
    width: wp(80),
    height: verticalScale(40),
    alignSelf: "center",
    resizeMode: "contain",
    marginTop: verticalScale(40),
  },
  TextBackground: {
    width: wp(90),
    marginTop: verticalScale(12),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: "#F0FFF0",
    gap: horizontalScale(20),
    borderRadius: 24,
  },
  dotcontainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  dotContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },

  scatterGlow: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(34,197,94,0.25)",

    // iOS soft shadow scatter
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,

    // Android glow
    elevation: 12,
  },
  InnerContainer: {
    height: verticalScale(48),
    borderRadius: 40,
    flexDirection: "row",
    padding: verticalScale(4),
    overflow: "hidden",
    backgroundColor: COLORS.commentBar,
  },

  tab: {
    flex: 1,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  activeTab: {
    backgroundColor: COLORS.white,
  },
  outerCard: {
    paddingBottom: verticalScale(16),
    backgroundColor: COLORS.commentBar,
    borderRadius: 24,
    marginTop: verticalScale(8),
  },
});
