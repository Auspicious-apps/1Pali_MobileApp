import React, { FC, useRef, useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
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
import { horizontalScale, verticalScale, wp } from "../../utils/Metrics";
import styles from "./styles";

const fundImages = [IMAGES.KidsImage, IMAGES.kidsImageOne];

const fundCards = [
  {
    id: "1",
    title: "Choose your number ",
    description: "Starts a $1 monthly subscription to hold your number.",
    image: IMAGES.ClaimCard,
    bgColor: COLORS.midBlue,
  },
  {
    id: "2",
    title: "Support & Share",
    description:
      "Small monthly support fuels real impact—and sharing amplifies it.",
    image: IMAGES.SupportImage,
    bgColor: COLORS.midGreen,
  },
  {
    id: "3",
    title: "Stay in the Loop",
    description: "See where funds go and hear from the ground.",
    image: IMAGES.LoopImage,
    bgColor: COLORS.midRed,
  },
  {
    id: "4",
    title: "Earn your badges",
    description: "Unlock badges for continued support and sharing artwork.",
    image: IMAGES.EarnBadgs,
    bgColor: COLORS.midOrange,
  },
];

const OnePaliWorks: FC<onePaliWorksProps> = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const CARD_WIDTH = wp(84);
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <FocusResetScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.contentContainer}
        >
          <Image source={IMAGES.LogoText} style={styles.appIcon} />

          {/* HEADER */}
          <View style={styles.header}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={Platform.OS === "android" ? 40 : 42}
              color={COLORS.darkText}
              style={styles.headerTitle}
            >
              One cause, one million supporters
            </CustomText>
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={18}
              color={COLORS.appText}
              style={{ lineHeight: verticalScale(20), width: "95%" }}
            >
              OnePali is built on people showing up together. Each member
              donates $1 per month. Small amounts add up when shared by many.
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

                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={18}
                  color={COLORS.greyish}
                  style={styles.fundCardTitle}
                >
                  {item.title}
                </CustomText>

                <CustomText
                  fontFamily="SourceSansRegular"
                  fontSize={15}
                  color={COLORS.greyish}
                  style={{ lineHeight: verticalScale(17) }}
                >
                  {item.description}
                </CustomText>
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
                  marginHorizontal: 4,
                  backgroundColor:
                    index === activeIndex ? COLORS.greyText : COLORS.greey,
                }}
              />
            ))}
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
                What is OnePali?
              </CustomText>

              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={15}
                color={COLORS.appText}
                style={styles.sectionDescription}
              >
                OnePali is a community-driven initiative and digital platform
                created to serve as a portal for individuals to provide
                sustained humanitarian support to Palestine through small,
                collective monthly donations.
              </CustomText>
            </View>
            <View style={{ gap: verticalScale(8) }}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={22}
                style={styles.centerText}
              >
                Where funds are directed?
              </CustomText>

              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={15}
                color={COLORS.appText}
                style={styles.sectionDescription}
              >
                100% of funds raised through OnePali are directed to Gaza
                through the Middle East Children’s Alliance (MECA), who work
                directly on the ground.
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
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={22}
              style={styles.centerText}
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
                    fontFamily="SourceSansRegular"
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
                    fontFamily="SourceSansRegular"
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
            <View style={styles.sectionWrapper}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={22}
                style={styles.centerText}
              >
                How will I stay in the loop?
              </CustomText>

              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={15}
                color={COLORS.appText}
                style={styles.sectionDescription}
              >
                Updates from MECA on how funds are being used are shared
                directly in the app, so you can clearly see where contributions
                are going.
              </CustomText>
              <TouchableOpacity activeOpacity={0.8}>
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

        <PrimaryButton
          title="Continue"
          onPress={() => {
            navigation.navigate("claimSpot");
          }}
          style={styles.primaryButton}
        />
      </SafeAreaView>
    </View>
  );
};

export default OnePaliWorks;
