import React, { FC, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import RNFS from "react-native-fs";
import LinearGradient from "react-native-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ShareLib from "react-native-share";
import FONTS from "../../assets/fonts";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import Pulse from "../../components/PulseLoading";
import {
  fetchBlogDetails,
  updateBlogDetail,
} from "../../redux/slices/DetailsSlice";
import { useAppDispatch } from "../../redux/store";
import ENDPOINTS from "../../service/ApiEndpoints";
import { AddCommentToBlogResponse } from "../../service/ApiResponses/AddCommentToBlog";
import { FetchBlogCommentsResponse } from "../../service/ApiResponses/FetchBlogComments";
import {
  Comment,
  GetBlogByIdResponse,
} from "../../service/ApiResponses/GetBlogById";
import { LikeUnlikeBlogResponse } from "../../service/ApiResponses/LikeUnlikeResponse";
import { fetchData, postData } from "../../service/ApiService";
import { UpdateDetailScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const UpdateDetail: FC<UpdateDetailScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

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
  const manualOpen = useRef(false);
  const [sliderLoading, setSliderLoading] = useState<Record<number, boolean>>(
    {},
  );
  const lastTap = useRef<number>(0);
  const likeScale = useRef(new Animated.Value(0)).current;
  const likeRequestInProgress = useRef(false);
  const [isKeyboardVisible, setisKeyboardVisible] = useState(false);
  const scrollRef = useRef<any>(null);
  const commentsSectionRef = useRef<View>(null);
  const [sliderWidth, setSliderWidth] = useState(0);

  const UpdateDetailSkeleton = () => (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: horizontalScale(20), gap: 16 }}>
        <Pulse
          style={{
            width: "100%",
            height: hp(42.9),
            borderRadius: 12,
          }}
        />

        <Pulse style={{ width: "60%", height: 16, borderRadius: 6 }} />
        <Pulse style={{ width: "80%", height: 28, borderRadius: 8 }} />

        {[1, 2, 3].map((i) => (
          <Pulse
            key={i}
            style={{ width: "100%", height: 14, borderRadius: 6 }}
          />
        ))}
      </View>
    </SafeAreaView>
  );

  const MediaSkeleton = () => (
    <View style={styles.mediaShimmerContainer}>
      <Pulse style={styles.mediaShimmer} />
    </View>
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

  const handleBlogDetail = async () => {
    try {
      setIsLoading(true);
      const result = await dispatch(
        fetchBlogDetails({ blogId: blogId, forceRefresh: false }),
      ).unwrap();

      if (result) {
        const data = result.data;

        setBlogDetail({
          ...data,
          comments: sortCommentsByLatest(data.comments),
        });
        setIsLiked(data.isLikedByUser);
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

    if (nextLiked) {
      triggerLikeAnimation();
    }
    setIsLiked(nextLiked);
    setBlogDetail((prev) => {
      const updated = prev
        ? {
            ...prev,
            likesCount: prev.likesCount + (nextLiked ? 1 : -1),
          }
        : prev;
      // Update Redux cache
      if (updated) {
        dispatch(updateBlogDetail({ blogId: blogId, data: updated }));
      }
      return updated;
    });

    if (likeRequestInProgress.current) return;

    likeRequestInProgress.current = true;

    try {
      await postData<LikeUnlikeBlogResponse>(
        `${ENDPOINTS.LikeUnlikeBlog}/${blogId}/like`,
      );
    } catch (error) {
      setIsLiked(!nextLiked);
      setBlogDetail((prev) => {
        const updated = prev
          ? {
              ...prev,
              likesCount: prev.likesCount + (nextLiked ? -1 : 1),
            }
          : prev;
        // Update Redux cache on error rollback
        if (updated) {
          dispatch(updateBlogDetail({ blogId: blogId, data: updated }));
        }
        return updated;
      });
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
        setBlogDetail((prev): any => {
          const updated = prev
            ? {
                ...prev,
                comments: response?.data?.data?.comments,
                commentsCount: response?.data?.data?.pagination?.total,
              }
            : prev;
          // Update Redux cache
          if (updated) {
            dispatch(updateBlogDetail({ blogId: blogId, data: updated }));
          }
          return updated;
        });
        setComments(response?.data?.data?.comments as any);
      }

      // Always clear the input and blur after sending
      setCommentText("");
      commentInputRef.current?.blur();
    } catch (error) {
      console.log("Add comment error", error);
    } finally {
      setSendingComment(false);
    }
  };

  // const handleCommentIconPress = () => {
  //   manualOpen.current = true;
  //   setShowCommentInput(true);

  //   setTimeout(() => {
  //     commentInputRef.current?.focus();
  //   }, 100);
  // };
  const handleCommentIconPress = () => {
    manualOpen.current = true;
    setShowCommentInput(true);

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!commentsSectionRef.current || !scrollRef.current) {
          commentInputRef.current?.focus();
          return;
        }

        commentsSectionRef.current.measureLayout(
          scrollRef.current,
          (x, y) => {
            scrollRef.current?.scrollTo({
              y: Math.max(0, y - verticalScale(20)),
              animated: true,
            });

            setTimeout(() => {
              commentInputRef.current?.focus();
            }, 400);
          },
          () => {
            commentInputRef.current?.focus();
          },
        );
      }, 200);
    });
  };

  const handleShare = async () => {
    if (sharing || !blogDetail) return;

    const { title, excerpt, coverPhotoUrl } = blogDetail;
    try {
      // Generate unique filename
      const fileName = `onepali-share-${Date.now()}.jpg`;
      const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      // 1. Download image from remote URL to cache
      const downloadResult = await RNFS.downloadFile({
        fromUrl: coverPhotoUrl,
        toFile: destPath,
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error("Download failed");
      }

      // 3. Share directly to app
      await ShareLib.open({
        url: `file://${destPath}`,
        message: title,
      });
    } catch (error) {
      console.log(`Share error:`, error);
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

  useEffect(() => {
    // iOS: Smooth animations
    if (Platform.OS === "ios") {
      Keyboard.addListener("keyboardWillShow", () =>
        setisKeyboardVisible(true),
      );
      Keyboard.addListener("keyboardWillHide", () =>
        setisKeyboardVisible(false),
      );
    }
    // Android: Immediate response
    else {
      Keyboard.addListener("keyboardDidShow", () => setisKeyboardVisible(true));
      Keyboard.addListener("keyboardDidHide", () =>
        setisKeyboardVisible(false),
      );
    }
  }, []);

  if (isLoading) {
    return <UpdateDetailSkeleton />;
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
      {/* <SafeAreaView
        style={[
          styles.safeArea,
          {
            paddingBottom: Platform.select({
              android: insets.bottom,
              ios: verticalScale(15),
            }),
          },
        ]}
        edges={["top"]}
      > */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          position: "absolute",
          top:
            Platform.OS === "android"
              ? verticalScale(20) + insets.top
              : verticalScale(60),
          left: horizontalScale(20),
          zIndex: 10,
          borderRadius: 100,
          height: 32,
          width: 32,
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.7,
        }}
        onPress={() => navigation.goBack()}
      >
        <CustomIcon Icon={ICONS.WhiteBack} height={32} width={32} />
      </TouchableOpacity>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "height"
            : Number(Platform.Version) > 33
            ? "height"
            : "padding"
        }
        keyboardVerticalOffset={
          isKeyboardVisible
            ? 0
            : Platform.select({
                android: Number(Platform.Version) > 33 ? verticalScale(-30) : 0,
                ios: 0,
              })
        }
      >
        <FocusResetScrollView
          ref={scrollRef}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="never"
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingBottom: verticalScale(100),
          }}
          // onScroll={(e) => {
          //   const currentY = e.nativeEvent.contentOffset.y;
          //   const isScrollingDown = currentY > lastScrollY.current;

          //   if (isScrollingDown && currentY > 250) {
          //     setShowCommentInput(true);
          //     manualOpen.current = false;
          //   }

          //   if (!isScrollingDown && currentY < 200 && !manualOpen.current) {
          //     setShowCommentInput(false);
          //   }

          //   lastScrollY.current = currentY;
          // }}
        >
          {/* IMAGE */}
          <TouchableWithoutFeedback onPress={handleImageDoubleTap}>
            <View>
              {imageLoading && <MediaSkeleton />}
              <FastImage
                source={{ uri: blogDetail?.coverPhotoUrl }}
                style={styles.updateImage}
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
                <FastImage
                  source={IMAGES.ImageLike}
                  style={{
                    width: horizontalScale(99),
                    height: verticalScale(87),
                  }}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Bottom overlay stats  */}
              <View style={styles.bottomOverlay}>
                <TouchableOpacity
                  style={styles.statPill}
                  onPress={handleLikeUnlike}
                  activeOpacity={0.7}
                >
                  <CustomIcon
                    Icon={isLiked ? ICONS.LikedIcon : ICONS.OnimageLike}
                    height={20}
                    width={20}
                  />
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={16}
                    color={COLORS.appBackground}
                    style={{ marginLeft: 6 }}
                  >
                    {blogDetail?.likesCount ?? 24}
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.statPill}
                  onPress={handleCommentIconPress}
                  activeOpacity={0.7}
                >
                  <CustomIcon Icon={ICONS.OnimageChat} height={20} width={20} />
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={16}
                    color={COLORS.appBackground}
                    style={{ marginLeft: 6 }}
                  >
                    {blogDetail?.commentsCount ?? 6}
                  </CustomText>
                </TouchableOpacity>
              </View>
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
              fontSize={16}
              color={COLORS.darkText}
            >
              {blogDetail?.content}
            </CustomText>

            <View
              style={{ width: "100%", alignItems: "center" }}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                if (w !== sliderWidth) {
                  setSliderWidth(w);
                }
              }}
            >
              {sliderWidth > 0 && (
                <FlatList
                  data={blogDetail?.photos || []}
                  bounces={false}
                  horizontal
                  pagingEnabled
                  snapToInterval={sliderWidth}
                  snapToAlignment="center"
                  decelerationRate="normal"
                  disableIntervalMomentum={true}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({ item, index }) => (
                    <View style={{ width: sliderWidth, alignItems: "center" }}>
                      <FastImage
                        source={{ uri: item }}
                        style={[
                          styles.image,
                          { width: sliderWidth - horizontalScale(5) },
                        ]}
                      />
                    </View>
                  )}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(
                      e.nativeEvent.contentOffset.x / sliderWidth,
                    );
                    setActiveIndex(index);
                  }}
                  contentContainerStyle={{ alignItems: "flex-start" }}
                />
              )}

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
              {/* <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleShare}
                  style={styles.ShareButton}
                  disabled={sharing}
                >
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={16}
                    color={COLORS.greyish}
                  >
                    Share Update
                  </CustomText>
                </TouchableOpacity> */}
            </View>

            <View ref={commentsSectionRef}>
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
            </View>
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
        <View pointerEvents="none" style={styles.bottomFadeWrapper}>
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.4)",
              "rgba(255,255,255,0.85)",
              "rgba(255,255,255,1)",
            ]}
            locations={[0, 0.35, 0.75, 1]}
            style={styles.bottomFade}
          />
        </View>
        {/* {showCommentInput && (
            <> */}
        <View
          style={styles.bottomContainer}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
          }}
        >
          <View style={styles.commentInputRow}>
            <CustomIcon
              Icon={ICONS.changedUser}
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
                multiline
                textAlignVertical="top"
                style={styles.commentInput}
              />

              {commentText.trim().length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSendComment}
                  disabled={sendingComment}
                >
                  {sendingComment ? (
                    <ActivityIndicator size="small" color={COLORS.darkText} />
                  ) : (
                    <CustomIcon
                      Icon={ICONS.DarkSendIcon}
                      height={24}
                      width={24}
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {/* </>
          )} */}
      </KeyboardAvoidingView>
      {/* </SafeAreaView> */}
    </View>
  );
};

