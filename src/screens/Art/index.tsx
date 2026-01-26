import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import React, { FC, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArtScreenProps } from "../../typings/routes";
import IMAGES from "../../assets/Images";
import { horizontalScale, hp, verticalScale } from "../../utils/Metrics";
import { CustomText } from "../../components/CustomText";
import COLORS from "../../utils/Colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_PADDING = horizontalScale(20);
const CARD_GAP = horizontalScale(12);
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_PADDING * 2 - CARD_GAP) / 2;

const artData = [
  { id: "1", image: IMAGES.FeedImage, month: "03.04.2025" },
  { id: "2", image: IMAGES.FeedImage, month: "03.04.2025" },
  { id: "3", image: IMAGES.FeedImage, month: "03.04.2025" },
  { id: "4", image: IMAGES.FeedImage, month: "03.04.2025" },
  { id: "5", image: IMAGES.FeedImage, month: "03.04.2025" },
  { id: "6", image: IMAGES.FeedImage, month: "03.04.2025" },
];

const Art: FC<ArtScreenProps> = ({ navigation }) => {
  const renderItem = useCallback(
    ({ item }: { item: (typeof artData)[number] }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.cardContainer}
        onPress={() => navigation.navigate("artDetail")}
      >
        <ImageBackground
          source={item.image}
          style={styles.image}
          imageStyle={styles.imageRadius}
        />

        <CustomText
          style={styles.monthText}
          fontFamily="SourceSansRegular"
          fontSize={14}
          color={COLORS.appText}
        >
          {item.month}
        </CustomText>
      </TouchableOpacity>
    ),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <Image source={IMAGES.OnePaliLogo} style={styles.logo} />

        <View style={styles.header}>
          <CustomText
            fontFamily="GabaritoSemiBold"
            fontSize={36}
            color={COLORS.darkText}
          >
            Art
          </CustomText>

          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={15}
            color={COLORS.appText}
            style={styles.subtitle}
          >
            Artwork added weekly. Share to spread the mission.
          </CustomText>
        </View>
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Art of the Week */}
        <TouchableOpacity
          style={styles.weekCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("artDetail")}
        >
          <Image source={IMAGES.FeedImage} style={styles.weekImage} />

          <View style={styles.weekContent}>
            <View style={styles.weekBadge}>
              <CustomText
                fontFamily="SourceSansMedium"
                fontSize={15}
                color={COLORS.greenish}
              >
                Art of the Week
              </CustomText>
            </View>

            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={18}
              color={COLORS.darkText}
              style={styles.weekTitle}
            >
              Three Kids on the Steps
            </CustomText>
          </View>
        </TouchableOpacity>

        <View style={{ marginBottom: verticalScale(20) }}>
          {/* Grid List (NON-scrollable) */}
          <FlatList
            data={artData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Art;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: { flexGrow: 1 },

  headerWrapper: {
    paddingHorizontal: SIDE_PADDING,
  },

  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: Platform.OS === "ios" ? 0 : verticalScale(10),
  },

  header: {
    marginTop: verticalScale(32),
    marginBottom: verticalScale(20),
    alignItems: "center",
  },

  subtitle: {
    textAlign: "center",
    marginTop: verticalScale(6),
  },
  weekCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: verticalScale(16),
    marginHorizontal: horizontalScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 5,
    marginTop: verticalScale(12),
  },
  weekImage: {
    width: "100%",
    height: hp(47),
    borderRadius: 25,
  },

  weekContent: {
    paddingTop: verticalScale(16),
  },

  weekBadge: {
    alignSelf: "center",
    backgroundColor: COLORS.greenLight,
    borderRadius: 16,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(8),
  },

  weekTitle: {
    textAlign: "center",
  },

  listContent: {
    paddingBottom: verticalScale(10),
  },

  card: {
    width: CARD_WIDTH,
    marginBottom: verticalScale(24),
  },
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: horizontalScale(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 5,
    marginTop: verticalScale(16),
  },

  image: {
    width: "100%",
    height: hp(24),
    justifyContent: "flex-end",
  },

  imageRadius: {
    borderRadius: 14,
  },

  monthText: {
    marginTop: verticalScale(10),
    textAlign: "center",
  },

  columnWrapper: {
    paddingHorizontal: SIDE_PADDING,
    justifyContent: "space-between",
  },
});
