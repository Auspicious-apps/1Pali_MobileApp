import React, { FC, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import RNFS from "react-native-fs";
import IMAGES from "../../assets/Images";
import ShareArtModal, { ShareType } from "../../components/Modal/ShareArtModal";
import ShareLib from "react-native-share";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

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
   const lastTap = useRef<number>(0);
   const likeScale = useRef(new Animated.Value(0)).current;
   const likeRequestInProgress = useRef(false);
  const [OpenModal, setOpenModal] = useState(false);

  const UpdateDetailShimmer = () => (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: horizontalScale(20), gap: 16 }}>
        {/* Cover image */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{
            width: "100%",
            height: hp(42.9),
            borderRadius: 12,
          }}
        />

        {/* Title */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: "60%", height: 16, borderRadius: 6 }}
        />

        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: "80%", height: 28, borderRadius: 8 }}
        />

        {/* Paragraph */}
        {[1, 2, 3].map((i) => (
          <ShimmerPlaceholder
            key={i}
            LinearGradient={LinearGradient}
            style={{
              width: "100%",
              height: 14,
              borderRadius: 6,
            }}
          />
        ))}
      </View>
    </SafeAreaView>
  );

  const MediaShimmer = () => (
    <View style={styles.mediaShimmerContainer}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={styles.mediaShimmer}
      />
    </View>
  );


  const prepareMedia = async () => {
    if (!blogDetail?.coverPhotoUrl) return null;

    let uri = blogDetail.coverPhotoUrl;

    if (!uri.startsWith("http")) return uri;

    try {
      const extension = uri.includes(".png") ? ".png" : ".jpg";
      const path = `${RNFS.CachesDirectoryPath}/blog-${blogId}${extension}`;

      const exists = await RNFS.exists(path);

      if (!exists) {
        await RNFS.downloadFile({
          fromUrl: uri,
          toFile: path,
        }).promise;
      }

      return "file://" + path;
    } catch (e) {
      console.log("Media prep failed:", e);
      return uri; // fallback to remote URL
    }
  };

  const shareToApp = async (platform: ShareType) => {
    if (!blogDetail) return;

    try {
      setSharing(true);

      const uri = await prepareMedia();
      if (!uri) return;

      const baseOptions = {
        url: uri,
        message: blogDetail.title || "",
        type: "image/jpeg",
      };

      if (platform === "more" || platform === "message") {
        await ShareLib.open(baseOptions);
      } else {
        const socialMap = {
          instagram: ShareLib.Social.INSTAGRAM,
          facebook: ShareLib.Social.FACEBOOK,
          whatsapp: ShareLib.Social.WHATSAPP,
        };

        await ShareLib.shareSingle({
          ...baseOptions,
          social: socialMap[platform],
        });
      }
      const response = await postData<ShareBlogResponse>(
        `${ENDPOINTS.ShareBlog}/${blogId}/share`,
        { platform },
      );

      if (response?.data?.success) {
        setBlogDetail((prev) =>
          prev
            ? {
                ...prev,
                sharesCount: response.data.data.sharesCount,
              }
            : prev,
        );
      }
    } catch (err: any) {
      if (!err?.message?.includes("cancel")) {
        console.log("Share failed:", err);
      }
    } finally {
      setSharing(false);
    }
  };

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
    const nextLiked = !isLiked;

    setIsLiked(nextLiked);
    setBlogDetail((prev) =>
      prev
        ? {
            ...prev,
            likesCount: prev.likesCount + (nextLiked ? 1 : -1),
          }
        : prev,
    );

    if (likeRequestInProgress.current) return;

    likeRequestInProgress.current = true;

    try {
      await postData<LikeUnlikeBlogResponse>(
        `${ENDPOINTS.LikeUnlikeBlog}/${blogId}/like`,
      );
    } catch (error) {
      setIsLiked(!nextLiked);
      setBlogDetail((prev) =>
        prev
          ? {
              ...prev,
              likesCount: prev.likesCount + (nextLiked ? -1 : 1),
            }
          : prev,
      );
      console.log("Like/Unlike error", error);
    } finally {
      likeRequestInProgress.current = false;
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

    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (!isLiked) {
        handleLikeUnlike();
        triggerLikeAnimation();
      }
    }

    lastTap.current = now;
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

  // const handleShare = async () => {
  //   if (sharing || !blogDetail) return;

  //   try {
  //     setSharing(true);

  //     const result = await Share.share({
  //       title: blogDetail.title,
  //       message: `${blogDetail.title}\n\n${blogDetail?.excerpt || ""}\n\n${
  //         blogDetail.coverPhotoUrl
  //       }`,
  //       url: blogDetail.coverPhotoUrl,
  //     });

  //     if (result.action === Share.sharedAction) {
  //       const response = await postData<ShareBlogResponse>(
  //         `${ENDPOINTS.ShareBlog}/${blogId}/share`,
  //         { platform: "WHATSAPP" },
  //       );

  //       if (response?.data?.success) {
  //         setBlogDetail((prev) =>
  //           prev ? { ...prev, sharesCount: prev.sharesCount + 1 } : prev,
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     console.log("Share error", error);
  //   } finally {
  //     setSharing(false);
  //   }
  // };
  const handleShare = async () => {
    if (sharing || !blogDetail) return;

    try {
      setSharing(true);

      let shareUrl = blogDetail.coverPhotoUrl;
      let localFilePath: string | undefined;

      // If it's a remote URL → download to cache folder (increases chance Instagram offers Story)
      if (blogDetail.coverPhotoUrl?.startsWith("http")) {
        const extension = blogDetail.coverPhotoUrl.includes(".png")
          ? "png"
          : "jpg";
        const fileName = `blog-${blogId}.${extension}`;
        localFilePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

        // Check if already downloaded (avoid re-download every time)
        const fileExists = await RNFS.exists(localFilePath);

        if (!fileExists) {
          await RNFS.downloadFile({
            fromUrl: blogDetail.coverPhotoUrl,
            toFile: localFilePath,
          }).promise;
        }

        shareUrl = `file://${localFilePath}`; // important: file:// prefix for local sharing
      }

      const result = await Share.share({
        title: blogDetail.title,
        message: `${blogDetail.title}\n\n${
          blogDetail?.excerpt || ""
        }\n\nRead more: ${blogDetail.coverPhotoUrl || ""}`,
        url: shareUrl,
      });

      if (result.action === Share.sharedAction) {
        // Optional: increment share count on backend
        // You can try to make platform more generic since we don't know exact app chosen
        const response = await postData<ShareBlogResponse>(
          `${ENDPOINTS.ShareBlog}/${blogId}/share`,
          { platform: "APP_SHARE_SHEET" }, // or keep "WHATSAPP" if you want – but it's not accurate anymore
        );

        if (response?.data?.success) {
          setBlogDetail((prev) =>
            prev ? { ...prev, sharesCount: (prev.sharesCount || 0) + 1 } : prev,
          );
        }
      }
    } catch (error: any) {
      console.log("Share error:", error);
      // Optional: show toast/alert if not canceled by user
      if (!error?.message?.includes("canceled")) {
        // You can add Alert.alert here if you import Alert
      }
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
    return <UpdateDetailShimmer />;
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
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
              top:
                Platform.OS === "android"
                  ? verticalScale(20)
                  : verticalScale(60),
              left: horizontalScale(20),
              zIndex: 10,
            }}
            onPress={() => navigation.goBack()}
          >
            <CustomIcon Icon={ICONS.WhiteBackArrow} height={26} width={26} />
          </TouchableOpacity>

          {/* IMAGE */}
          <TouchableWithoutFeedback onPress={handleImageDoubleTap}>
            <View>
              {imageLoading && <MediaShimmer />}
              <Image
                source={{ uri: blogDetail?.coverPhotoUrl }}
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
                contentContainerStyle={{
                  gap: horizontalScale(1),
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
                borderBottomWidth: 1,
                borderBottomColor: COLORS.greyish,
                paddingVertical: verticalScale(12),
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: horizontalScale(12),
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
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setOpenModal(true);
                }}
                style={styles.ShareButton}
                disabled={sharing}
              >
                {/* <CustomIcon
                  Icon={ICONS.NavigationIcon}
                  height={24}
                  width={24}
                /> */}
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={16}
                  color={COLORS.greyish}
                >
                  Share Updates
                </CustomText>
              </TouchableOpacity>
            </View>

            {/* COMMENTS */}
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderCommentItem}
              scrollEnabled={false}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                !commentsLoading ? (
                  <CustomText
                    fontFamily="SourceSansMedium"
                    fontSize={16}
                    color={COLORS.appText}
                    style={{ textAlign: "center", marginVertical: 12 }}
                  >
                    No comments yet
                  </CustomText>
                ) : null
              }
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
        </ScrollView>
        {showCommentInput && (
          <>
            <View
              style={{ borderBottomWidth: 1, borderColor: COLORS.greyish }}
            />
            <View
              style={[
                styles.commentInputRow,
                Platform.OS === "android" &&
                  Platform.Version > 33 && {
                    paddingBottom: verticalScale(24),
                  },
              ]}
            >
              <CustomIcon
                Icon={ICONS.SimpleUserIcon}
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
                    <ActivityIndicator size="small" color={COLORS.darkText} />
                  ) : (
                    <CustomIcon Icon={ICONS.sendIcon} height={24} width={42} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
      <ShareArtModal
        visible={OpenModal}
        onClose={() => setOpenModal(false)}
        onShare={shareToApp}
        mediaUrl={blogDetail?.coverPhotoUrl}
      />
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
    paddingLeft: horizontalScale(12),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.light,
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
    width: wp(96) - verticalScale(42),
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
  likeOverlay: {
    position: "absolute",
    top: "30%",
    left: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  ShareButton: {
    backgroundColor: COLORS.darkText,
    paddingHorizontal: horizontalScale(12),
    paddingVertical: horizontalScale(8),
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(3),
  },
  mediaShimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 5,
  },
  mediaShimmer: {
    width: "100%",
    height: "100%",
  },
});
