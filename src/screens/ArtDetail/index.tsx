import React, { FC, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import FastImage from "react-native-fast-image";
import RNFS from "react-native-fs";
import ImageViewer from "react-native-image-zoom-viewer";
import LinearGradient from "react-native-linear-gradient";
import Modal from "react-native-modal";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ShareLib from "react-native-share";
import Toast from "react-native-toast-message";
import Video from "react-native-video";
import ViewShot, { captureRef } from "react-native-view-shot";
import FONTS from "../../assets/fonts";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import { ShareType } from "../../components/Modal/ShareArtModal";
import PrimaryButton from "../../components/PrimaryButton";
import Pulse from "../../components/PulseLoading";
import { addNewArtBadge } from "../../redux/slices/UserSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
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
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";
import { BlurView } from "@react-native-community/blur";

const ArtDetail: FC<ArtDetailScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
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
  const [sendingComment, setSendingComment] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const commentsSectionY = useRef(0);
  const lastScrollY = useRef(0);
  const manualOpen = useRef(false);
  const likeRequestInProgress = useRef(false);
  const pendingLikeState = useRef<boolean | null>(null);
  const [OpenModal, setOpenModal] = useState(false);
  const [uiIndex, setUiIndex] = useState(0);
  const mediaLoadedRef = useRef(false);
  const [isKeyboardVisible, setisKeyboardVisible] = useState(false);
  const [isDownloadingArt, setIsDownloadingArt] = useState(false);
  const [isMediaFullscreen, setIsMediaFullscreen] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const openAnim = useRef(new Animated.Value(0)).current;
  const [capturingCard, setCapturingCard] = useState(false);
  const { user } = useAppSelector((state) => state.user);
  const cardRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(50);

  const ArtDetailPulse = () => (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: horizontalScale(20), gap: 16 }}>
        <Pulse style={{ width: "100%", height: hp(49), borderRadius: 20 }} />

        <View style={{ flexDirection: "row", gap: 16 }}>
          <Pulse style={{ width: 60, height: 20, borderRadius: 6 }} />
          <Pulse style={{ width: 60, height: 20, borderRadius: 6 }} />
        </View>

        <Pulse style={{ width: "70%", height: 28, borderRadius: 8 }} />

        {[1, 2, 3].map((_, i) => (
          <Pulse
            key={i}
            style={{ width: "100%", height: 14, borderRadius: 6 }}
          />
        ))}
      </View>
    </SafeAreaView>
  );

  const CommentPulse = () => (
    <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
      <Pulse style={{ width: "30%", height: 14, borderRadius: 6 }} />
      <Pulse
        style={{
          width: "100%",
          height: 14,
          borderRadius: 6,
          marginTop: 6,
        }}
      />
    </View>
  );

  const handleShareToMore = async () => {
    try {
      setCapturingCard(true);

      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 0.9,
      });

      // 1. Define your custom file name
      const customFileName = artDetail?.title || "Art";
      const fileNameWithExt = `${customFileName}.png`;

      // 2. Prepare the new path in the Cache directory
      // This works for both iOS and Android to ensure the file system sees the name
      const newPath = `${RNFS.CachesDirectoryPath}/${fileNameWithExt}`;

      // 3. Move/Copy the captured image to the new path with the custom name
      if (await RNFS.exists(newPath)) {
        await RNFS.unlink(newPath); // Clean up if it exists
      }
      await RNFS.copyFile(uri, newPath);

      const shareFilePath =
        Platform.OS === "android" ? `file://${newPath}` : newPath;

      setCapturingCard(false);

      await ShareLib.open({
        url: shareFilePath,
        // For iOS: This sets the display name in the share sheet
        filename: customFileName,
        // For Android: This helps some apps identify the title
        title: customFileName,
        type: "image/png",
        message: `Check out this artwork from OnePali! Supporter #${user?.assignedNumber}`,
      });

      await shareToApp("APP_SHARE_SHEET");
    } catch (error: any) {
      if (error?.message?.includes("User did not share")) {
        console.log("User cancelled sharing");
      } else {
        console.log("Card share error:", error);
      }
    } finally {
      setCapturingCard(false);
    }
  };
  const shareToApp = async (platform: ShareType) => {
    try {
      setSharing(true);
      const response = await postData<ShareArtResponse>(
        `${ENDPOINTS.ShareArt}/${ArtId}/share`,
        {
          platform,
        },
      );

      if (response?.data?.success) {
        setArtDetail((prev) =>
          prev
            ? { ...prev, sharesCount: response.data.data.sharesCount }
            : prev,
        );
        if (response.data.data.newBadges?.length) {
          dispatch(addNewArtBadge(response.data.data.newBadges as any));
        }
      }
    } catch (err) {
      console.log("Share Count failed:", err);
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadImage = async (url: string, artId: string) => {
    if (!url) return;

    try {
      setIsDownloadingArt(true);
      const { fs, config } = ReactNativeBlobUtil;

      // Determine file extension from URL
      const urlPath = url.split("?")[0];
      const extension = urlPath.includes(".png") ? "png" : "jpg";

      const fileName = `Art_${artId}.${extension}`;

      // For Android, use cache directory first, then move to Downloads
      // For iOS, use Documents directory
      const tempPath = `${fs.dirs.CacheDir}/${fileName}`;
      const finalPath =
        Platform.OS === "android"
          ? `${fs.dirs.DownloadDir}/${fileName}`
          : `${fs.dirs.DocumentDir}/${fileName}`;

      const options = Platform.select({
        ios: {
          fileCache: true,
          path: finalPath,
        },
        android: {
          fileCache: true,
          path: tempPath,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            title: fileName,
            description: "Downloading Art...",
            mime: `image/${extension}`,
            path: finalPath, // ReactNativeBlobUtil attempts to save directly here
          },
        },
      });

      const res = await config(options as any).fetch("GET", url);
      const filePath = res.path();

      if (Platform.OS === "ios") {
        // For iOS, show the file in Files app or preview
        ReactNativeBlobUtil.ios.previewDocument(filePath);
      } else {
        await fs.scanFile([{ path: filePath, mime: `image/${extension}` }]);

        Toast.show({
          type: "success",
          text1: "Download Complete",
          text2: "Art saved to Downloads folder",
        });

        // Optional: Open the file immediately
        setTimeout(() => {
          ReactNativeBlobUtil.android.actionViewIntent(
            filePath,
            `image/${extension}`,
          );
        }, 500);

        return;
      }
    } catch (error) {
      console.error("Download failed:", error);
      Toast.show({
        type: "error",
        text1: "Download Failed",
        text2: "Unable to download image. Please try again.",
      });
    } finally {
      setIsDownloadingArt(false);
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
      setSendingComment(true);
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

  const handleLikeUnlike = async () => {
    setIsLiked((prevLiked) => {
      const nextLiked = !prevLiked;

      setArtDetail((prev) =>
        prev
          ? {
              ...prev,
              likesCount: prev.likesCount + (nextLiked ? 1 : -1),
            }
          : prev,
      );

      pendingLikeState.current = nextLiked;
      return nextLiked;
    });

    if (likeRequestInProgress.current) return;

    likeRequestInProgress.current = true;

    try {
      while (pendingLikeState.current !== null) {
        const desiredState = pendingLikeState.current;
        pendingLikeState.current = null;

        await postData<LikeUnlikeArtResponse>(
          `${ENDPOINTS.LikeUnlikeArt}/${ArtId}/like`,
        );
      }
    } catch (error) {
      // optional rollback — or refetch count
      console.log("Like sync error", error);
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

  const handleImageTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 250;

    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (!isLiked && !likeRequestInProgress.current) {
        handleLikeUnlike();
        triggerLikeAnimation();
      }
    } else {
      setTimeout(() => {
        if (Date.now() - lastTap.current >= DOUBLE_PRESS_DELAY) {
          setIsMediaFullscreen(true);
        }
      }, DOUBLE_PRESS_DELAY);
    }

    lastTap.current = now;
  };

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={{ width: "100%", gap: verticalScale(2) }}>
        <CustomText
          fontFamily="GabaritoMedium"
          fontSize={15}
          color={COLORS.darkText}
        >
          #
          {item?.user?.assignedNumber
            ? item?.user?.assignedNumber
            : "onepali supporter"}
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

  useEffect(() => {
    setImageLoading(true);
    mediaLoadedRef.current = false;
  }, [artDetail?.mediaUrl]);

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

  // FULL SCREEN MEDIA
  useEffect(() => {
    if (isMediaFullscreen) {
      openAnim.setValue(0);
      Animated.timing(openAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      scale.setValue(1);
      lastScale.current = 1;
    }
  }, [isMediaFullscreen]);

  useEffect(() => {
    if (uiIndex === 1) {
      openAnim.setValue(0);

      Animated.timing(openAnim, {
        toValue: 1,
        duration: 260, // smoother
        useNativeDriver: true,
      }).start();
    } else {
      openAnim.setValue(0);
    }
  }, [uiIndex]);

  if (loading) {
    return <ArtDetailPulse />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView
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
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "height" : "height"}
          keyboardVerticalOffset={
            isKeyboardVisible
              ? 0
              : Platform.select({ android: verticalScale(-30), ios: 0 })
          }
        >
          <View
            style={[
              styles.header,
              {
                paddingTop: Platform.OS === "android" ? verticalScale(10) : 0,
              },
            ]}
          >
            <View style={styles.side}>
              <TouchableOpacity activeOpacity={0.8}>
                <CustomIcon
                  Icon={ICONS.backArrow}
                  height={30}
                  width={30}
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

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setUiIndex((prev) => (prev === 0 ? 1 : 0))}
            >
              <CustomIcon Icon={ICONS.fullScreen} width={24} height={24} />
            </TouchableOpacity>
          </View>
          <FocusResetScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="never"
            scrollEventThrottle={16}
            // onScroll={(e) => {
            //   const currentY = e.nativeEvent.contentOffset.y;
            //   const diff = currentY - lastScrollY.current;

            //   if (diff > 5) {
            //     setShowCommentInput(true);
            //     manualOpen.current = false;
            //   } else if (diff < -5 && !manualOpen.current) {
            //     setShowCommentInput(false);
            //   }

            //   lastScrollY.current = currentY;
            // }}
            contentContainerStyle={{
              paddingTop: verticalScale(20),
              paddingBottom: verticalScale(100),
            }}
          >
            <TouchableOpacity activeOpacity={0.8} onPress={handleImageTap}>
              <View style={styles.imageWrapper}>
                {artDetail?.mediaType === "IMAGE" && (
                  <>
                    <View style={styles.weekCard}>
                      <FastImage
                        source={{ uri: artDetail.mediaUrl }}
                        resizeMode="cover"
                        style={styles.updateImage}
                        onLoadStart={() => {
                          if (!mediaLoadedRef.current) {
                            setImageLoading(true);
                          }
                        }}
                        onLoadEnd={() => {
                          mediaLoadedRef.current = true;
                          setImageLoading(false);
                        }}
                      />
                    </View>
                  </>
                )}

                {/* VIDEO */}
                {artDetail?.mediaType === "VIDEO" && (
                  <View style={styles.mediaWrapper}>
                    {/* {imageLoading && <MediaPulse />} */}

                    <Video
                      source={{ uri: artDetail.mediaUrl }}
                      poster={artDetail.thumbnailUrl}
                      posterResizeMode="cover"
                      resizeMode="cover"
                      controls
                      repeat
                      style={{ width: "100%", height: "100%" }}
                      onLoadStart={() => {
                        if (!mediaLoadedRef.current) {
                          setImageLoading(true);
                        }
                      }}
                      onLoad={() => {
                        mediaLoadedRef.current = true;
                        setImageLoading(false);
                      }}
                      onError={(e) => console.log("Video error", e)}
                    />
                  </View>
                )}

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
              </View>
            </TouchableOpacity>
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
                paddingTop: verticalScale(12),
                paddingHorizontal: horizontalScale(20),
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
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                // onPress={() => {
                //   setOpenModal(true);
                // }}
                onPress={handleShareToMore}
                style={styles.ShareButton}
                disabled={sharing}
              >
                <CustomIcon Icon={ICONS.ShareArt} height={20} width={20} />
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={16}
                  color={COLORS.greyish}
                >
                  Share
                </CustomText>
              </TouchableOpacity>
            </View>
            <View
              style={{
                marginTop: verticalScale(16),
                paddingHorizontal: horizontalScale(20),
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
              onLayout={(e) => {
                commentsSectionY.current = e.nativeEvent.layout.y;
              }}
              style={{
                marginTop: verticalScale(16),
                paddingHorizontal: horizontalScale(20),
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
                style={{
                  borderBottomWidth: 1,
                  borderColor: COLORS.greyish,
                }}
              />

              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                renderItem={renderCommentItem}
                scrollEnabled={false}
                contentContainerStyle={styles.commentsList}
                ListEmptyComponent={
                  commentsLoading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <CommentPulse key={i} />
                      ))}
                    </>
                  ) : (
                    <CustomText
                      fontFamily="SourceSansMedium"
                      fontSize={16}
                      color={COLORS.appText}
                      style={{ textAlign: "center", marginVertical: 12 }}
                    >
                      No comments yet
                    </CustomText>
                  )
                }
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

          {/* ===== Bottom Fade Overlay ===== */}
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
              setInputHeight(h);
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

          {/* Hidden Share Card  */}
          <View
            style={{
              position: "absolute",
              left: -9999,
              top: -9999,
              opacity: 0,
            }}
          >
            <ViewShot ref={cardRef} options={{ format: "png", quality: 0.9 }}>
              <View style={styles.card}>
                {artDetail?.mediaType === "VIDEO" ? (
                  <View style={styles.mediaWrapper}>
                    <Video
                      source={{ uri: artDetail?.mediaUrl }}
                      posterResizeMode="cover"
                      resizeMode="cover"
                      repeat
                      style={styles.cardImage}
                    />
                  </View>
                ) : (
                  <FastImage
                    source={{ uri: artDetail?.mediaUrl }}
                    resizeMode="cover"
                    style={styles.cardImage}
                  />
                )}

                <View
                  style={{
                    paddingVertical: verticalScale(12),
                    paddingHorizontal: horizontalScale(8),
                    flexDirection: "row",
                    alignItems: "center",
                    gap: horizontalScale(8),
                  }}
                >
                  <Image
                    source={IMAGES.OnePaliLogo}
                    resizeMode="contain"
                    style={{
                      width: horizontalScale(24),
                      height: horizontalScale(24),
                    }}
                  />

                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={12}
                    color={COLORS.darkText}
                    style={{ width: "90%" }}
                  >
                    I’m supporter #{user?.assignedNumber} helping reach 1M
                    donors for humanitarian aid in Palestine. Every bit counts.
                    Join the movement at onepali.app
                  </CustomText>
                </View>
              </View>
            </ViewShot>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {uiIndex === 1 && (
        <Animated.View
          pointerEvents={uiIndex === 1 ? "auto" : "none"}
          style={[
            styles.fullscreenContainer,
            {
              opacity: openAnim,
              transform: [
                {
                  scale: openAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {/* ===== BLURRY BACKGROUND IMAGE ===== */}
          {!!artDetail?.mediaUrl && artDetail?.mediaType !== "VIDEO" && (
            <Image
              source={{ uri: artDetail.mediaUrl }}
              blurRadius={15}
              resizeMode="cover"
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* ===== OPTIONAL DARK OVERLAY (premium look) ===== */}
          <View style={styles.blurOverlay} />

          {/* ===== CLOSE BUTTON ===== */}
          <TouchableOpacity
            onPress={() => setUiIndex(0)}
            style={styles.closeBtn}
            activeOpacity={0.8}
          >
            <CustomIcon Icon={ICONS.WhiteCloseIcon} width={32} height={32} />
          </TouchableOpacity>

          {/* ===== MAIN MEDIA ===== */}
          {artDetail?.mediaType === "VIDEO" ? (
            <Video
              source={{ uri: artDetail?.mediaUrl }}
              resizeMode="contain"
              controls
              repeat
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <ImageViewer
              imageUrls={[{ url: artDetail?.mediaUrl || "" }]}
              backgroundColor="transparent"
              enableSwipeDown
              onSwipeDown={() => setUiIndex(0)}
              renderIndicator={() => <></>}
              saveToLocalByLongPress={false}
            />
          )}

          {/* ===== SHARE BUTTON ===== */}
          <PrimaryButton
            title={"Share"}
            leftIcon={{
              Icon: ICONS.DarkUpload,
              height: 20,
              width: 20,
            }}
            onPress={handleShareToMore}
            style={styles.shareBtn}
            textColor={COLORS.darkText}
          />
        </Animated.View>
      )}

      <Modal
        isVisible={isMediaFullscreen}
        style={{ margin: 0 }}
        backdropOpacity={1}
        backdropColor="transparent"
        animationIn="zoomIn"
        animationOut="zoomOut"
        useNativeDriver
        onBackButtonPress={() => setIsMediaFullscreen(false)}
        onBackdropPress={() => setIsMediaFullscreen(false)}
        swipeDirection="down"
        onSwipeComplete={() => setIsMediaFullscreen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
            paddingTop: insets.top,
            position: "relative",
          }}
        >
          {/* ✅ BLUR BACKGROUND IMAGE */}
          {!!artDetail?.mediaUrl && artDetail?.mediaType !== "VIDEO" && (
            <Image
              source={{ uri: artDetail.mediaUrl }}
              blurRadius={20}
              resizeMode="cover"
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* ✅ PREMIUM DARK OVERLAY */}
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
          />

          {/* ✅ MAIN MEDIA */}
          {artDetail?.mediaType === "VIDEO" ? (
            <Video
              source={{ uri: artDetail?.mediaUrl }}
              resizeMode="contain"
              controls
              repeat
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <ImageViewer
              imageUrls={[{ url: artDetail?.mediaUrl || "" }]}
              backgroundColor="transparent"
              enableSwipeDown
              onSwipeDown={() => setIsMediaFullscreen(false)}
              renderIndicator={() => <></>}
              saveToLocalByLongPress={false}
            />
          )}

          {/* ✅ CLOSE BUTTON */}
          <TouchableOpacity
            onPress={() => setIsMediaFullscreen(false)}
            style={{
              position: "absolute",
              top: insets.top,
              left: 20,
              zIndex: 10,
            }}
          >
            <CustomIcon Icon={ICONS.backArrow} width={28} height={28} />
          </TouchableOpacity>
        </View>
      </Modal>
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
  },

  side: {
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
    // marginBottom: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
  },
  keyboardView: {
    flex: 1,
  },
  updateImage: {
    height: hp(44.7),
    width: "100%",
    borderRadius: 30,
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
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
    paddingHorizontal: horizontalScale(16),
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
  mediaWrapper: {
    width: "100%",
    height: hp(49),
    overflow: "hidden",
    backgroundColor: COLORS.greyish,
  },
  ShareButton: {
    backgroundColor: COLORS.darkText,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: horizontalScale(8),
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
  },

  fullscreenContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  closeBtn: {
    position: "absolute",
    top: verticalScale(50),
    right: horizontalScale(12),
    zIndex: 10,
  },

  shareBtn: {
    position: "absolute",
    bottom: verticalScale(30),
    alignSelf: "center",
    backgroundColor: COLORS.appBackground,
  },

  fsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.greyish,
  },

  fsImageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  fsBlurBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  fsBlurImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  fsCenteredImageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  fsImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  fsFloatingActions: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: horizontalScale(16),
    gap: verticalScale(8),
  },
  saveButton: {
    flex: 1,
  },
  mediaShimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    overflow: "hidden",
  },

  mediaShimmer: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  fullscreenMedia: {
    width: wp(100),
    height: hp(100),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },

  cardImage: {
    width: "100%",
    height: verticalScale(423),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-end",
    backgroundColor: "white",
    zIndex: 10,
  },

  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: verticalScale(40),
  },
  weekCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: verticalScale(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomFadeWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: verticalScale(50),
    height: verticalScale(60),
    zIndex: 5,
  },

  bottomFade: {
    width: "100%",
    height: "100%",
  },
});
