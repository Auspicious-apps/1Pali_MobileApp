import React, { FC, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IMAGES from "../../assets/Images";
import { CustomText } from "../../components/CustomText";
import ENDPOINTS from "../../service/ApiEndpoints";
import {
  Blog,
  GetUserBlogsResponse,
} from "../../service/ApiResponses/GetUserBlogs";
import { UpdatesScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale } from "../../utils/Metrics";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { fetchUpdates } from "../../redux/slices/UpdatesSlice";

const Updates: FC<UpdatesScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { blogs, loading: isLoading } = useAppSelector((state) => state.updates);
  const [imageLoading, setImageLoading] = useState(true);

  const ShimmerCard = () => (
    <View style={styles.weekCard}>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        style={{ width: "100%", height: hp(47), borderRadius: 25 }}
      />

      <View style={{ marginTop: verticalScale(12), gap: 8 }}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={{ width: 120, height: 20, borderRadius: 6 }}
        />

        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={{ width: "80%", height: 24, borderRadius: 6 }}
        />
      </View>
    </View>
  );

  const handleUserBlogs = async () => {
    dispatch(fetchUpdates({}));
  };

  useEffect(() => {
    handleUserBlogs();
  }, [dispatch]);

  const renderItem = ({ item }: { item: Blog }) => (
    <TouchableOpacity
      style={styles.weekCard}
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate("updatesStack", {
          screen: "updateDetail",
          params: { blogId: item.id },
        });
      }}
    >
      <View style={styles.imageWrapper}>
        {imageLoading && (
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={{
              position: "absolute",
              width: "100%",
              height: hp(47),
              borderRadius: 25,
            }}
          />
        )}

        <Image
          source={{ uri: item.coverPhotoUrl }}
          resizeMode="cover"
          style={styles.cardImage}
          onLoadEnd={() => setImageLoading(false)}
        />
      </View>

      <View style={{ paddingTop: verticalScale(12) }}>
        <View
          style={{
            paddingVertical: verticalScale(4),
            paddingHorizontal: horizontalScale(8),
            backgroundColor: COLORS.greyBackground,
            alignSelf: "flex-start",
            borderRadius: 6,
          }}
        >
          <CustomText
            fontFamily="SourceSansMedium"
            fontSize={15}
            color={COLORS.appText}
          >
            {item?.publishMonthYear ||
              new Date(item.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
          </CustomText>
        </View>
        <View style={styles.cardFooter}>
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={18}
            color={COLORS.darkText}
            style={{ width: "100%" }}
          >
            {item.title}
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{
            paddingBottom: verticalScale(20),
            flexGrow: 1,
          }}
        >
          <Image source={IMAGES.LogoText} style={styles.logo} />

          <View style={styles.header}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={36}
              color={COLORS.darkText}
              style={{ textAlign: "center" }}
            >
              Updates
            </CustomText>

            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={15}
              color={COLORS.appText}
              style={{ textAlign: "center" }}
            >
              Updates from MECA on the ground, shared monthly.
            </CustomText>
          </View>

          {isLoading ? (
            <View>
              {[1, 2, 3].map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </View>
          ) : (
            <FlatList
              data={blogs}
              bounces={false}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Updates;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
  },
  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: Platform.OS === "ios" ? verticalScale(0) : verticalScale(10),
  },
  header: {
    marginTop: verticalScale(32),
    marginBottom: verticalScale(24),
    gap: verticalScale(8),
  },
  listContent: {
    paddingBottom: verticalScale(20),
    gap: verticalScale(12),
  },
  weekCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: verticalScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 5,
    marginTop: verticalScale(12),
    marginHorizontal: horizontalScale(4),
  },
  imagePlaceholder: {
    backgroundColor: COLORS.greyish,
    height: hp(36.5),
    width: "100%",
    borderRadius: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: verticalScale(8),
  },
  imageWrapper: {
    width: "100%",
    height: hp(47),
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: hp(47),
    borderRadius: 25,
    resizeMode: "cover",
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.greyBackground,
  },
  inlineLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(20),
    gap: verticalScale(8),
  },
});
