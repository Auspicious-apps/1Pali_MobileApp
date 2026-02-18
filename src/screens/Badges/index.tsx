import React, { FC, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import BadgeIcon from "../../components/BadgeIcon";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import BadgesDetail from "../../components/Modal/BadgesDetail";
import { setBadgeData } from "../../redux/slices/BadgesSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import {
  Badge,
  GetAllBadgesResponse,
} from "../../service/ApiResponses/GetAllBadges";
import { fetchData } from "../../service/ApiService";
import { BadgesScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale, wp } from "../../utils/Metrics";

type TabType = "Growth" | "Impact" | "Community";
const Badges: FC<BadgesScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<TabType>("Growth");
  const [isBadgeModalVisible, setIsBadgeModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const { badges } = useAppSelector((state) => state.badges);

  const latestIdentityBadge = badges.filter(
    (b) => b.category === "IDENTITY",
  )?.[0];

  const [loading, setLoading] = useState(false);


  const TAB_CATEGORY_MAP = {
    Growth: "GROWTH",
    Impact: "IMPACT",
    Community: "COMMUNITY",
  };

  const filteredBadges = badges.filter(
    (b) => b.category === TAB_CATEGORY_MAP[activeTab].toUpperCase(),
  );

  const getBadgeSubtitle = (badge: Badge) => {
    switch (badge.category) {
      case "GROWTH": {
        const months = badge?.requirement?.consecutiveMonths ?? 0;
        return `${months} month${months === 1 ? "" : "s"}`;
      }

      case "IMPACT": {
        const shares = badge?.requirement?.totalShares ?? 0;
        return `${shares} share${shares === 1 ? "" : "s"}`;
      }

      case "COMMUNITY": {
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
      dispatch(setBadgeData(res?.data?.data?.badges));
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (badges.length === 0) {
      fetchAllBadges();
    }
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
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <FocusResetScrollView
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
                onPress={() => navigation.goBack()}
                style={{ padding: horizontalScale(8) }}
                activeOpacity={0.8}
              >
                <CustomIcon Icon={ICONS.backArrow} height={26} width={26} />
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
              fontSize={42}
              color={COLORS.darkText}
              style={{ textAlign: "center" }}
            >
              Badges
            </CustomText>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={18}
              color={COLORS.appText}
              style={{ textAlign: "center" }}
            >
              {/* Earn badges for your commitment and impact */}
              Your commitment and milestones
            </CustomText>
          </View>
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => {
                // setSelectedBadge(identityBadge.badge);
                setIsBadgeModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <BadgeIcon
                badge={latestIdentityBadge?.name}
                style={{
                  width: horizontalScale(94),
                  height: verticalScale(94),
                }}
              />
            </TouchableOpacity>
            <View>
              <CustomText
                fontFamily="GabaritoMedium"
                fontSize={20}
                color={COLORS.darkText}
                style={{ textAlign: "center" }}
              >
                {latestIdentityBadge?.name}
              </CustomText>
              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={15}
                color={"#1D222B50"}
                style={{ textAlign: "center" }}
              >
                Among the{" "}
                {latestIdentityBadge?.name
                  // ?.split(" ")
                  // .slice(0, -1)
                  // .join(" ")
                  .toLowerCase()}
              </CustomText>
            </View>
          </View>

          <View style={styles.tabContainer}>
            {["Growth", "Impact", "Community"].map((tab) => {
              const isActive = activeTab === tab;

              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab as any)}
                  activeOpacity={0.8}
                  style={styles.tabButton}
                >
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={16}
                    color={isActive ? COLORS.darkText : COLORS.grey}
                  >
                    {tab}
                  </CustomText>

                  {isActive && <View style={styles.activeUnderline} />}
                </TouchableOpacity>
              );
            })}
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
              const isUnlocked = badge?.isUnlocked;

              if(badge.category === "COMMUNITY") {
                console.log(badge);
              }
              
                
              return (
                <TouchableOpacity
                  style={{
                    width: wp(28),
                    alignItems: "center",
                    gap: verticalScale(8),
                  }}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (!isUnlocked) return;
                    setSelectedBadge(badge);
                    setIsBadgeModalVisible(true);
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 100,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <BadgeIcon
                      badge={badge?.name}
                      locked={!isUnlocked}
                      style={{
                        width: horizontalScale(94),
                        height: verticalScale(94),
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={15}
                      color={!isUnlocked ? COLORS.lightPurple : COLORS.darkText}
                      style={{ textAlign: "center" }}
                    >
                      {badge?.title}
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
        badgeMonths={selectedBadge?.milestone}
        badgeDescription={selectedBadge?.description}
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
    marginTop: verticalScale(10),
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
    elevation: 3,
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginTop: verticalScale(28),
    borderBottomWidth: 1,
    borderColor: COLORS.appBackground,
  },
  tabButton: {
    alignItems: "center",
    flex: 1,
  },
  activeUnderline: {
    marginTop: verticalScale(8),
    height: verticalScale(4),
    width: horizontalScale(94),
    backgroundColor: COLORS.darkText,
    borderRadius: 10,
  },
});
