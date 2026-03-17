import React, { FC, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import PrimaryButton from "../../components/PrimaryButton";
import WebViewBottomSheet from "../../components/WebViewBottomSheet";
import { setRemainingSpots } from "../../redux/slices/remainingSpotsSlice";
import { useAppDispatch } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { RemainingSpotsApiResponse } from "../../service/ApiResponses/RemainingSpots";
import { fetchData } from "../../service/ApiService";
import { onePaliWorksProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale, wp } from "../../utils/Metrics";
import styles from "./styles";
import { ReserveNumberResponse } from "../../service/ApiResponses/ReserveNumberResponse";

const fundImages = [IMAGES.KidsImage, IMAGES.kidsImageOne];

const fundCards = [
  {
    id: "1",
    icon: ICONS.once,
    title: "Choose your number",
    description:
      "Pick any number between 1 and 1,000,000. Each number represents one supporter.",
    image: IMAGES.NumberChoose,
    bgColor: COLORS.midBlue,
  },
  {
    id: "2",
    icon: ICONS.twice,
    title: "Set your donation",
    description:
      "$1, $3, or $5 per month funds humanitarian aid & keeps your number active.",
    image: IMAGES.twiceImage,
    bgColor: COLORS.midDarkGreen,
  },
  {
    id: "3",
    icon: ICONS.thrice,
    title: "Make an impact",
    description:
      "Your donation supports food, water, education, & care through MECA.",
    image: IMAGES.thriceImage,
    bgColor: COLORS.midDarkBrown,
  },
  {
    id: "4",
    title: "Stay connected",
    icon: ICONS.fourice,
    description:
      "Get updates on your impact, artwork from children, & badges along the way.",
    image: IMAGES.LoopImage,
    bgColor: COLORS.midRed,
  },
];

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
    text: "Arts & creative programs",
  },
  {
    icon: ICONS.WorkHeart,
    text: "Psychological support & more",
  },
];

  const { height, width } = Dimensions.get("window");

const OnePaliWorks: FC<onePaliWorksProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const CARD_WIDTH = wp(84);
  const dispatch = useAppDispatch();
  const isIphoneSE = Platform.OS === "ios" && height <= 667;
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [randomNumber, setRandomNumber] = useState<string | null>(null);

  const fetchRemainingSpots = async () => {
    try {
      const response = await fetchData<RemainingSpotsApiResponse>(
        ENDPOINTS.RemainingSpots,
      );

      const spots = response?.data?.data?.availableSpots;

      if (spots !== undefined) {
        dispatch(setRemainingSpots(spots));
      }
    } catch (error) {
      console.error("Remaining Spots API Error:", error);
    }
  };

