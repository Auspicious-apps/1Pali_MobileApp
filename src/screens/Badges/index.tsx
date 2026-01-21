import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ImageSourcePropType,
  Platform,
} from "react-native";
import React, { FC, useState } from 'react';
import IMAGES from '../../assets/Images';
import { horizontalScale, verticalScale, wp } from '../../utils/Metrics';
import COLORS from '../../utils/Colors';
import { CustomText } from '../../components/CustomText';
import { SafeAreaView } from 'react-native-safe-area-context';
import BadgesDetail from '../../components/Modal/BadgesDetail';
import CustomIcon from '../../components/CustomIcon';
import ICONS from '../../assets/Icons';
import { BadgesScreenProps } from '../../typings/routes';
import FocusResetScrollView from '../../components/FocusResetScrollView';

type Badge = {
  id: number;
  label: string;
  months: string;
  image: ImageSourcePropType;
  unlocked: boolean;
};

const GROWTH_BADGES: Badge[] = [
  {
    id: 1,
    label: "Seed",
    months: "1 month",
    image: IMAGES.seedsOne,
    unlocked: true,
  },
  {
    id: 2,
    label: "Sprout",
    months: "3 months",
    image: IMAGES.SproutSeed,
    unlocked: true,
  },
  {
    id: 3,
    label: "Sapling",
    months: "6 months",
    image: IMAGES.SaplingSeed,
    unlocked: true,
  },
  {
    id: 4,
    label: "Rooted",
    months: "12 months",
    image: IMAGES.RootedSeed,
    unlocked: true,
  },
  {
    id: 5,
    label: "Branch",
    months: "18 months",
    image: IMAGES.BranchSeed,
    unlocked: true,
  },
  {
    id: 6,
    label: "Trunk",
    months: "24 months",
    image: IMAGES.TrunkSeed,
    unlocked: true,
  },
  {
    id: 7,
    label: "Bloom",
    months: "3 years",
    image: IMAGES.BloomSeed,
    unlocked: true,
  },
  {
    id: 8,
    label: "Eternal",
    months: "5 years",
    image: IMAGES.EternalSeed,
    unlocked: true,
  },
];
const ART_BADGES: Badge[] = [
  {
    id: 1,
    label: "Voice",
    months: "1 share",
    image: IMAGES.VoiceSeed,
    unlocked: true,
  },
  {
    id: 2,
    label: "Advocate",
    months: "5 shares",
    image: IMAGES.AdvocateSeed,
    unlocked: true,
  },
  {
    id: 3,
    label: "Messenger",
    months: "10 shares",
    image: IMAGES.MessengerSeed,
    unlocked: true,
  },
  {
    id: 4,
    label: "Ambassador",
    months: "25 shares",
    image: IMAGES.AmbassadorSeed,
    unlocked: true,
  },
  {
    id: 5,
    label: "Bridge",
    months: "50 shares",
    image: IMAGES.BridgeSeed,
    unlocked: true,
  },
];
const IMPACT_BADGES: Badge[] = [
  {
    id: 1,
    label: "Jaffa",
    months: "$2 donated",
    image: IMAGES.JaffaSeed,
    unlocked: true,
  },
  {
    id: 2,
    label: "Watermelon",
    months: "$4 donated",
    image: IMAGES.WatermelonSeed,
    unlocked: true,
  },
  {
    id: 3,
    label: "Tatreez",
    months: "$13 donated",
    image: IMAGES.TatreezSeed,
    unlocked: true,
  },
  {
    id: 4,
    label: "Keffiyeh",
    months: "$25 donated",
    image: IMAGES.KeffiyehSeed,
    unlocked: true,
  },
  {
    id: 5,
    label: "Key",
    months: "$50 donated",
    image: IMAGES.KeySeed,
    unlocked: true,
  },
];

