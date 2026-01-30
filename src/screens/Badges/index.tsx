import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ImageSourcePropType,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { FC, useEffect, useState } from "react";
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
import { fetchData } from "../../service/ApiService";
import ENDPOINTS from "../../service/ApiEndpoints";
import {
  Badge,
  GetAllBadgesResponse,
} from "../../service/ApiResponses/GetAllBadges";


const Badges: FC<BadgesScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<"Growth" | "Art" | "Impact">(
    "Growth",
  );
  const [isBadgeModalVisible, setIsBadgeModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredBadges = badges.filter(
    (b) => b.category === activeTab.toUpperCase(),
  );
  const communityBadge = badges?.filter(
    (badge) => badge.category === "COMMUNITY" && badge.isUnlocked,
  )[0];

  const getBadgeSubtitle = (badge: Badge) => {
    switch (badge.category) {
      case "GROWTH": {
        const months = badge?.requirement?.consecutiveMonths ?? 0;
        return `${months} month${months === 1 ? "" : "s"}`;
      }

      case "ART": {
        const shares = badge?.requirement?.totalShares ?? 0;
        return `${shares} share${shares === 1 ? "" : "s"}`;
      }

      case "IMPACT": {
        const amount = badge?.requirement?.totalDonations ?? 0;
        return `$${amount} donated`;
      }

      default:
        return "";
    }
  };

 const fetchAllBadges = async () => {
   try {
     setLoading(true);
     const res = await fetchData<GetAllBadgesResponse>(ENDPOINTS.GetAllBadges);
     setBadges(res?.data?.data?.badges);
   } catch (error) {
     console.log("error", error);
   } finally {
     setLoading(false);
   }
 };

  useEffect(() => {
    fetchAllBadges();
  }, []);
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.darkText} />
      </View>
    );
  }
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
              source={{
                uri: communityBadge?.iconPngUrl,
              }}
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
                {communityBadge?.name}
              </CustomText>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={14}
                color={"#1D222B50"}
                style={{ textAlign: "center" }}
              >
                {communityBadge?.milestone}
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
            data={filteredBadges}
            keyExtractor={(item) => item?.id}
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
            renderItem={({ item: badge }) => {
              const isUnlocked = badge.isUnlocked;

              console.log(isUnlocked);

              return (
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
                    source={{ uri: badge?.iconPngUrl }}
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
                      {badge?.title}
                    </CustomText>
                    <CustomText
                      fontFamily="SourceSansRegular"
                      fontSize={12}
                      color={COLORS.appText}
                      style={{ textAlign: "center" }}
                    >
                      {getBadgeSubtitle(badge)}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </FocusResetScrollView>
      </SafeAreaView>
      <BadgesDetail
        isVisible={isBadgeModalVisible}
        setIsVisible={setIsBadgeModalVisible}
        badgeLabel={selectedBadge?.title}
        badgeMonths={selectedBadge?.createdAt}
        badgeImage={{ uri: selectedBadge?.iconPngUrl }}
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
});