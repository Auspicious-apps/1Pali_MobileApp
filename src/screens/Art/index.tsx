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
  ActivityIndicator,
} from "react-native";
import React, { FC, useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArtScreenProps } from "../../typings/routes";
import IMAGES from "../../assets/Images";
import { horizontalScale, hp, verticalScale } from "../../utils/Metrics";
import { CustomText } from "../../components/CustomText";
import COLORS from "../../utils/Colors";
import { fetchData } from "../../service/ApiService";
import {
  Artwork,
  GetUserArtResponse,
} from "../../service/ApiResponses/GetUserArt";
import ENDPOINTS from "../../service/ApiEndpoints";

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
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekImageLoading, setWeekImageLoading] = useState(true);

  const artOfTheWeek = artworks.length > 0 ? artworks[0] : null;
  const gridArtworks = artworks.length > 1 ? artworks.slice(1) : [];


 const getArtworkImage = (item?: Artwork) => {
   if (!item) {
     return undefined;
   }

   if (item?.mediaType === "VIDEO") {
     return item?.thumbnailUrl;
   } else if (item?.mediaType === "IMAGE") {
     return item?.mediaUrl;
   } else {
     return item?.mediaUrl;
   }
 };

  const fetchUserArt = async () => {
    try {
      setLoading(true);
      const response = await fetchData<GetUserArtResponse>(
        ENDPOINTS.GetArtForUser,
      );

      const data = response?.data?.data?.artworks ?? [];
      setArtworks(data);
    } catch (error) {
      console.error("Error fetching user art:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserArt();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Artwork }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.cardContainer}
        onPress={() => {
          navigation.navigate("artStack", {
            screen: "artDetail",
            params: { ArtId: item?.id },
          });
        }}
      >
        <ImageBackground
          source={{ uri: getArtworkImage(item) }}
          style={styles.image}
          imageStyle={styles.imageRadius}
        />

        <CustomText
          style={styles.monthText}
          fontFamily="SourceSansRegular"
          fontSize={15}
          color={COLORS.appText}
        >
          {item?.createdAt.slice(0, 10).split("-").reverse().join(".")}
        </CustomText>
      </TouchableOpacity>
    ),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerWrapper}>
          <Image source={IMAGES.LogoText} style={styles.logo} />

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

        {loading ? (
          <View style={styles.inlineLoader}>
            <ActivityIndicator size="large" color={COLORS.darkText} />
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={16}
              color={COLORS.darkText}
            >
              Loading Arts
            </CustomText>
          </View>
        ) : (
          <View>
            {artOfTheWeek && (
              <TouchableOpacity
                style={styles.weekCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate("artStack", {
                    screen: "artDetail",
                    params: { ArtId: artOfTheWeek?.id },
                  })
                }
              >
                <View style={{ position: "relative" }}>
                  {weekImageLoading && (
                    <View
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: hp(47),
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: COLORS.greyish,
                        borderRadius: 25,
                        zIndex: 1,
                      }}
                    >
                      <ActivityIndicator size="small" color={COLORS.darkText} />
                    </View>
                  )}

                  <Image
                    source={{ uri: getArtworkImage(artOfTheWeek) }}
                    style={styles.weekImage}
                    onLoadStart={() => setWeekImageLoading(true)}
                    onLoadEnd={() => setWeekImageLoading(false)}
                  />
                </View>

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
                    {artOfTheWeek?.title}
                  </CustomText>
                </View>
              </TouchableOpacity>
            )}

            <View style={{ marginBottom: verticalScale(20) }}>
              {/* Grid List (NON-scrollable) */}
              <FlatList
                // data={[...gridArtworks,...gridArtworks]}
                data={gridArtworks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
              />
            </View>
          </View>
        )}
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
    gap: verticalScale(8),
  },

  subtitle: {
    textAlign: "center",
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
    resizeMode: "cover",
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
  inlineLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(20),
    gap: verticalScale(8),
  },
});