const Badges: FC<BadgesScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<"Growth" | "Art" | "Impact">(
    "Growth",
  );
  const [isBadgeModalVisible, setIsBadgeModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const getHeaderBadgeImage = () => {
    switch (activeTab) {
      case 'Growth':
        return IMAGES.FounderSeed;
      case 'Art':
        return IMAGES.EchoSeed;
      case 'Impact':
        return IMAGES.JaffaSeed;
      default:
        return IMAGES.BadgeLogo;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <FocusResetScrollView
          bounces={false}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ width: "100%" }}
          contentContainerStyle={{
            alignItems: "center",
          }}
        >
          <View style={styles.header}>
            <View style={styles.side}>
              <TouchableOpacity
                onPress={() => navigation.navigate("account")}
                activeOpacity={0.8}
              >
                <CustomIcon Icon={ICONS.backArrow} height={24} width={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.center}>
              <Image source={IMAGES.LogoText} style={styles.logo} />
            </View>

            <View style={styles.side} />
          </View>

          <View style={{ marginTop: verticalScale(30) }}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={32}
              color={COLORS.darkText}
              style={{ textAlign: "center" }}
            >
              Badges
            </CustomText>
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={14}
              color={COLORS.appText}
              style={{ textAlign: "center" }}
            >
              Earn badges for your commitment and impact
            </CustomText>
          </View>
          <View style={styles.card}>
            <Image
              source={getHeaderBadgeImage()}
              resizeMode="contain"
              style={{ width: horizontalScale(72), height: verticalScale(72) }}
            />
            <View>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={16}
                color={COLORS.darkText}
                style={{ textAlign: "center" }}
              >
                Founder
              </CustomText>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={14}
                color={"#1D222B50"}
                style={{ textAlign: "center" }}
              >
                You’re part of the first 1K donors
              </CustomText>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: horizontalScale(24),
              marginTop: verticalScale(28),
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("Growth")}
              activeOpacity={0.8}
              style={{
                alignItems: "center",
              }}
            >
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={18}
                color={
                  activeTab === "Growth" ? COLORS.darkText : COLORS.appText
                }
              >
                Growth
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Art")}
              activeOpacity={0.8}
              style={{
                alignItems: "center",
              }}
            >
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={18}
                color={activeTab === "Art" ? COLORS.darkText : COLORS.appText}
              >
                Art
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Impact")}
              activeOpacity={0.8}
              style={{
                alignItems: "center",
              }}
            >
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={18}
                color={
                  activeTab === "Impact" ? COLORS.darkText : COLORS.appText
                }
              >
                Impact
              </CustomText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={
              activeTab === "Growth"
                ? GROWTH_BADGES
                : activeTab === "Art"
                ? ART_BADGES
                : IMPACT_BADGES
            }
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={{
              marginTop: verticalScale(24),
              paddingBottom: verticalScale(16),
              width: wp(90),
            }}
            columnWrapperStyle={{
              justifyContent: "flex-start",
              marginBottom: verticalScale(16),
              paddingHorizontal: horizontalScale(8),
            }}
            renderItem={({ item: badge }) => (
              <TouchableOpacity
                style={{
                  width: wp(28),
                  alignItems: "center",
                  gap: verticalScale(8),
                }}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedBadge(badge);
                  setIsBadgeModalVisible(true);
                }}
              >
                <Image
                  source={badge.image}
                  style={{
                    width: horizontalScale(66),
                    height: verticalScale(66),
                    resizeMode: "contain",
                  }}
                />
                <View style={{ alignItems: "center" }}>
                  <CustomText
                    fontFamily="GabaritoSemiBold"
                    fontSize={14}
                    color={COLORS.darkText}
                    style={{ textAlign: "center" }}
                  >
                    {badge.label}
                  </CustomText>
                  <CustomText
                    fontFamily="SourceSansRegular"
                    fontSize={12}
                    color={COLORS.appText}
                    style={{ textAlign: "center" }}
                  >
                    {badge.months}
                  </CustomText>
                </View>
              </TouchableOpacity>
            )}
          />
        </FocusResetScrollView>
      </SafeAreaView>
      <BadgesDetail
        isVisible={isBadgeModalVisible}
        setIsVisible={setIsBadgeModalVisible}
        badgeLabel={selectedBadge?.label}
        badgeMonths={selectedBadge?.months}
        badgeImage={selectedBadge?.image}
      />
    </View>
  );
};

export default Badges;

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
    padding: horizontalScale(12),
    marginHorizontal: horizontalScale(10),
    marginTop: verticalScale(24),
    width: wp(90),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 6,
    alignItems: "center",
    gap: verticalScale(8),
  },
  header: {
    width: "100%",
    flexDirection: "row",
  },
  side: {
    width: horizontalScale(40),
    alignItems: "flex-start",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
});