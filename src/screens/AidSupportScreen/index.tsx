import React, { FC, useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IMAGES from "../../assets/Images";
import { CustomText } from "../../components/CustomText";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import PrimaryButton from "../../components/PrimaryButton";
import WebViewBottomSheet from "../../components/WebViewBottomSheet";
import { logEvent } from "../../Context/analyticsService";
import { AidSupportScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";

const fundCards = [
  {
    id: "1",
    image: IMAGES.Carousel1,
    width: wp(78.8),
    height: hp(30),
  },
  {
    id: "2",
    image: IMAGES.Carousel2,
    width: wp(82),
    height: hp(24.5),
  },
  {
    id: "3",
    image: IMAGES.Carousel3,
    width: wp(76),
    height: hp(28),
  },
  {
    id: "4",
    image: IMAGES.Carousel4,
    width: wp(84.9),
    height: hp(26.2),
  },
];

const AidSupportScreen: FC<AidSupportScreenProps> = ({ navigation }) => {
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);

  const marqueeData = [...fundCards, ...fundCards]; // Repeat to ensure seamless scrolling

  const translateX = useRef(new Animated.Value(0)).current;
  const GAP = horizontalScale(30);

  const totalWidth =
    fundCards.reduce((sum, item) => sum + item.width, 0) +
    GAP * (fundCards.length - 1);

  useEffect(() => {
    let isMounted = true;
    const animate = () => {
      Animated.timing(translateX, {
        toValue: -(totalWidth + GAP),
        duration: fundCards.length * 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && isMounted) {
          translateX.setValue(0);
          animate();
        }
      });
    };

    setTimeout(() => {
    animate();
    }, 1000); // Start after a short delay

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["bottom", "top"]}>
        <FocusResetScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {/* LOGO */}
          <Image source={IMAGES.OnePaliLogo} style={styles.appIcon} />

          <View
            style={{
              overflow: "hidden",
              width: wp(100),
              marginVertical: verticalScale(40),
            }}
          >
            <Animated.View
              style={{
                flexDirection: "row",
                transform: [{ translateX }],
              }}
            >
              {marqueeData.map((item, index) => (
                <View
                  key={index}
                  style={{
                    width: item.width,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: GAP,
                  }}
                >
                  <Image
                    source={item.image}
                    style={{
                      width: item.width,
                      height: item.height,
                      borderRadius: 20,
                      resizeMode: "cover",
                    }}
                  />
                </View>
              ))}
            </Animated.View>
          </View>
          <View
            style={{ marginTop: verticalScale(24), gap: verticalScale(12) }}
          >
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={42}
              color={COLORS.darkText}
              style={{ lineHeight: verticalScale(40), textAlign: "center" }}
            >
              {`Together, we’ll\nfund`}{" "}
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={42}
                color={COLORS.darkGreen}
              >
                lasting aid
              </CustomText>
            </CustomText>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={18}
              color={COLORS.greyText}
              style={{ textAlign: "center" }}
            >
              Over 80% of Gaza's population relies on humanitarian aid. Half
              them are children.
            </CustomText>
          </View>
        </FocusResetScrollView>

        {/*  BUTTON */}
        <PrimaryButton
          title="Continue"
          onPress={() => {
            logEvent("Ob_How_It_Works");
            navigation.navigate("howItWorks");
          }}
          style={styles.primaryButton}
          hapticFeedback
          hapticType="impactLight"
        />

        {/*  WEBVIEW */}
        <WebViewBottomSheet
          isVisible={isWebViewVisible}
          title="FAQs"
          url="https://onepali.app/"
          onClose={() => setIsWebViewVisible(false)}
        />
      </SafeAreaView>
    </View>
  );
};

export default AidSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
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

  fundsListContent: {
    // No margin or gap needed for full-width carousel
    alignItems: "center",
  },
  primaryButton: {
    zIndex: 10,
  },
  contentContainer: {
    paddingBottom: verticalScale(50),
    flexGrow: 1,
    justifyContent: "flex-start",
  },

  scrollView: {
    flex: 1,
  },

  bottomFadeWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: verticalScale(50),
    height: verticalScale(60),
    zIndex: 5,
  },

  bottomFade: {
    width: "100%",
    height: "100%",
  },
});
