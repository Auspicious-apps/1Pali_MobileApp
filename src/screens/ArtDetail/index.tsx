import React, { FC, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import FocusResetScrollView from "../../components/FocusResetScrollView";
import ENDPOINTS from "../../service/ApiEndpoints";
import { ArtCommentsResponse } from "../../service/ApiResponses/ArtComments";
import { FetchArtCommentsResponse } from "../../service/ApiResponses/FetchArtComments";
import {
  Comment,
  GetArtByIdResponse,
} from "../../service/ApiResponses/GetArtById";
import { LikeUnlikeArtResponse } from "../../service/ApiResponses/LikeUnlikeArt";
import { ShareArtResponse } from "../../service/ApiResponses/ShareArtResponse";
import { fetchData, postData } from "../../service/ApiService";
import { ArtDetailScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale } from "../../utils/Metrics";

const ArtDetail: FC<ArtDetailScreenProps> = ({ navigation, route }) => {
  const [isLiked, setIsLiked] = useState(false);
  const lastTap = useRef<number>(0);
  const likeScale = useRef(new Animated.Value(0)).current;
  const { ArtId } = route.params;
  const [artDetail, setArtDetail] = useState<GetArtByIdResponse>();
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<TextInput>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const timeAgo = (date?: string) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const handleArtDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchData<GetArtByIdResponse>(
        `${ENDPOINTS.GetArtById}/${ArtId}`,
      );

      if (response?.data?.success) {
        const data = response.data.data;

        setArtDetail({
          ...data,
          comments: data.comments,
        });
        setIsLiked(response?.data?.data?.isLikedByUser);
        setComments(data.comments);
        setPage(1);
        setHasNext(response?.data?.data?.commentsPagination?.hasNext);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtComments = async (pageNumber: number) => {
    try {
      setCommentsLoading(true);

      const response = await fetchData<FetchArtCommentsResponse>(
        `${ENDPOINTS.GetArtComments}/${ArtId}/comments?page=${pageNumber}&limit=10`,
      );

      if (response?.data?.success) {
        const data = response.data.data;

        setComments((prev): any => [...prev, ...data.comments]);
        setHasNext(data.pagination.hasNext);
        setPage(pageNumber);
      }
    } catch (error) {
      console.log("Fetch comments error", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await postData<ArtCommentsResponse>(
        `${ENDPOINTS.CommentsOnArt}/${ArtId}/comments`,
        { content: commentText.trim() },
      );

      if (response?.data?.data?.comments?.length) {
        setArtDetail((prev): any =>
          prev
            ? {
                ...prev,
                comments: response?.data?.data?.comments,
                commentsCount: response?.data?.data?.pagination?.total,
              }
            : prev,
        );

        setCommentText("");
        commentInputRef.current?.blur();
      }
    } catch (error) {
      console.log("Add comment error", error);
    }
  };

  const handleCommentIconPress = () => {
    commentInputRef.current?.focus();
  };

  const handleLikeUnlike = async () => {
    try {
      const response = await postData<LikeUnlikeArtResponse>(
        `${ENDPOINTS.LikeUnlikeArt}/${ArtId}/like`,
      );

      if (response?.data?.data?.action) {
        setIsLiked(response?.data?.data?.isLiked);
        setArtDetail((prev) =>
          prev
            ? { ...prev, likesCount: response?.data?.data?.likesCount }
            : prev,
        );
      }
    } catch (error) {
      console.log("Like/Unlike error", error);
    }
  };

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
        handleLikeUnlike();
        triggerLikeAnimation();
      }
    }
    lastTap.current = now;
  };

  const handleShare = async () => {
    if (sharing || !artDetail) return;

    try {
      setSharing(true);

      const result = await Share.share({
        title: artDetail.title,
        message: `${artDetail.title}\n\n${artDetail?.description || ""}\n\n${
          artDetail.mediaUrl
        }`,
        url: artDetail.mediaUrl,
      });

      if (result.action === Share.sharedAction) {
        const response = await postData<ShareArtResponse>(
          `${ENDPOINTS.ShareArt}/${ArtId}/share`,
          { platform: "WHATSAPP" },
        );

        if (response?.data?.success) {
          setArtDetail((prev) =>
            prev
              ? {
                  ...prev,
                  sharesCount: response?.data?.data?.sharesCount,
                }
              : prev,
          );
        }
      }
    } catch (error) {
      console.log("Share error", error);
    } finally {
      setSharing(false);
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
          #{item?.user?.assignedNumber}
        </CustomText>
        <CustomText
          fontFamily="SourceSansRegular"
          fontSize={14}
          color={COLORS.darkText}
          style={{ width: "100%" }}
        >
          {item?.content}
        </CustomText>
        <View style={styles.commentMetaRow}>
          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={12}
            color={COLORS.appText}
          >
            {timeAgo(item?.createdAt)}
          </CustomText>
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    handleArtDetail();
  }, [ArtId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.darkText} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.side}>
            <TouchableOpacity activeOpacity={0.8}>
              <CustomIcon
                Icon={ICONS.backArrow}
                height={24}
                width={24}
                onPress={() => navigation.goBack()}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.center}>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={18}
              color={COLORS.darkText}
            >
              {artDetail?.createdAt
                ?.slice(0, 10)
                ?.split("-")
                ?.reverse()
                ?.join(".")}
            </CustomText>
          </View>

          <View style={styles.side} />
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
            <TouchableWithoutFeedback onPress={handleImageDoubleTap}>
              <View style={styles.imageWrapper}>
                {imageLoading && (
                  <View style={styles.imageLoader}>
                    <ActivityIndicator size="small" color={COLORS.darkText} />
                  </View>
                )}

                <Image
                  source={{ uri: artDetail?.mediaUrl }}
                  style={styles.updateImage}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
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
                  onPress={handleLikeUnlike}
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
                  {artDetail?.likesCount}
                </CustomText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: horizontalScale(2),
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCommentIconPress}
                >
                  <CustomIcon Icon={ICONS.chatIcon} height={24} width={24} />
                </TouchableOpacity>

                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={16}
                  color={COLORS.appText}
                >
                  {artDetail?.commentsCount}
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
                {artDetail?.title}
              </CustomText>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={14}
                color={COLORS.appText}
              >
                {artDetail?.artistName}, {artDetail?.artistAge} years old
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
                {artDetail?.description}
              </CustomText>

              <View
                style={{ borderBottomWidth: 1, borderColor: COLORS.greyish }}
              />

              <View style={styles.commentInputRow}>
                <View style={styles.commentInputWrapper}>
                  <TextInput
                    ref={commentInputRef}
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Add a comment..."
                    placeholderTextColor={COLORS.appText}
                    style={styles.commentInput}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSendComment}
                  >
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
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderCommentItem}
                scrollEnabled={false}
                contentContainerStyle={styles.commentsList}
              />
              {hasNext && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => fetchArtComments(page + 1)}
                  disabled={commentsLoading}
                >
                  {commentsLoading ? (
                    <ActivityIndicator color={COLORS.darkText} />
                  ) : (
                    <CustomText
                      fontFamily="SourceSansRegular"
                      fontSize={16}
                      color={COLORS.darkGreen}
                      style={{ textAlign: "center" }}
                    >
                      Load more comments
                    </CustomText>
                  )}
                </TouchableOpacity>
              )}
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

  side: {
    width: horizontalScale(40),
    alignItems: "flex-start",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  imageLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.greyish,
    zIndex: 10,
    borderRadius: 20,
  },
});