const fetchRandomNumber = async () => {
  try {
    const response = await fetchData<ReserveNumberResponse>(
      ENDPOINTS.GetRandomNumber,
    );

    const generatedNumber = response?.data?.data?.number;

    if (generatedNumber) {
      return String(generatedNumber);
    }

    return null;
  } catch (error) {
    console.error("GetRandomNumber API Error:", error);
    return null;
  }
};


  useEffect(() => {
    fetchRemainingSpots();
  }, []);

  useEffect(() => {
    fetchRandomNumber().then((num) => {
      if (num) {
        setRandomNumber(num);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={[styles.safeArea, {}]} edges={["bottom", "top"]}>
        <FocusResetScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={[styles.contentContainer]}
        >
          <Image source={IMAGES.OnePaliLogo} style={styles.appIcon} />

          {/* HEADER */}
          <View style={styles.header}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={Platform.OS === "android" ? 42 : 42}
              color={COLORS.darkText}
              style={styles.headerTitle}
            >
              Here’s how {"\n"} OnePali works
            </CustomText>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={18}
              color={COLORS.appText}
              style={{ lineHeight: verticalScale(20), textAlign: "center" }}
            >
              Join a growing collective giving monthly to support Palestinian
              children and families.
            </CustomText>
          </View>

          {/* FUNDS LIST */}

          <FlatList
            ref={flatListRef}
            data={fundCards}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fundsListContent}
            snapToInterval={CARD_WIDTH + horizontalScale(12)}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            scrollEventThrottle={16}
            onScroll={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x /
                  (CARD_WIDTH + horizontalScale(12)),
              );

              if (index !== activeIndex) {
                setActiveIndex(index);
              }
            }}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <View
                  style={[
                    styles.fundCard,
                    { backgroundColor: item.bgColor, width: CARD_WIDTH },
                  ]}
                >
                  {item.image ? (
                    <Image source={item.image} style={styles.fundCardImage} />
                  ) : (
                    <View style={styles.fundCardImage} />
                  )}
                  <View
                    style={{
                      paddingHorizontal: horizontalScale(8),
                      paddingVertical: verticalScale(12),
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: horizontalScale(6),
                        marginBottom: verticalScale(8),
                      }}
                    >
                      <CustomIcon
                        Icon={item.icon}
                        height={verticalScale(32)}
                        width={horizontalScale(32)}
                      />
                      <CustomText
                        fontFamily="GabaritoSemiBold"
                        fontSize={22}
                        color={COLORS.greyish}
                        style={styles.fundCardTitle}
                      >
                        {item.title}
                      </CustomText>
                    </View>

                    <CustomText
                      fontFamily="GabaritoRegular"
                      fontSize={14}
                      color={COLORS.greyish}
                      style={{ lineHeight: verticalScale(17) }}
                    >
                      {item.description}
                    </CustomText>
                  </View>
                </View>
              </View>
            )}
            onMomentumScrollEnd={(
              event: NativeSyntheticEvent<NativeScrollEvent>,
            ) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x /
                  (CARD_WIDTH + horizontalScale(12)),
              );
              setActiveIndex(index);
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {fundCards.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 4,
                  marginRight: horizontalScale(4),
                  backgroundColor:
                    index === activeIndex ? COLORS.greyText : COLORS.greey,
                }}
              />
            ))}
          </View>
          <View
            style={{
              marginTop: verticalScale(24),
              gap: verticalScale(8),
              paddingHorizontal: horizontalScale(16),
            }}
          >
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={22}
              style={styles.centerText}
            >
              Where your $1 goes
            </CustomText>

            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={15}
              color={COLORS.appText}
              style={styles.sectionDescription}
            >
              All donations go directly to MECA, serving children and families
              in Palestine for nearly 40 years.
            </CustomText>

            <View style={styles.card}>
              <View
                style={{
                  marginHorizontal: horizontalScale(24),
                  paddingBottom: verticalScale(16),
                  paddingTop: verticalScale(20),
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
                  backgroundColor: COLORS.greyBackground,
                  padding: horizontalScale(12),
                  borderRadius: 20,
                  margin: verticalScale(8),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: horizontalScale(12),
                    width: "100%",
                    flex: 1,
                  }}
                >
                  <Image
                    source={IMAGES.middleEast}
                    resizeMode="contain"
                    style={{
                      width: horizontalScale(49),
                      height: verticalScale(49),
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <CustomText
                      fontFamily="GabaritoMedium"
                      fontSize={15}
                      style={{
                        color: COLORS.darkText,
                      }}
                    >
                      Middle East Children’s Alliance
                    </CustomText>
                    <CustomText
                      fontFamily="SourceSansRegular"
                      fontSize={13}
                      style={{
                        color: COLORS.appText,
                        flexShrink: 1,
                      }}
                    >
                      Charity Navigator’s Highest 4-Star Rating for
                      Accountability & Transparency{" "}
                    </CustomText>
                  </View>
                </View>
                <View style={styles.dividers} />
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    flex: 1,
                    overflow: "hidden",
                    borderRadius: 50,
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
                    color: COLORS.darkText,
                    textAlign: "center",
                    marginTop: verticalScale(8),
                  }}
                >
                  95% funds aid; 5% supports MECA’s operations.
                </CustomText>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionContainer}>
            <View
              style={{ marginBottom: verticalScale(24), gap: verticalScale(8) }}
            >
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={22}
                style={styles.centerText}
              >
                What makes OnePali different?
              </CustomText>

              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={15}
                color={COLORS.appText}
                style={styles.sectionDescription}
              >
                OnePali turns small monthly donations into reliable, sustained
                aid. Together, we’re building a community of 1 million
                supporters, proving that small amounts add up to lasting impact.
              </CustomText>
            </View>
            <View style={styles.imageRow}>
              {fundImages.map((img, index) => (
                <Image
                  key={index}
                  source={img}
                  resizeMode="contain"
                  style={[styles.image, { width: "48%" }]}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <View
              style={[
                styles.sectionWrapper,
                {
                  alignItems: "center",
                  paddingHorizontal: horizontalScale(0),
                  marginTop: verticalScale(8),
                },
              ]}
            >
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={22}
                style={styles.centerText}
              >
                How will I stay in the loop?
              </CustomText>

              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={15}
                color={COLORS.appText}
                style={[styles.sectionDescription, { textAlign: "center" }]}
              >
                MECA shares updates directly in the app so you can see exactly
                how your contributions are used.
              </CustomText>
              <TouchableOpacity
                onPress={() => {
                  setIsWebViewVisible(true);
                }}
                activeOpacity={0.8}
              >
                <CustomText
                  fontFamily="SourceSansRegular"
                  fontSize={15}
                  color={COLORS.darkText}
                  style={styles.FaqText}
                >
                  See all FAQs at onepali.app
                </CustomText>
              </TouchableOpacity>
              <Image
                source={IMAGES.GetStartedBottomImage}
                style={styles.mecaImage}
              />
            </View>
          </View>
        </FocusResetScrollView>
        <View pointerEvents="none" style={styles.bottomFadeWrapper}>
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.85)",
              "rgba(255,255,255,1)",
            ]}
            locations={[0, 0.35, 0.75, 1]}
            style={styles.bottomFade}
          />
        </View>
        <PrimaryButton
          title="Continue"
          // onPress={() => {
          //   navigation.navigate("claimSpot", {
          //     prefilledNumber: randomNumber,
          //     skipCheck: true,
          //   });
          // }}
          onPress={() => {
            navigation.navigate("animatedNumber");
          }}
          style={styles.primaryButton}
          hapticFeedback
          hapticType="impactLight"
        />
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

export default OnePaliWorks;
