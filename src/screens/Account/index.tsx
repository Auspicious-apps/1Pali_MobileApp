import React, { FC } from 'react';
import {
  Alert,
  Image,
  Platform,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import ICONS from '../../assets/Icons';
import IMAGES from '../../assets/Images';
import CustomIcon from '../../components/CustomIcon';
import { CustomText } from '../../components/CustomText';
import FocusResetScrollView from '../../components/FocusResetScrollView';
import ProgressBar from '../../components/ProgressBar';
import { AccountScreenProps } from '../../typings/routes';
import COLORS from '../../utils/Colors';
import { horizontalScale, verticalScale, wp } from '../../utils/Metrics';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { deleteLocalStorageData } from "../../utils/Helpers";
import STORAGE_KEYS from "../../utils/Constants";
import { Screen } from "react-native-screens";

const BADGES = [
  { id: 1, image: IMAGES.Sprout1, label: 'Sprout' }, 
  { id: 2, image: IMAGES.Sprout2, label: 'First 1000' }, 
  { id: 3, image: IMAGES.Sprout3, label: 'Megaphone' }, 
];

const Account : FC<AccountScreenProps> = ({navigation, route}) => {

  // Remove modal state, use system share sheet

  const memberNumber = route?.params?.number || '1948';

  const ACCOUNT_OPTIONS = [
    {
      id: "member",
      icon: ICONS.HashIcon,
      label: "Member number",
      value: `#${memberNumber}`,
      onPress: undefined,
    },
    {
      id: "email",
      icon: ICONS.EmailIcon,
      label: "Email",
      value: "omarswidan@ymail.com",
      onPress: undefined,
    },
    {
      id: "badges",
      icon: ICONS.BadgesIcon,
      label: "Badges",
      arrow: true,
      onPress: () => navigation.navigate("badges"),
    },
    {
      id: "donations",
      icon: ICONS.dollerIcon,
      label: "Manage Donations",
      arrow: true,
      onPress: () => navigation.navigate("manageDonation"),
    },
    {
      id: "receipts",
      icon: ICONS.ReceiptIcon,
      label: "Receipts",
      arrow: true,
      onPress: () => {
        navigation.navigate("receipts");
      },
    },
    {
      id: "faqs",
      icon: ICONS.FAQsIcon,
      label: "FAQs",
      arrow: true,
      onPress: () => {},
    },
    {
      id: "terms",
      icon: ICONS.TermIcon,
      label: "Terms and Conditions",
      arrow: true,
      onPress: () => navigation.navigate("termsConditions"),
    },
    {
      id: "privacy",
      icon: ICONS.PrivacyIcon,
      label: "Privacy Policy",
      arrow: true,
      onPress: () => {
        navigation.navigate("privacyPolicy");
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
            // onPress: () => navigation.navigate('splash'),

            onPress: async () => {
              deleteLocalStorageData(STORAGE_KEYS.accessToken);
              await GoogleSignin.signOut();
              navigation.navigate("OnBoardingStack", {
                screen: "missionIntro",
                params: {},
              });
            },
          },
        ]);
      },
    },
  ];

  const renderRow = (item: any) => {
    const Container = item.onPress ? TouchableOpacity : View;

    return (
      <Container
        key={item.id}
        onPress={item.onPress}
        activeOpacity={0.7}
        style={styles.row}
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
                fontSize={32}
                color={COLORS.darkText}
                style={{ textAlign: "center" }}
              >
                #{memberNumber}
              </CustomText>
              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={14}
                color={COLORS.appText}
                style={{ textAlign: "center" }}
              >
                Member since Feb 12, 2026
              </CustomText>
            </View>
            <View style={styles.card}>
              {/* Badge Row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
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
                    fontFamily="GabaritoRegular"
                    fontSize={16}
                    color={COLORS.darkText}
                  >
                    Sprout
                  </CustomText>
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={16}
                    color={COLORS.appText}
                  >
                    3 months
                  </CustomText>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    right: horizontalScale(15),
                  }}
                >
                  {BADGES.map((badge, index) => (
                    <Image
                      key={badge.id}
                      source={badge.image}
                      style={{
                        width: horizontalScale(72),
                        height: verticalScale(72),
                        marginLeft: index === 0 ? 0 : -30,
                        borderRadius: 36,
                        zIndex: BADGES.length - index,
                      }}
                    />
                  ))}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      navigation.navigate("badges");
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
              </View>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: "#EAEAEA",
                  marginBottom: 10,
                }}
              />
              {/* Stats Row */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    flex: 1,
                    gap: verticalScale(6),
                  }}
                >
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={12}
                    color={COLORS.appText}
                  >
                    Donated
                  </CustomText>
                  <View style={styles.AccountDivider} />
                  <View style={{ alignItems: "center" }}>
                    <CustomText
                      fontFamily="GabaritoMedium"
                      fontSize={18}
                      color={COLORS.darkText}
                    >
                      $12
                    </CustomText>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={14}
                      color={COLORS.appText}
                    >
                      Lifetime
                    </CustomText>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    flex: 1,
                    gap: verticalScale(6),
                  }}
                >
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={12}
                    color={COLORS.appText}
                  >
                    Community
                  </CustomText>
                  <View style={styles.AccountDivider} />
                  <View style={{ alignItems: "center" }}>
                    <CustomText
                      fontFamily="GabaritoMedium"
                      fontSize={18}
                      color={COLORS.darkText}
                    >
                      Founder
                    </CustomText>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={12}
                      color={COLORS.appText}
                    >
                      First 1K donors
                    </CustomText>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    flex: 1,
                    gap: verticalScale(6),
                  }}
                >
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={12}
                    color={COLORS.appText}
                  >
                    Active
                  </CustomText>
                  <View style={styles.AccountDivider} />
                  <View style={{ alignItems: "center" }}>
                    <CustomText
                      fontFamily="GabaritoMedium"
                      fontSize={18}
                      color={COLORS.darkText}
                    >
                      3
                    </CustomText>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={12}
                      color={COLORS.appText}
                    >
                      Months
                    </CustomText>
                  </View>
                </View>
              </View>
              {/* Progress Bar */}
              <ProgressBar currentStep={1} totalSteps={10} />

              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={14}
                color={"#1D222B90"}
                style={{ textAlign: "center" }}
              >
                Sapling badge unlocked at 6 months
              </CustomText>
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
                {ACCOUNT_OPTIONS.map(renderRow)}
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
}

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