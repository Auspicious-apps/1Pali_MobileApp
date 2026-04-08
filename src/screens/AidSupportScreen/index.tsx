import React, { FC, useEffect, useRef, useState } from "react";
import {  FlatList, Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IMAGES from "../../assets/Images";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import PrimaryButton from "../../components/PrimaryButton";
import WebViewBottomSheet from "../../components/WebViewBottomSheet";
import { setRemainingSpots } from "../../redux/slices/remainingSpotsSlice";
import { useAppDispatch } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { RemainingSpotsApiResponse } from "../../service/ApiResponses/RemainingSpots";
import { fetchData } from "../../service/ApiService";
import { AidSupportScreenProps } from "../../typings/routes";
import { horizontalScale, hp, isTablet, verticalScale, wp } from "../../utils/Metrics";
import { logEvent } from "../../Context/analyticsService";
import COLORS from "../../utils/Colors";
import { CustomText } from "../../components/CustomText";

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
    width: wp(84.2),
    height: hp(26.2),
  },
];
const carouselData = [...fundCards, fundCards[0]]; // Clone first item at end

const AidSupportScreen: FC<AidSupportScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<any>(null);

  // Auto-slide logic with seamless loop
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        let next = prev + 1;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        // If next is the clone (last index), after animation jump to real first
        if (next === carouselData.length - 1) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: 0, animated: false });
            setCurrentIndex(0);
          }, 500);
        }
        return next === carouselData.length - 1 ? 0 : next;
      });
    }, 5000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  const onMomentumScrollEnd = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const width = e.nativeEvent.layoutMeasurement.width;
    let index = Math.round(offset / width);
    // If user swipes to the clone, jump to real first
    if (index === carouselData.length - 1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 0, animated: false });
        setCurrentIndex(0);
      }, 50);
      index = 0;
    }
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["bottom", "top"]}>
        <FocusResetScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* LOGO */}
          <Image source={IMAGES.OnePaliLogo} style={styles.appIcon} />

          {/*  IMAGE CAROUSEL */}
          <View style={{ marginTop: verticalScale(64) }}>
            <FlatList
              ref={flatListRef}
              data={carouselData}
              keyExtractor={(_, idx) => idx.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ width: wp(100) }}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: wp(100),
                    alignItems: "center",
                    justifyContent: "center",
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
              )}
              onMomentumScrollEnd={onMomentumScrollEnd}
              getItemLayout={(_, index) => ({
                length: wp(100),
                offset: index * wp(100),
                index,
              })}
              initialScrollIndex={0}
              snapToAlignment="start"
              decelerationRate="fast"
            />
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

