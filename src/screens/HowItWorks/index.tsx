import React, { FC, useEffect } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import PrimaryButton from "../../components/PrimaryButton";
import { logEvent } from "../../Context/analyticsService";
import { HowItWorksScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import {
  horizontalScale,
  isAndroid,
  isTablet,
  verticalScale,
  wp,
} from "../../utils/Metrics";

const supportItems = [
  {
    icon: ICONS.soup,
    text: "Hot meals, food parcels, & nutrition",
  },
  {
    icon: ICONS.droplets,
    text: "Clean water & hygiene",
  },
  {
    icon: ICONS.brush,
    text: "Arts, play & creative programs",
  },
  {
    icon: ICONS.WorkHeart,
    text: "Psychological support & more",
  },
];

const HowItWorks: FC<HowItWorksScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    logEvent("Ob_How_It_Works");
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            marginTop: Platform.select({
              ios: verticalScale(15),
              android: insets.top ? insets.top : verticalScale(30),
            }),
            marginBottom: Platform.select({
              ios: insets.bottom ? 0 : verticalScale(15),
              android: insets.bottom ? 0 : verticalScale(15),
            }),
          },
        ]}
        edges={["bottom", "top"]}
      >
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View style={styles.contentContainer}>
            {/* LOGO */}
            <Image source={IMAGES.OnePaliLogo} style={styles.appIcon} />
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#E5E7EF",
                borderRadius: 100,
                position: "absolute",
                top: 0,
                left: horizontalScale(20),
                height: horizontalScale(32),
                width: horizontalScale(32),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CustomIcon
                Icon={ICONS.BackArrowBg}
                height={horizontalScale(32)}
                width={horizontalScale(32)}
              />
            </TouchableOpacity>
            {/* HEADER */}
            <View style={styles.header}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={42}
                color={COLORS.darkText}
                style={[
                  styles.headerTitle,
                  {
                    lineHeight: isAndroid
                      ? verticalScale(46)
                      : isIphoneSE
                      ? verticalScale(52)
                      : verticalScale(46),
                  },
                ]}
              >
                What your $1 {"\n"} supports
              </CustomText>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={18}
                color={COLORS.appText}
                style={{ lineHeight: verticalScale(20), textAlign: "center" }}
              >
                Every dollar is delivered through MECA,{"\n"} our humanitarian
                partner.
              </CustomText>
            </View>

            <View style={styles.card}>
              <View
                style={{
                  backgroundColor: "#F2F3F790",
                  paddingHorizontal: horizontalScale(12),
                  paddingVertical: verticalScale(20),
                  borderRadius: 20,
                  marginVertical: verticalScale(4),
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    gap: horizontalScale(8),
                    width: "100%",
                  }}
                >
                  <Image
                    source={IMAGES.MECA}
                    resizeMode="contain"
                    style={{
                      width: horizontalScale(140),
                      height: verticalScale(32),
                    }}
                  />
                  <View style={{ gap: verticalScale(4) }}>
                    <CustomText
                      fontFamily="GabaritoMedium"
                      fontSize={20}
                      style={{
                        color: COLORS.darkText,
                        textAlign: "center",
                      }}
                    >
                      Middle East Children’s Alliance
                    </CustomText>
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={15}
                      style={{
                        color: COLORS.appText,
                        flexShrink: 1,
                        textAlign: "center",
                      }}
                    >
                      On the ground in Palestine since 1988
                    </CustomText>
                  </View>
                </View>
              </View>
              <View
                style={{
                  paddingBottom: verticalScale(16),
                  paddingTop: verticalScale(16),
                  paddingHorizontal: horizontalScale(24),
                }}
              >
                {supportItems.map((item, index) => (
                  <View
                    key={item.text + index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: horizontalScale(8),
                      paddingTop:
                        index === 0 ? verticalScale(0) : verticalScale(10),
                      paddingBottom:
                        index === supportItems.length - 1
                          ? verticalScale(0)
                          : verticalScale(10),
                      borderBottomWidth:
                        index !== supportItems.length - 1 ? 1 : 0,
                      borderColor: COLORS.greyish,
                    }}
                  >
                    <CustomIcon
                      Icon={item.icon}
                      height={horizontalScale(24)}
                      width={horizontalScale(24)}
                    />
                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={15}
                      color={COLORS.darkText}
                    >
                      {item.text}
                    </CustomText>
                  </View>
                ))}
              </View>
            </View>
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={13}
              style={{
                color: COLORS.appText,
                textAlign: "center",
                lineHeight: verticalScale(16),
                width: wp(63),
                marginVertical: verticalScale(15),
              }}
            >
              After processing fees, 90% goes to MECA, 10% keeps the OnePali
              platform growing
            </CustomText>
            {/*  BUTTON */}
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              paddingHorizontal: horizontalScale(16),
            }}
          >
            <PrimaryButton
              title="Join OnePali"
              onPress={() => {
                navigation.navigate("animatedNumber");
              }}
              hapticFeedback
              hapticType="impactLight"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default HowItWorks;

const { height, width } = Dimensions.get("window");
const isIphoneSE = Platform.OS === "ios" && height <= 667;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.appBackground,
  },
  safeArea: {
    flex: 1,
  },
  appIcon: {
    width: horizontalScale(54),
    height: verticalScale(54),
    alignSelf: "center",
    resizeMode: "contain",
  },
  header: {
    paddingHorizontal: horizontalScale(20),
  },
  headerTitle: {
    textAlign: "center",
    marginTop: verticalScale(12),
    marginBottom: verticalScale(8),
    // lineHeight: isTablet
    //   ? verticalScale(45)
    //   : isIphoneSE
    //   ? verticalScale(46)
    //   : verticalScale(40),
  },
  contentContainer: {
    alignItems: "center",
  },
  primaryButton: {},
  sectionDescription: {
    lineHeight: verticalScale(18),
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: verticalScale(4),
    shadowColor: "#757A97",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
    marginTop: verticalScale(24),
    paddingHorizontal: horizontalScale(8),
    paddingBottom: verticalScale(16),
    width: isTablet ? wp(80) : wp(90),
  },
  centerText: {
    color: COLORS.darkText,
    textAlign: "center",
  },
  dividers: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: COLORS.greyish,
    alignSelf: "center",
    marginVertical: verticalScale(12),
  },
});
