import React, { FC, useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import IMAGES from "../../assets/Images";
import { CustomText } from "../../components/CustomText";
import { fetchArts } from "../../redux/slices/ArtsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { Artwork } from "../../service/ApiResponses/GetUserArt";
import { ArtScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale } from "../../utils/Metrics";
import Pulse from "../../components/PulseLoading";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_PADDING = horizontalScale(20);
const CARD_GAP = horizontalScale(12);
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_PADDING * 2 - CARD_GAP) / 2;

const Art: FC<ArtScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { artworks, loading } = useAppSelector((state) => state.arts);
  const [weekImageLoading, setWeekImageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const artOfTheWeek = artworks.length > 0 ? artworks[0] : null;
  const gridArtworks = artworks.length > 1 ? artworks.slice(1) : [];

  const WeekSkeleton = () => (
    <View style={styles.weekCard}>
      <Pulse
        style={{
          width: "100%",
          height: hp(47),
          borderRadius: 25,
        }}
      />

      <View style={{ alignItems: "center", marginTop: verticalScale(16) }}>
        <Pulse style={{ width: 140, height: 20, borderRadius: 8 }} />

        <Pulse
          style={{
            width: "70%",
            height: 24,
            borderRadius: 8,
            marginTop: 8,
          }}
        />
      </View>
    </View>
  );

  const GridSkeleton = () => (
    <View style={styles.cardContainer}>
      <Pulse
        style={{
          width: "100%",
          height: hp(24),
          borderRadius: 14,
        }}
      />

      <Pulse
        style={{
          width: "60%",
          height: 16,
          borderRadius: 6,
          alignSelf: "center",
          marginTop: verticalScale(10),
        }}
      />
    </View>
  );

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
    dispatch(fetchArts({ page: 1 }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchArts({ page: 1, forceRefresh: true }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserArt();
  }, [dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: Artwork }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.cardContainer}
        onPress={() => {
          navigation.navigate("artDetail", { ArtId: item?.id });
        }}
      >
        <FastImage
          source={{ uri: getArtworkImage(item) }}
          style={[styles.image, styles.imageRadius]}
        />

        <CustomText
          style={styles.monthText}
          fontFamily="SourceSansRegular"
          fontSize={15}
          color={COLORS.appText}
        >
          {item?.publishedAt!.slice(0, 10).split("-").reverse().join(".")}
        </CustomText>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <FastImage source={IMAGES.LogoText} style={styles.emptyLogo} />
      <CustomText
        fontFamily="GabaritoSemiBold"
        fontSize={24}
        color={COLORS.darkText}
        style={{ textAlign: "center" }}
      >
        No Data
      </CustomText>
      <CustomText
        fontFamily="SourceSansRegular"
        fontSize={15}
        color={COLORS.appText}
        style={{ textAlign: "center", marginTop: verticalScale(8) }}
      >
        No artwork available at the moment. Pull down to refresh.
      </CustomText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.appText}
          />
        }
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
          <View>
            {/* Week shimmer */}
            <WeekSkeleton />

            {/* Grid shimmer */}
            <FlatList
              data={[1, 2, 3, 4]}
              keyExtractor={(item) => item.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
              renderItem={() => <GridSkeleton />}
            />
          </View>
        ) : artworks.length > 0 ? (
          <View>
            {artOfTheWeek && (
              <TouchableOpacity
                style={styles.weekCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate("artDetail", { ArtId: artOfTheWeek?.id })
                }
              >
                <View style={{ position: "relative" }}>
                  {weekImageLoading && (
                    <Pulse
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: hp(47),
                        borderRadius: 25,
                        zIndex: 1,
                      }}
                    />
                  )}

                  <FastImage
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
        ) : (
          <EmptyState />
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
    paddingTop: Platform.OS === "android" ? verticalScale(10) : 0,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: horizontalScale(24),
    marginTop: verticalScale(80),
  },
  emptyLogo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
    marginBottom: verticalScale(24),
  },
});
