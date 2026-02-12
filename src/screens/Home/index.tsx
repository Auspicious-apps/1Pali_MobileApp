import { useIsFocused } from "@react-navigation/native";
import React, { FC, useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IMAGES from "../../assets/Images";
import BadgeIcon from "../../components/BadgeIcon";
import { CustomText } from "../../components/CustomText";
import CollectBadges from "../../components/Modal/CollectBadges";
import MyBadgesModal from "../../components/Modal/MyBadgesModal";
import ProgressBar from "../../components/ProgressBar";
import { openCollectBadgesModal } from "../../redux/slices/CollectBadgesSlice";
import {
  getUnViewedBadges,
  selectGrowthBadges,
  selectLatestGrowthBadges,
} from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { HomeScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { formatNumber, getSupportingDuration } from "../../utils/Helpers";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";

const Home: FC<HomeScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  const { badges, user } = useAppSelector((state) => state.user);
  const growthBadges = useAppSelector(selectGrowthBadges);
  const latestGrowthBadge = useAppSelector(selectLatestGrowthBadges);
  const unViewedBadges = useAppSelector(getUnViewedBadges);
  const [isBadgesSHeet, setIsBadgesSheet] = useState(false);


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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Image source={IMAGES.LogoText} style={styles.logo} />
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
              fontSize={16}
              color={COLORS.appText}
              style={{ textAlign: "center" }}
            >
              {getSupportingDuration(user?.subscribedAt)}{" "}
            </CustomText>
          )}
        </View>
        <View style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsBadgesSheet(true)}
          >
            <BadgeIcon
              badge={growthBadges[0]?.badge?.name}
              style={{
                width: horizontalScale(125),
                height: verticalScale(125),
                resizeMode: "contain",
                alignSelf: "center",
              }}
            />
          </TouchableOpacity>
          {latestGrowthBadge && (
            <View>
              <CustomText
                fontFamily="GabaritoMedium"
                fontSize={18}
                color={COLORS.darkText}
                style={{ textAlign: "center" }}
              >
                {latestGrowthBadge?.badge?.name}
              </CustomText>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={14}
                color={COLORS.appText}
                style={{ textAlign: "center" }}
              >
                {latestGrowthBadge?.badge?.name === "Seed"
                  ? "First month of Support"
                  : `${latestGrowthBadge?.badge?.requirement.consecutiveMonths} months of Support`}
              </CustomText>
            </View>
          )}
          {/* Progress Bar */}
          <View
            style={{
              marginTop: verticalScale(16),
              marginBottom: verticalScale(12),
            }}
          >
            <ProgressBar />
          </View>
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={14}
            color={COLORS.darkText}
            style={{ textAlign: "center" }}
          >
            {user?.globalStats?.totalDonors}
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={14}
              color={COLORS.greyText}
              style={{ textAlign: "center" }}
            >
              {" "}
              / 1,000,000 supporters
            </CustomText>
          </CustomText>
        </View>
        <ImageBackground
          source={IMAGES.HomeTextBackgorund}
          resizeMode="contain"
          style={styles.TextBackground}
        >
          <CustomText
            fontFamily="GabaritoMedium"
            fontSize={16}
            color={COLORS.DarkGreenText}
          >
            ${formatNumber(user?.globalStats?.totalDonationsGenerated!)} donated
            together
          </CustomText>
        </ImageBackground>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={16}
            color={COLORS.greyText}
            style={styles.collabText}
          >
            In collaboration with
          </CustomText>
          <View style={styles.dividerLine} />
        </View>
        <View style={styles.partnersRow}>
          <Image source={IMAGES.MecaImage} style={styles.mecaImage} />
          <Image source={IMAGES.Paliroot} style={styles.palirootImage} />
        </View>
        <MyBadgesModal
          isVisible={isBadgesSHeet}
          setIsVisible={setIsBadgesSheet}
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
    paddingHorizontal: horizontalScale(20),
    // paddingTop: verticalScale(20),
  },
  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
    marginTop: Platform.OS === "ios" ? verticalScale(0) : verticalScale(10),
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: horizontalScale(10),
    marginTop: verticalScale(12),
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
    marginTop: hp(4.8),
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
  partnersRow: {
    flexDirection: "row",
    gap: wp(7.7),
    marginTop: verticalScale(16),
  },
  mecaImage: {
    width: wp(36),
    height: hp(6),
    alignSelf: "center",
    resizeMode: "contain",
  },
  palirootImage: {
    width: wp(35.7),
    height: hp(3.3),
    alignSelf: "center",
    resizeMode: "contain",
  },
  TextBackground: {
    height: verticalScale(51),
    width: wp(90),
    marginTop: verticalScale(32),
    alignItems: "center",
    justifyContent: "center",
  },
});
