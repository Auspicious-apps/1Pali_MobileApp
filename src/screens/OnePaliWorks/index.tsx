import React, { FC, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import PrimaryButton from "../../components/PrimaryButton";
import { onePaliWorksProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";
import styles from "./styles";
import LinearGradient from "react-native-linear-gradient";
import { BlurView } from "@react-native-community/blur";

const fundImages = [IMAGES.kidsImageOne, IMAGES.CharityNavigator];

const fundCards = [
  {
    id: "1",
    icon: ICONS.once,
    title: "Choose your number ",
    description: "Pick any number between 1 and 1,000,000 and make it yours. ",
    image: IMAGES.NumberChoose,
    bgColor: COLORS.midBlue,
  },
  {
    id: "2",
    icon: ICONS.twice,
    title: "Set your monthly donation",
    description:
      "$1 a month keeps your number active and funds humanitarian aid through MECA.",
    image: IMAGES.twiceImage,
    bgColor: COLORS.midDarkGreen,
  },
  {
    id: "3",
    icon: ICONS.thrice,
    title: "Fund aid on the ground",
    description:
      "Your donation powers programs and humanitarian aid delivered through MECA.",
    image: IMAGES.thriceImage,
    bgColor: COLORS.midDarkBrown,
  },
  {
    id: "4",
    title: "Stay connected",
    icon: ICONS.fourice,
    description:
      "Get updates, share children’s artwork, and earn badges along the way.",
    image: IMAGES.LoopImage,
    bgColor: COLORS.midRed,
  },
];


const supportItems = [
  {
    icon: ICONS.soup,
    text: "Hot meals, food parcels, & medicine",
  },
  {
    icon: ICONS.droplets,
    text: "Clean water for drinking & hygiene",
  },
  {
    icon: ICONS.brush,
    text: "Arts and creative activities",
  },
  {
    icon: ICONS.WorkHeart,
    text: "Psychological support & more",
  },
];

const OnePaliWorks: FC<onePaliWorksProps> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const CARD_WIDTH = wp(87);
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <FocusResetScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.contentContainer}
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
              Here’s how OnePali works
            </CustomText>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={18}
              color={COLORS.appText}
              style={{ lineHeight: verticalScale(20) }}
            >
              A growing collective giving monthly to support Palestinian
              children and families through the Middle East Children’s Alliance.
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
                    paddingHorizontal: horizontalScale(12),
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
                    fontSize={15}
                    color={COLORS.greyish}
                    style={{ lineHeight: verticalScale(17) }}
                  >
                    {item.description}
                  </CustomText>
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
              marginTop: 12,
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
              What your support provides
            </CustomText>

            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={15}
              color={COLORS.appText}
              style={styles.sectionDescription}
            >
              Your monthly donation helps fund vital aid and programs for
              Palestinian children, including:
            </CustomText>

            <View style={styles.card}>
              {supportItems.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: horizontalScale(8),
                    paddingVertical: verticalScale(8),
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
            fontFamily="GabaritoRegular"
            fontSize={15}
            style={{
              color: COLORS.appText,
              textAlign: "center",
              marginVertical: verticalScale(16),
            }}
          >
            95% funds aid; 5% supports MECA operations.
          </CustomText>

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
                What is OnePali?
              </CustomText>

              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={15}
                color={COLORS.appText}
                style={styles.sectionDescription}
              >
                OnePali is a community-powered donation app built to create
                sustained humanitarian support for Palestine through small,
                collective monthly giving.
              </CustomText>
            </View>
            <View style={{ gap: verticalScale(8) }}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={22}
                style={styles.centerText}
              >
                Where are funds directed?
              </CustomText>

              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={15}
                color={COLORS.appText}
                style={styles.sectionDescription}
              >
                Donations made through OnePali go directly to the Middle East
                Children’s Alliance (MECA), a four-star Charity Navigator
                organization that has been operating in Gaza for nearly 40
                years.
              </CustomText>
            </View>

            <Image
              source={IMAGES.KidsImage}
              style={{
                width: "100%",
                height: hp(27),
                resizeMode: "cover",
                borderRadius: 17,
                marginTop: verticalScale(16),
              }}
            />
            <View style={styles.imageRow}>
              {fundImages.map((img, index) => (
                <Image
                  key={index}
                  source={img}
                  resizeMode="contain"
                  style={[styles.image, { width: "49.7%" }]}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={22}
              style={[styles.centerText, { textAlign: "center" }]}
            >
              Who’s involved?
            </CustomText>
            <View style={styles.whoCard}>
              <View style={styles.rowContainer}>
                <CustomIcon Icon={ICONS.calenderIcon} width={24} height={24} />
                <View style={{ gap: verticalScale(4) }}>
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={20}
                    color={COLORS.darkText}
                  >
                    OnePali
                  </CustomText>
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={15}
                    color={COLORS.appText}
                    style={{ lineHeight: verticalScale(17) }}
                  >
                    Organizes the collective and facilitates monthly
                    contributions.
                  </CustomText>
                </View>
              </View>

              <View style={styles.innerDivider} />
              <View style={styles.rowContainer}>
                <CustomIcon Icon={ICONS.truckIcon} width={24} height={24} />
                <View style={{ gap: verticalScale(4) }}>
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={20}
                    color={COLORS.darkText}
                  >
                    Middle East Children’s Alliance
                  </CustomText>
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={15}
                    color={COLORS.appText}
                    style={{ lineHeight: verticalScale(17) }}
                  >
                    Distributes aid on the ground and shares updates directly in
                    OnePali.
                  </CustomText>
                </View>
              </View>
            </View>
            <Image
              source={IMAGES.Image}
              resizeMode="contain"
              style={styles.bottomImage}
            />
            <View
              style={[
                styles.sectionWrapper,
                {
                  alignItems: "center",
                  paddingHorizontal: horizontalScale(0),
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
                Updates from MECA on how funds are being used are shared
                directly in the app, so you can clearly see where contributions
                are going.
              </CustomText>
              <Image
                source={IMAGES.GetStartedBottomImage}
                style={styles.mecaImage}
              />
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL("https://onepali.app/");
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
            </View>
          </View>
        </FocusResetScrollView>
        <View style={styles.bottomContainer}>
          <LinearGradient
            colors={["#F8F8FB20", COLORS.appBackground]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.8 }}
            style={styles.gradientOverlay}
          />

          <PrimaryButton
            title="Continue"
            onPress={() => navigation.navigate("claimSpot")}
            style={styles.primaryButton}
            hapticFeedback
            hapticType="impactLight"
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default OnePaliWorks;
