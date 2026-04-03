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

const AidSupportScreen: FC<AidSupportScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);

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
              data={fundCards}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.fundsListContent}
              renderItem={({ item }) => (
                <View style={{ marginRight: horizontalScale(10) }}>
                  <Image
                    source={item.image}
                    style={{
                      width: horizontalScale(item.width),
                      height: verticalScale(item.height),
                      borderRadius: 20,
                      resizeMode: "cover",
                    }}
                  />
                </View>
              )}
            />
          </View>
          <View style={{  marginTop: verticalScale(24), gap: verticalScale(12) }}>
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
              style={{textAlign:"center"}}
            >
              Over 70% of Gaza's population relies on humanitarian aid. Half
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
    gap: horizontalScale(10),
    paddingRight: horizontalScale(16),
    paddingLeft: horizontalScale(16),
    alignItems:"center"
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

