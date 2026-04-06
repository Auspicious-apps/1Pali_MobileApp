import React, { FC, useState } from "react";
import { Dimensions, Image, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import PrimaryButton from "../../components/PrimaryButton";
import WebViewBottomSheet from "../../components/WebViewBottomSheet";
import { logEvent } from "../../Context/analyticsService";
import { useAppDispatch } from "../../redux/store";
import { HowItWorksScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import {
  horizontalScale,
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
  const dispatch = useAppDispatch();
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View style={styles.contentContainer}>
            {/* LOGO */}
            <Image source={IMAGES.OnePaliLogo} style={styles.appIcon} />
            {/* HEADER */}
            <View style={styles.header}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={Platform.OS === "android" ? 42 : 42}
                color={COLORS.darkText}
                style={styles.headerTitle}
              >
                Here’s what {"\n"} $1 can do
              </CustomText>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={18}
                color={COLORS.appText}
                style={{ lineHeight: verticalScale(20), textAlign: "center" }}
              >
                Every dollar moves through MECA, our humanitarian partner.
              </CustomText>
            </View>

            <View style={styles.card}>
              <View
                style={{
                  backgroundColor: "#F2F3F790",
                  padding: horizontalScale(12),
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
                      Serving children & families in Palestine {"\n"} for nearly
                      40 years
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
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  overflow: "hidden",
                  borderRadius: 50,
                  alignSelf: "center",
                }}
              >
                <Image
                  source={IMAGES.progressImage}
                  resizeMode="cover"
                  style={{ width: "100%", height: verticalScale(12) }}
                />
              </View>
              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={13}
                style={{
                  color: COLORS.appText,
                  textAlign: "center",
                  marginTop: verticalScale(8),
                  lineHeight: verticalScale(16),
                }}
              >
                After processing fees, 90% goes to MECA,{"\n"} 10% keeps the
                OnePali platform growing
              </CustomText>
            </View>
            {/*  BUTTON */}

            <PrimaryButton
              title="Join OnePali"
              onPress={() => {
                logEvent("Ob_How_It_Works");
                navigation.navigate("animatedNumber");
              }}
              style={styles.primaryButton}
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
    paddingTop: verticalScale(15),
    marginBottom: verticalScale(8),
  },
  appIcon: {
    width: horizontalScale(54),
    height: verticalScale(54),
    alignSelf: "center",
    resizeMode: "contain",
  },
  header: {
    marginTop: verticalScale(30),
    gap: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
  },
  headerTitle: {
    textAlign: "center",
    lineHeight: isTablet
      ? verticalScale(45)
      : isIphoneSE
      ? verticalScale(46)
      : verticalScale(40),
  },
  contentContainer: {
    alignItems: "center",
  },
  primaryButton: {
    marginTop: verticalScale(24),
    paddingHorizontal: horizontalScale(16),
  },
  sectionDescription: {
    lineHeight: verticalScale(18),
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: verticalScale(4),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 6,
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
