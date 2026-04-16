import React, { FC, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  PanResponder,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import IMAGES from "../../assets/Images";
import { CustomText } from "../../components/CustomText";
import PrimaryButton from "../../components/PrimaryButton";
import WebViewBottomSheet from "../../components/WebViewBottomSheet";
import { logEvent } from "../../Context/analyticsService";
import { trackOnboardingStepCompleted } from "../../Context/klaviyoClientService";
import { AidSupportScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import {
  horizontalScale,
  hp,
  responsiveFontSize,
  verticalScale,
  wp,
} from "../../utils/Metrics";

type FundCard = {
  id: string;
  image: ImageSourcePropType;
  width: number;
  height: number;
};

const CARD_CONFIG: Omit<FundCard, "height">[] = [
  { id: "1", image: IMAGES.Carousel1, width: wp(78.8) },
  { id: "2", image: IMAGES.Carousel2, width: wp(82) },
  { id: "3", image: IMAGES.Carousel3, width: wp(76) },
  { id: "4", image: IMAGES.Carousel4, width: wp(84.9) },
  { id: "5", image: IMAGES.Carousel5, width: wp(75.3) },
  { id: "6", image: IMAGES.Carousel6, width: wp(82.4) },
  { id: "7", image: IMAGES.Carousel7, width: wp(79.2) },
  { id: "8", image: IMAGES.Carousel8, width: wp(82) },
];

const defaultCardHeight = hp(26);

const getScaledHeight = (image: ImageSourcePropType, targetWidth: number) => {
  const { width: assetWidth, height: assetHeight } =
    Image.resolveAssetSource(image);
  if (!assetWidth || !assetHeight) {
    return defaultCardHeight;
  }
  return Math.max(
    defaultCardHeight,
    Math.round((targetWidth / assetWidth) * assetHeight),
  );
};

const fundCards: FundCard[] = CARD_CONFIG.map((card) => ({
  ...card,
  height: getScaledHeight(card.image, card.width),
}));

const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const AidSupportScreen: FC<AidSupportScreenProps> = ({ navigation }) => {
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const [stepTracked, setStepTracked] = useState(false);
  const marqueeData = [...fundCards, ...fundCards]; // Repeat to ensure seamless scrolling

  useEffect(() => {
    // Track impact stats viewing on mount
    if (!stepTracked) {
      trackOnboardingStepCompleted(2, "Impact Stats", 2);
      setStepTracked(true);
    }
  }, [stepTracked]);

  const translateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const GAP = horizontalScale(30);
  const totalWidth =
    fundCards.reduce((sum, item) => sum + item.width, 0) +
    GAP * (fundCards.length - 1);
  const animationDuration = fundCards.length * 8000;
  const maxOffset = -(totalWidth + GAP);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const currentOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);

  const startAnimation = (fromValue = 0) => {
    animationRef.current?.stop();
    currentOffsetRef.current = fromValue;
    const remainingDistance = Math.abs(maxOffset - fromValue);
    if (remainingDistance <= 0) {
      translateX.setValue(0);
      currentOffsetRef.current = 0;
      startAnimation(0);
      return;
    }

    const duration =
      (animationDuration * remainingDistance) / Math.abs(maxOffset);

    animationRef.current = Animated.timing(translateX, {
      toValue: maxOffset,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    animationRef.current.start(({ finished }) => {
      if (finished && !isDraggingRef.current) {
        translateX.setValue(0);
        currentOffsetRef.current = 0;
        startAnimation(0);
      }
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => startAnimation(0), 1000);
    return () => {
      clearTimeout(timeout);
      animationRef.current?.stop();
    };
  }, [totalWidth]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDraggingRef.current = true;
        animationRef.current?.stop();
        translateX.stopAnimation((value) => {
          currentOffsetRef.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const proposed = currentOffsetRef.current + gestureState.dx;
        translateX.setValue(clampValue(proposed, maxOffset, 0));
      },
      onPanResponderRelease: (_, gestureState) => {
        const released = clampValue(
          currentOffsetRef.current + gestureState.dx,
          maxOffset,
          0,
        );
        translateX.setValue(released);
        currentOffsetRef.current = released;
        isDraggingRef.current = false;
        startAnimation(released);
      },
    }),
  ).current;

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
              android: insets.bottom ? 0 : verticalScale(30),
            }),
          },
        ]}
        edges={["bottom", "top"]}
      >
        {/* LOGO */}
        <Image source={IMAGES.OnePaliLogo} style={styles.appIcon} />

        <View
          style={{
            overflow: "hidden",
            width: wp(100),
            marginTop: verticalScale(40),
            marginBottom: verticalScale(25),
          }}
        >
          <Animated.View
            {...panResponder.panHandlers}
            style={{
              flexDirection: "row",
              transform: [{ translateX }],
              opacity: fadeAnim,
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
        <View style={{ gap: verticalScale(12) }}>
          <CustomText
            fontFamily="GabaritoSemiBold"
            fontSize={42}
            color={COLORS.darkText}
            style={{ textAlign: "center", lineHeight: responsiveFontSize(42) }}
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
            are children.
          </CustomText>
        </View>

        {/*  BUTTON */}
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
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
        </View>

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
  },
  appIcon: {
    width: horizontalScale(54),
    height: verticalScale(54),
    alignSelf: "center",
    resizeMode: "contain",
  },

  fundsListContent: {
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
