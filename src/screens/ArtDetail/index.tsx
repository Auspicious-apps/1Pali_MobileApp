import React, { FC, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale } from "../../utils/Metrics";
import { ArtDetailScreenProps } from "../../typings/routes";
import FocusResetScrollView from "../../components/FocusResetScrollView";

type Comment = {
  id: string;
  text: string;
  time: string;
};

const commentsData: Comment[] = [
  {
    id: "1951",
    text: "Wow! This piece really captivates the viewer's attention!",
    time: "15m ago",
  },
  {
    id: "1950",
    text: "Incredible composition! The colors blend beautifully together!",
    time: "30m ago",
  },
  {
    id: "124",
    text: "Amazing work! The details are breathtaking, truly immersive!",
    time: "1h ago",
  },
  {
    id: "342",
    text: "Absolutely stunning! The scene feels so real and full of life <3",
    time: "2h ago",
  },
];

const ArtDetail: FC<ArtDetailScreenProps> = ({ navigation }) => {
  const [isLiked, setIsLiked] = useState(false);
  const lastTap = useRef<number>(0);
  const likeScale = useRef(new Animated.Value(0)).current;

  const triggerLikeAnimation = () => {
    likeScale.setValue(0);

    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleImageDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (!isLiked) {
        setIsLiked(true);
        triggerLikeAnimation();
      }
    }
    lastTap.current = now;
  };

  const handleShare = async () => {
    try {
      const artImage = Image.resolveAssetSource(IMAGES.FeedImage);
      await Share.share({
        title: "Share Art",
        message: "OnePali supporter #1948. 1 of 1M supporters strong.",
        url: artImage?.uri,
      });
    } catch (error) {
      // ignore
    }
  };

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={{ width: "100%", gap: verticalScale(2) }}>
        <CustomText
          fontFamily="GabaritoMedium"
          fontSize={15}
          color={COLORS.darkText}
        >
          #{item.id}
        </CustomText>
        <CustomText
          fontFamily="SourceSansRegular"
          fontSize={14}
          color={COLORS.darkText}
          style={{ width: "100%" }}
        >
          {item.text}
        </CustomText>
        <View style={styles.commentMetaRow}>
          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={12}
            color={COLORS.appText}
          >
            {item.time}
          </CustomText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity activeOpacity={0.8}>
            <CustomIcon
              Icon={ICONS.backArrow}
              height={24}
              width={24}
              onPress={() => navigation.navigate("art")}
            />
          </TouchableOpacity>
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={18}
            color={COLORS.darkText}
          >
            03.04.2025
          </CustomText>
          <View />
        </View>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <FocusResetScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* <Image
              source={IMAGES.FeedImage}
              style={styles.updateImage}
              resizeMode="cover"
            /> */}

            <TouchableWithoutFeedback onPress={handleImageDoubleTap}>
              <View style={styles.imageWrapper}>
                <Image
                  source={IMAGES.FeedImage}
                  style={styles.updateImage}
                  resizeMode="cover"
                />

                {/* Like animation overlay */}
                <Animated.View
                  style={[
                    styles.likeOverlay,
                    {
                      transform: [{ scale: likeScale }],
                      opacity: likeScale,
                    },
                  ]}
                >
                  <Image
                    source={IMAGES.ImageLike}
                    style={{
                      width: horizontalScale(99),
                      height: verticalScale(87),
                      resizeMode: "contain",
                    }}
                  />
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: horizontalScale(12),
                paddingTop: verticalScale(12),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: horizontalScale(2),
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsLiked((prev) => !prev)}
                >
                  <CustomIcon
                    Icon={isLiked ? ICONS.LikedIcon : ICONS.likeIcon}
                    height={24}
                    width={24}
                  />
                </TouchableOpacity>
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={16}
                  color={COLORS.appText}
                >
                  0
                </CustomText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: horizontalScale(2),
                }}
              >
                <TouchableOpacity activeOpacity={0.8}>
                  <CustomIcon Icon={ICONS.chatIcon} height={24} width={24} />
                </TouchableOpacity>

                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={16}
                  color={COLORS.appText}
                >
                  4
                </CustomText>
              </View>
              <TouchableOpacity activeOpacity={0.8} onPress={handleShare}>
                <CustomIcon Icon={ICONS.shareIcon} height={24} width={24} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                marginTop: verticalScale(16),
              }}
            >
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={24}
                color={COLORS.darkText}
              >
                Title
              </CustomText>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={14}
                color={COLORS.appText}
              >
                Maya Hussein, 16 years old
              </CustomText>
            </View>
            <View
              style={{
                marginTop: verticalScale(16),
                gap: verticalScale(16),
              }}
            >
              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={14}
                color={COLORS.darkText}
              >
                Maya's brush danced across the canvas, as she brought the
                vibrant streets of Ramallah to life with her watercolors.
                Growing up in Palestine, she found solace in the beauty of her
                surroundings, and her art became a reflection of the resilience
                and hope that defined her community. With each delicate stroke,
                Maya poured her heart and soul into her craft, creating pieces
                that told the story of a land and its people, full of life,
                love, and laughter.
              </CustomText>

              <View
                style={{ borderBottomWidth: 1, borderColor: COLORS.greyish }}
              />

              <View style={styles.commentInputRow}>
                <View style={styles.commentInputWrapper}>
                  <TextInput
                    placeholder="Add a comment..."
                    placeholderTextColor={COLORS.appText}
                    style={styles.commentInput}
                  />
                  <TouchableOpacity activeOpacity={0.8}>
                    <CustomText
                      fontFamily="GabaritoSemiBold"
                      fontSize={16}
                      color="#4c80f2"
                    >
                      Send
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>

              <FlatList
                data={commentsData}
                keyExtractor={(item) => item.id}
                renderItem={renderCommentItem}
                scrollEnabled={false}
                contentContainerStyle={styles.commentsList}
              />
            </View>
          </FocusResetScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default ArtDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  safeArea: {
    flex: 1,
    paddingTop: verticalScale(20),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
    marginBottom: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
  },
  keyboardView: {
    flex: 1,
  },
  updateImage: {
    width: "100%",
    height: hp(49),
    borderRadius: 12,
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
    marginTop: verticalScale(10),
    paddingHorizontal: horizontalScale(20),
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
    paddingBottom: verticalScale(16),
  },
  commentInputWrapper: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.greyish,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentInput: {
    fontFamily: "SourceSansRegular",
    fontSize: 14,
    color: COLORS.darkText,
    paddingVertical: verticalScale(5),
    width: "80%",
  },
  commentsList: {
    paddingBottom: verticalScale(8),
  },
  commentItem: {
    paddingBottom: verticalScale(16),
    flexDirection: "row",
    alignItems: "flex-start",
    gap: horizontalScale(12),
  },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(4),
  },
  imageWrapper: {
    position: "relative",
  },

  likeOverlay: {
    position: "absolute",
    top: "40%",
    left: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
});
