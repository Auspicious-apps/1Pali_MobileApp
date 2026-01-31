import React, { FC, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FONTS from "../../assets/fonts";
import ICONS from "../../assets/Icons";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import ENDPOINTS from "../../service/ApiEndpoints";
import { AddCommentToBlogResponse } from "../../service/ApiResponses/AddCommentToBlog";
import {
  Comment,
  GetBlogByIdResponse,
} from "../../service/ApiResponses/GetBlogById";
import { LikeUnlikeBlogResponse } from "../../service/ApiResponses/LikeUnlikeResponse";
import { fetchData, postData } from "../../service/ApiService";
import { UpdateDetailScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";
import { ShareBlogResponse } from "../../service/ApiResponses/ShareBlogResponse";
import { FetchBlogCommentsResponse } from "../../service/ApiResponses/FetchBlogComments";

const UpdateDetail: FC<UpdateDetailScreenProps> = ({ navigation, route }) => {
  const { blogId } = route.params;
  const [blogDetail, setBlogDetail] = useState<GetBlogByIdResponse>();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<TextInput>(null);
  const [sharing, setSharing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [comments, setComments] = useState<Comment[]>([]);
  const [sendingComment, setSendingComment] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const lastScrollY = useRef(0);
  const manualOpen = useRef(false);
  const [sliderLoading, setSliderLoading] = useState<Record<number, boolean>>(
    {},
  );

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

  const sortCommentsByLatest = (comments?: Comment[]): Comment[] =>
    [...(comments ?? [])].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const renderSlide = ({ item, index }: { item: string; index: number }) => {
    const isLoading = sliderLoading[index] !== false;
    return (
      <View style={styles.slideTextCont}>
        <Image
          source={{ uri: item }}
          style={styles.image}
          onLoadStart={() =>
            setSliderLoading((prev) => ({ ...prev, [index]: true }))
          }
          onLoadEnd={() =>
            setSliderLoading((prev) => ({ ...prev, [index]: false }))
          }
        />
      </View>
    );
  };

  const handleBlogDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetchData<GetBlogByIdResponse>(
        `${ENDPOINTS.GetBlogById}/${blogId}`,
      );

      if (response?.data?.success) {
        const data = response.data.data;

        setBlogDetail({
          ...data,
          comments: sortCommentsByLatest(data.comments),
        });
        setIsLiked(response?.data?.data?.isLikedByUser);
        setHasNext(data?.commentsPagination?.hasNext || false);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlogComments = async (pageNumber: number) => {
    try {
      setCommentsLoading(true);

      const response = await fetchData<FetchBlogCommentsResponse>(
        `${ENDPOINTS.GetBlogComments}/${blogId}/comments?page=${pageNumber}&limit=10`,
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

  const handleLikeUnlike = async () => {
    try {
      const response = await postData<LikeUnlikeBlogResponse>(
        `${ENDPOINTS.LikeUnlikeBlog}/${blogId}/like`,
      );

      if (response?.data?.data?.action) {
        setIsLiked(response?.data?.data?.isLiked);
        setBlogDetail((prev) =>
          prev
            ? { ...prev, likesCount: response?.data?.data?.likesCount }
            : prev,
        );
      }
    } catch (error) {
      console.log("Like/Unlike error", error);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSendingComment(true);
      const response = await postData<AddCommentToBlogResponse>(
        `${ENDPOINTS.AddCommentToBlog}/${blogId}/comments`,
        { content: commentText.trim() },
      );

      if (response?.data?.data?.comments?.length) {
        setBlogDetail((prev): any =>
          prev
            ? {
                ...prev,
                comments: response?.data?.data?.comments,
                commentsCount: response?.data?.data?.pagination?.total,
              }
            : prev,
        );
        setComments(response?.data?.data?.comments as any);
        setCommentText("");
        commentInputRef.current?.blur();
      }
    } catch (error) {
      console.log("Add comment error", error);
    } finally {
      setSendingComment(false);
    }
  };

  const handleCommentIconPress = () => {
    manualOpen.current = true;
    setShowCommentInput(true);

    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  };

  const handleShare = async () => {
    if (sharing || !blogDetail) return;

    try {
      setSharing(true);

      const result = await Share.share({
        title: blogDetail.title,
        message: `${blogDetail.title}\n\n${blogDetail?.excerpt || ""}\n\n${
          blogDetail.coverPhotoUrl
        }`,
        url: blogDetail.coverPhotoUrl,
      });

      if (result.action === Share.sharedAction) {
        const response = await postData<ShareBlogResponse>(
          `${ENDPOINTS.ShareBlog}/${blogId}/share`,
          { platform: "WHATSAPP" },
        );

        if (response?.data?.success) {
          setBlogDetail((prev) =>
            prev ? { ...prev, sharesCount: prev.sharesCount + 1 } : prev,
          );
        }
      }
    } catch (error) {
      console.log("Share error", error);
    } finally {
      setSharing(false);
    }
  };

  useEffect(() => {
    handleBlogDetail();
  }, [blogId]);

  useEffect(() => {
    if (blogDetail?.comments) {
      setComments(blogDetail.comments);
      setPage(1);
      setHasNext(blogDetail?.commentsPagination?.hasNext || false);
    }
  }, [blogDetail]);

  useEffect(() => {
    if (blogDetail?.coverPhotoUrl) {
      setImageLoading(true);
    }
  }, [blogDetail?.coverPhotoUrl]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.darkText} />
      </View>
    );
  }

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={{ width: "100%", gap: verticalScale(2) }}>
        <CustomText
          fontFamily="GabaritoMedium"
          fontSize={15}
          color={COLORS.darkText}
        >
          # {item?.user?.assignedNumber}
        </CustomText>

        <CustomText
          fontFamily="SourceSansRegular"
          fontSize={14}
          color={COLORS.darkText}
        >
          {item.content}
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

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FocusResetScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const currentY = e.nativeEvent.contentOffset.y;
            const isScrollingDown = currentY > lastScrollY.current;

            if (isScrollingDown && currentY > 250) {
              setShowCommentInput(true);
              manualOpen.current = false;
            }

            if (!isScrollingDown && currentY < 200 && !manualOpen.current) {
              setShowCommentInput(false);
            }

            lastScrollY.current = currentY;
          }}
        >
          {/* BACK */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              position: "absolute",
              top: verticalScale(70),
              left: horizontalScale(20),
              zIndex: 10,
              borderWidth: 2,
              borderColor: COLORS.white,
              borderRadius: 10,
            }}
            onPress={() => navigation.goBack()}
          >
            <CustomIcon Icon={ICONS.WhiteBackArrow} height={24} width={24} />
          </TouchableOpacity>

          {/* IMAGE */}
          <View>
            {imageLoading && (
              <View
                style={{
                  position: "absolute",
                  width: "100%",
                  height: hp(42.9),
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: COLORS.greyish,
                  zIndex: 1,
                }}
              >
                <ActivityIndicator size="small" color={COLORS.darkText} />
              </View>
            )}
            <Image
              source={{ uri: blogDetail?.coverPhotoUrl }}
              style={styles.updateImage}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
          </View>

          {/* HEADER */}
          <View
            style={{
              marginTop: verticalScale(27),
              paddingHorizontal: horizontalScale(20),
              gap: verticalScale(8),
            }}
          >
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={14}
              color={COLORS.appText}
            >
              {blogDetail?.publishMonthYear}
            </CustomText>

            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={32}
              color={COLORS.darkText}
            >
              {blogDetail?.title}
            </CustomText>
          </View>

          {/* CONTENT */}
          <View
            style={{
              marginTop: verticalScale(16),
              paddingHorizontal: horizontalScale(20),
              gap: verticalScale(12),
            }}
          >
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={15}
              color={COLORS.darkText}
            >
              {blogDetail?.content}
            </CustomText>

            <View style={{ alignItems: "center" }}>
              <FlatList
                data={blogDetail?.photos || []}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => item + index}
                renderItem={renderSlide}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x /
                      Dimensions.get("window").width,
                  );
                  setActiveIndex(index);
                }}
              />

              {/* DOTS */}
              <View style={styles.dots}>
                {blogDetail?.photos?.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, activeIndex === i && styles.activeDot]}
                  />
                ))}
              </View>
            </View>

            {/* ACTIONS */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: horizontalScale(12),
                borderBottomWidth: 1,
                borderBottomColor: COLORS.greyish,
                paddingVertical: verticalScale(12),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: horizontalScale(4),
                }}
              >
                <TouchableOpacity onPress={handleLikeUnlike}>
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
                  {blogDetail?.likesCount}
                </CustomText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: horizontalScale(4),
                }}
              >
                <TouchableOpacity onPress={handleCommentIconPress}>
                  <CustomIcon Icon={ICONS.chatIcon} height={24} width={24} />
                </TouchableOpacity>

                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={16}
                  color={COLORS.appText}
                >
                  {blogDetail?.commentsCount}
                </CustomText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: horizontalScale(4),
                }}
              >
                <TouchableOpacity onPress={handleShare}>
                  <CustomIcon Icon={ICONS.shareIcon} height={24} width={24} />
                </TouchableOpacity>
              </View>
            </View>

            {/* COMMENTS */}
            <View
              style={{ borderBottomWidth: 1, borderColor: COLORS.greyish }}
            />
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
                onPress={() => fetchBlogComments(page + 1)}
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
        {showCommentInput && (
          <>
            <View
              style={{ borderBottomWidth: 1, borderColor: COLORS.greyish }}
            />
            <View style={styles.commentInputRow}>
              <CustomIcon
                Icon={ICONS.GreyUserIcon}
                height={verticalScale(40)}
                width={horizontalScale(40)}
              />
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
                  disabled={sendingComment}
                >
                  {sendingComment ? (
                    <ActivityIndicator size="small" color="#4c80f2" />
                  ) : (
                    <CustomText
                      fontFamily="GabaritoSemiBold"
                      fontSize={16}
                      color="#4c80f2"
                    >
                      Send
                    </CustomText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default UpdateDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  safeArea: {
    flex: 1,
    paddingTop: verticalScale(20),
  },
  keyboardView: {
    flex: 1,
  },
  updateImage: {
    width: "100%",
    height: hp(42.9),
  },
  scrollContent: {
    paddingBottom: verticalScale(16),
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
    gap: horizontalScale(8),
  },
  commentInputWrapper: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 0,
    borderColor: COLORS.greyish,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentInput: {
    fontFamily: FONTS.SourceSansRegular,
    fontSize: 14,
    color: COLORS.darkText,
    paddingVertical: verticalScale(5),
    flex: 1,
  },
  commentsList: {
    paddingBottom: verticalScale(8),
  },
  commentItem: {
    paddingVertical: verticalScale(12),
    flexDirection: "row",
    alignItems: "flex-start",
    gap: horizontalScale(12),
  },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(4),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  card: {
    width: wp(86),
    height: hp(44),
    borderRadius: 20,
    overflow: "hidden",
  },
  slideTextCont: {
    gap: verticalScale(10),
    alignItems: "center",
    width: wp(100) - verticalScale(40),
  },
  image: {
    width: wp(100) - verticalScale(40),
    height: hp(44),
    resizeMode: "cover",
    borderRadius: 20,
  },
  dots: {
    flexDirection: "row",
    marginTop: verticalScale(10),
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(12),
  },
  dot: {
    width: horizontalScale(7),
    height: verticalScale(7),
    borderRadius: 4,
    backgroundColor: COLORS.greyish,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.darkText,
    width: horizontalScale(7),
    height: verticalScale(7),
    borderRadius: 4,
  },
  sliderLoader: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.greyish,
    zIndex: 1,
    borderRadius: 20,
  },
});
