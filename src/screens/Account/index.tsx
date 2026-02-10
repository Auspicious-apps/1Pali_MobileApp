import { GoogleSignin } from "@react-native-google-signin/google-signin";
import React, { FC } from "react";
import {
  Alert,
  Image,
  Platform,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import ProgressBar from "../../components/ProgressBar";
import {
  selectArtBadges,
  selectCommunityBadges,
  selectGrowthBadges,
  selectImpactBadges,
} from "../../redux/slices/UserSlice";
import { useAppSelector } from "../../redux/store";
import { AccountScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import STORAGE_KEYS from "../../utils/Constants";
import { deleteLocalStorageData, formatDate } from "../../utils/Helpers";
import { horizontalScale, verticalScale, wp } from "../../utils/Metrics";
import BadgeIcon from "../../components/BadgeIcon";

const Account: FC<AccountScreenProps> = ({ navigation, route }) => {
  const { badges, user } = useAppSelector((state) => state.user);

  const growthBadges = useAppSelector(selectGrowthBadges);
  const communityBadges = useAppSelector(selectCommunityBadges);
  const artBadges = useAppSelector(selectArtBadges);
  const impactBadges = useAppSelector(selectImpactBadges);

  const ACCOUNT_OPTIONS = [
    {
      id: "member",
      icon: ICONS.HashIcon,
      label: "Member number",
      value: `#${user?.assignedNumber}`,
      onPress: undefined,
    },
    {
      id: "email",
      icon: ICONS.EmailIcon,
      label: "Email",
      value: user?.email,
      onPress: undefined,
    },
    {
      id: "badges",
      icon: ICONS.BadgesIcon,
      label: "Badges",
      arrow: true,
      onPress: () => navigation.navigate("accountStack", { screen: "badges" }),
    },
    {
      id: "donations",
      icon: ICONS.dollerIcon,
      label: "Manage Donations",
      arrow: true,
      onPress: () =>
        navigation.navigate("accountStack", { screen: "manageDonation" }),
    },
    {
      id: "receipts",
      icon: ICONS.ReceiptIcon,
      label: "Receipts",
      arrow: true,
      onPress: () => {
        navigation.navigate("accountStack", { screen: "receipts" });
      },
    },
    {
      id: "faqs",
      icon: ICONS.FAQsIcon,
      label: "FAQs",
      arrow: true,
      onPress: () => {
        navigation.navigate("accountStack", { screen: "faq" });
      },
    },
    {
      id: "terms",
      icon: ICONS.TermIcon,
      label: "Terms and Conditions",
      arrow: true,
      onPress: () =>
        navigation.navigate("accountStack", { screen: "termsConditions" }),
    },
    {
      id: "privacy",
      icon: ICONS.PrivacyIcon,
      label: "Privacy Policy",
      arrow: true,
      onPress: () => {
        navigation.navigate("accountStack", { screen: "privacyPolicy" });
      },
    },
    {
      id: "signout",
      icon: ICONS.SignoutIcon,
      label: "Sign Out",
      danger: true,
      onPress: () => {
        Alert.alert("Sign out", "Are you sure you want to sign out?", [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Sign out",
            style: "destructive",
            onPress: async () => {
              deleteLocalStorageData(STORAGE_KEYS.accessToken);
              if (Platform.OS === "android") {
                await GoogleSignin.signOut();
              }
              navigation.navigate("OnBoardingStack", {
                screen: "missionIntro",
              });
            },
          },
        ]);
      },
    },
  ];

  const renderRow = (item: any, index: number, total: number) => {
    const Container = item.onPress ? TouchableOpacity : View;
    const isLastItem = index === total - 1;

    return (
      <Container
        key={item.id}
        onPress={item.onPress}
        activeOpacity={0.7}
        style={[styles.row, isLastItem && { borderBottomWidth: 0 }]}
      >
        <View style={styles.leftRow}>
          <CustomIcon Icon={item.icon} height={24} width={24} />
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={16}
            color={COLORS.darkText}
          >
            {item.label}
          </CustomText>
        </View>

        <View style={styles.rightRow}>
          {item.value && (
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={16}
              color={COLORS.appText}
            >
              {item.value}
            </CustomText>
          )}

          {item.arrow && (
            <CustomIcon Icon={ICONS.ArrowRight} height={24} width={24} />
          )}
        </View>
      </Container>
    );
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
            paddingBottom: verticalScale(70),
          }}
        >
          <View style={{ alignItems: "center", width: "100%" }}>
            <Image source={IMAGES.LogoText} style={styles.logo} />
            <View style={{ marginTop: verticalScale(30), width: "100%" }}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={42}
                color={COLORS.darkText}
                style={{ textAlign: "center" }}
              >
                #{user?.assignedNumber}
              </CustomText>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={15}
                color={COLORS.appText}
                style={{ textAlign: "center" }}
              >
                Member since {formatDate(user?.createdAt!)}
              </CustomText>
            </View>
            <View style={styles.card}>
              {/* Badge Row */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate("accountStack", { screen: "badges" });
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#91919110",
                    paddingHorizontal: horizontalScale(12),
                    paddingVertical: verticalScale(10),
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                  }}
                >
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={16}
                    color={COLORS.darkText}
                  >
                    {growthBadges[0]?.badge.category
                      ? growthBadges[0].badge.category.charAt(0).toUpperCase() +
                        growthBadges[0].badge.category.slice(1).toLowerCase()
                      : ""}
                  </CustomText>
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={14}
                    color={COLORS.appText}
                  >
                    {Number(user?.consecutivePaidMonths!) +
                      " " +
                      (Number(user?.consecutivePaidMonths!) > 1
                        ? "months"
                        : "month")}
                  </CustomText>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    right: horizontalScale(15),
                  }}
                >
                  {[
                    ...growthBadges.slice(0, 1),
                    ...communityBadges,
                    ...artBadges.slice(0, 1),
                    ...impactBadges.slice(0, 1),
                  ]?.map((badge, index) => (
                    <BadgeIcon
                      key={badge.id}
                      badge={badge.badge.name}
                      style={{
                        width: horizontalScale(72),
                        height: verticalScale(72),
                        marginLeft: index === 0 ? 0 : -30,
                        borderRadius: 36,
                        zIndex: growthBadges?.length - index,
                        resizeMode: "contain",
                      }}
                    />
                  ))}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      navigation.navigate("accountStack", { screen: "badges" });
                    }}
                  >
                    <CustomIcon
                      Icon={ICONS.RightArrow}
                      height={24}
                      width={24}
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: "#EAEAEA",
                  marginBottom: 12,
                }}
              />
              {/* Stats Row */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: verticalScale(12),
                  paddingHorizontal: horizontalScale(20),
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={18}
                      color={COLORS.darkText}
                    >
                      {`$${user?.totalDonations}`}
                    </CustomText>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={14}
                      color={COLORS.appText}
                    >
                      Donated
                    </CustomText>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: "center",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={18}
                      color={COLORS.darkText}
                    >
                      {communityBadges?.[0]?.badge?.name}
                    </CustomText>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={14}
                      color={COLORS.appText}
                      style={{ textAlign: "center" }}
                    >
                      {communityBadges?.[0]?.badge?.milestone}{" "}
                    </CustomText>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: "center",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={18}
                      color={COLORS.darkText}
                    >
                      {`${user?.consecutivePaidMonths!} mo`}
                    </CustomText>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={14}
                      color={COLORS.appText}
                    >
                      Active
                    </CustomText>
                  </View>
                </View>
              </View>
              {/* Progress Bar */}
              <ProgressBar />

              {user?.nextGrowthBadge && (
                <CustomText
                  fontFamily="GabaritoRegular"
                  fontSize={14}
                  color={"#1D222B90"}
                  style={{ textAlign: "center", marginTop: verticalScale(8) }}
                >
                  {user?.nextGrowthBadge?.name} badge unlocked in{" "}
                  {user?.nextGrowthBadge?.monthsRemaining} months
                </CustomText>
              )}
            </View>

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: COLORS.borderColor,
                width: wp(90),
                alignSelf: "center",
              }}
            >
              <View style={styles.listContainer}>
                {ACCOUNT_OPTIONS.map((item, index) =>
                  renderRow(item, index, ACCOUNT_OPTIONS.length),
                )}
              </View>
            </View>
          </View>
        </FocusResetScrollView>

        <View style={styles.inviteButtonContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              try {
                await Share.share({
                  message:
                    "Join OnePali - $1 for Palestine\nhttps://onepali.app",
                  title: "OnePali - $1 for Palestine",
                });
              } catch (e) {}
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: COLORS.darkText,
              paddingHorizontal: horizontalScale(16),
              paddingVertical: verticalScale(10),
              borderRadius: 100,
            }}
          >
            <CustomIcon Icon={ICONS.users} height={20} width={20} />
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={16}
              color={COLORS.white}
            >
              Invite Friends
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Account;

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
    padding: 16,
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
  },

  listContainer: {
    marginTop: verticalScale(16),
    width: wp(90),
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },

  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(6),
  },

  inviteButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: verticalScale(16),
    alignItems: "center",
  },
  AccountDivider: {
    width: horizontalScale(32),
    paddingBottom: verticalScale(6),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
    alignSelf: "center",
  },
});