export default UpdateDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingBottom: verticalScale(10),
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  updateImage: {
    width: "100%",
    height: hp(42.9),
  },
  scrollContent: {},
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    // borderBottomWidth: 1,
    // borderBottomColor: COLORS.greyish,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
    gap: horizontalScale(8),
  },
  commentInputWrapper: {
    flex: 1,
    borderRadius: 32,
    borderWidth: 0,
    borderColor: COLORS.greyish,
    paddingLeft: horizontalScale(16),
    paddingRight: horizontalScale(8),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.commentBar,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentInput: {
    fontFamily: FONTS.GabaritoRegular,
    fontSize: 14,
    color: COLORS.darkText,
    paddingVertical: verticalScale(5),
    flex: 1,
    maxHeight: verticalScale(80),
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
  },
  image: {
    height: hp(44),
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
  bottomOverlay: {
    position: "absolute",
    bottom: verticalScale(9),
    right: horizontalScale(11),
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: horizontalScale(6),
  },

  statPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-end",
    backgroundColor: COLORS.white,
    zIndex: 10,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: verticalScale(40),
  },
  bottomFadeWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: verticalScale(50),
    height: verticalScale(50),
    zIndex: 5,
  },

  bottomFade: {
    width: "100%",
    height: "100%",
  },
});
