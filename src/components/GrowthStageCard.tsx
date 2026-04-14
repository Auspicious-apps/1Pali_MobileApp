import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { CustomText } from "./CustomText";
import COLORS from "../utils/Colors";
import BadgeIcon from "./BadgeIcon";
import { horizontalScale, verticalScale, wp } from "../utils/Metrics";
import { useAppSelector } from "../redux/store";
import { selectLatestGrowthBadges } from "../redux/slices/UserSlice";
import MyBadgesModal from "./Modal/MyBadgesModal";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParams } from "../typings/routes";

const GROWTH_STAGES_MAP = {
  seed: {
    title: "Seed",
    subtitle: "You’ve planted a promise",
    gradient: ["#8E6238", "#D2AE8E"],
  },
  sprout: {
    title: "Sprout",
    subtitle: "Your support is breaking through",
    gradient: ["#A67D12", "#E9B735"],
  },
  sapling: {
    title: "Sapling",
    subtitle: "A steady presence is forming",
    gradient: ["#016039", "#03C475"],
  },
  rooted: {
    title: "Rooted",
    subtitle: "You are grounded here",
    gradient: ["#0D3F3F", "#1F9494"],
  },
  branch: {
    title: "Branch",
    subtitle: "Your impact is reaching further",
    gradient: ["#29508A", "#4E81CA"],
  },
  trunk: {
    title: "Trunk",
    subtitle: "You are part of the foundation",
    gradient: ["#603A73", "#9663B0"],
  },
  bloom: {
    title: "Bloom",
    subtitle: "Your commitment has brought life",
    gradient: ["#A72F5B", "#E090AD"],
  },
  eternal: {
    title: "Eternal",
    subtitle: "Your presence is part of our history",
    gradient: ["#10412D", "#259365"],
  },
};

type Props = {
  stage: keyof typeof GROWTH_STAGES_MAP;
};

type NavigationProp = NativeStackNavigationProp<RootStackParams>;

const GrowthStageCard: React.FC<Props> = ({ stage }) => {
  const navigation = useNavigation<NavigationProp>();
  const latestGrowthBadge = useAppSelector(selectLatestGrowthBadges);
  const [isBadgesSHeet, setIsBadgesSheet] = useState(false);

  const badgeName =
    latestGrowthBadge?.badge?.name?.toLowerCase() as keyof typeof GROWTH_STAGES_MAP;
  // const badgeName: keyof typeof GROWTH_STAGES_MAP = "sapling"; 

  const data =
    (badgeName && GROWTH_STAGES_MAP[badgeName]) || GROWTH_STAGES_MAP[stage];

  if (!data) return null;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={styles.card}>
        <LinearGradient
          colors={data.gradient}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.textContainer}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={22}
              color={COLORS.white}
            >
              {data.title}
            </CustomText>

            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={15}
              color={COLORS.appBackground}
            >
              {data.subtitle}
            </CustomText>
          </View>
        </LinearGradient>
      </View>
      {/* Overlapping Badge */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setIsBadgesSheet(true)}
        style={styles.badgeContainer}
      >
        <BadgeIcon
          badge={latestGrowthBadge?.badge?.name || "seed"}
          style={styles.badge}
        />
      </TouchableOpacity>

      <MyBadgesModal
        isVisible={isBadgesSHeet}
        setIsVisible={setIsBadgesSheet}
        navigateToBadge={() => {
          navigation.navigate("MainStack", { screen: "badges" });
        }}
      />
    </View>
  );
};

export default GrowthStageCard;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: verticalScale(70),
    borderRadius: 16,
    marginBottom: verticalScale(8),
    marginTop: verticalScale(12),
    alignSelf: "center",
  },
  gradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    width: wp(80),
  },
  textContainer: {
    flex: 1,
    marginLeft: horizontalScale(24),
  },
  badgeContainer: {
    position: "absolute",
    right: Platform.OS === "ios" ? verticalScale(-2) : verticalScale(-2),
  },
  badge: {
    width: horizontalScale(90),
    height: verticalScale(90),
    resizeMode: "contain",
  },
});
