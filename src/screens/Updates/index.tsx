import React, { FC, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
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
import { fetchData } from "../../service/ApiService";
import { UpdatesScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale } from "../../utils/Metrics";

const Updates: FC<UpdatesScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [imageLoading, setImageLoading] = useState(true);

  const handleUserBlogs = async () => {
    // Function to handle user blogs
    try {
      setIsLoading(true);
      const blogsResponse = await fetchData<GetUserBlogsResponse>(
        ENDPOINTS.GetBlogForUser,
      );
      if (blogsResponse?.data?.success) {
        setBlogs(blogsResponse?.data?.data?.blogs);
      }
      console.log(blogsResponse?.data?.data, "HJJHGJHGHJ");
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleUserBlogs();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.darkText} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Blog }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate("updateDetail", { blogId: item?.id });
      }}
    >
      <View style={styles.imageWrapper}>
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={COLORS.darkText} />
          </View>
        )}

        <Image
          source={{ uri: item.coverPhotoUrl }}
          resizeMode="cover"
          style={styles.cardImage}
          onLoadEnd={() => setImageLoading(false)}
        />
      </View>

      <View
        style={{
          padding: horizontalScale(12),
          paddingBottom: verticalScale(16),
        }}
      >
        <View
          style={{
            paddingVertical: verticalScale(4),
            paddingHorizontal: horizontalScale(8),
            backgroundColor: COLORS.greyBackground,
            alignSelf: "flex-start",
            borderRadius: 16,
            marginTop: verticalScale(8),
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
          >
            Updates from MECA on the ground, shared monthly.
          </CustomText>
        </View>

        <FlatList
          data={blogs}
          bounces={false}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
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
    paddingHorizontal: horizontalScale(20),
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
  },
  listContent: {
    paddingBottom: verticalScale(20),
    gap: verticalScale(12),
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.LightGrey,
    borderRadius: 12,
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
    height: hp(36.5),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: hp(36.5),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.greyBackground,
  },

  /* 🔹 FULL SCREEN LOADER */
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
});
