import React, { FC, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
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
import Video from "react-native-video";
import RNFS from "react-native-fs";
import { useAppDispatch } from "../../redux/store";
import { addNewArtBadge } from "../../redux/slices/UserSlice";
import ShareArtModal, { ShareType } from "../../components/Modal/ShareArtModal";
import ShareLib from "react-native-share";
import PrimaryButton from "../../components/PrimaryButton";
import LinearGradient from "react-native-linear-gradient";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import ReactNativeBlobUtil from "react-native-blob-util";

const ArtDetail: FC<ArtDetailScreenProps> = ({ navigation, route }) => {
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
  const keyboardVisible = useRef(false);


  const [isDownloadingArt, setIsDownloadingArt] = useState(false);

  const MediaShimmer = () => (
    <View style={styles.mediaShimmerContainer}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={styles.mediaShimmer}
      />
    </View>
  );

  const ArtDetailShimmer = () => (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: horizontalScale(20), gap: 16 }}>
        {/* Media */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{
            width: "100%",
            height: hp(49),
            borderRadius: 20,
          }}
        />

        {/* Action row */}
        <View style={{ flexDirection: "row", gap: 16 }}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={{ width: 60, height: 20, borderRadius: 6 }}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={{ width: 60, height: 20, borderRadius: 6 }}
          />
        </View>

        {/* Title */}
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: "70%", height: 28, borderRadius: 8 }}
        />

        {/* Description lines */}
        {[1, 2, 3].map((_, i) => (
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
  const CommentShimmer = () => (
    <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: "30%", height: 14, borderRadius: 6 }}
      />
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{
          width: "100%",
          height: 14,
          borderRadius: 6,
          marginTop: 6,
        }}
      />
    </View>
  );

  const prepareMedia = async () => {
    if (!artDetail) return null;

    let uri = artDetail.mediaUrl;

    if (uri.startsWith("http")) {
      const ext = artDetail.mediaType === "VIDEO" ? ".mp4" : ".jpg";

      const path = `${RNFS.CachesDirectoryPath}/art-${ArtId}${ext}`;

      const exists = await RNFS.exists(path);

      if (!exists) {
        await RNFS.downloadFile({
          fromUrl: uri,
          toFile: path,
        }).promise;
      }

      uri = "file://" + path;
    }

    return uri;
  };

  const shareToApp = async (platform: ShareType) => {
    try {
      const uri = await prepareMedia();
      if (!uri) return;

      const baseOptions = {
        url: uri,
        message: artDetail?.title || "",
        type: artDetail?.mediaType === "VIDEO" ? "video/mp4" : "image/jpeg",
      };

      if (platform === "more" || platform === "message") {
        await ShareLib.open(baseOptions);
        await postData<ShareArtResponse>(
          `${ENDPOINTS.ShareArt}/${ArtId}/share`,
          {
            platform: "APP_SHARE_SHEET",
          },
        );
        return;
      }

      const socialMap = {
        instagram: ShareLib.Social.INSTAGRAM,
        facebook: ShareLib.Social.FACEBOOK,
        whatsapp: ShareLib.Social.WHATSAPP,
      };

      await ShareLib.shareSingle({
        ...baseOptions,
        social: socialMap[platform],
      });

      await postData<ShareArtResponse>(`${ENDPOINTS.ShareArt}/${ArtId}/share`, {
        platform: "APP_SHARE_SHEET",
      });

      console.log("Shared →", platform);
    } catch (err) {
      console.log("Share failed:", err);
    }
  };

  const handleDownloadImage = async (url: string, artId: string) => {
    if (!url) return;

    try {
      if (Platform.OS === "android") {
        try {
          // Check permission first
          const androidVersion = Platform.Version;
          let permission =
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

          // Android 11+ requires MANAGE_EXTERNAL_STORAGE or use scoped storage
          if (androidVersion >= 30) {
            permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
          }

          // First, check if permission is already granted
          const hasPermission = await PermissionsAndroid.check(permission);

          if (!hasPermission) {
            // Request permission
            const granted = await PermissionsAndroid.request(permission);

            if (
              granted !== PermissionsAndroid.RESULTS.GRANTED &&
              granted !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
            ) {
              Toast.show({
                type: "error",
                text1: "Permission Denied",
                text2: "Storage permission is required to download images",
              });
              return;
            }
          }
        } catch (error) {
          console.error("Permission check error:", error);
        }
      }
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

  const handleImageDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (!isLiked && !likeRequestInProgress.current) {
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

      let localUri = artDetail.mediaUrl;

      // If it's a remote URL → try to download to cache (helps Story appear more often)
      if (artDetail.mediaUrl.startsWith("http")) {
        const filename =
          artDetail.mediaUrl.split("/").pop() ||
          `art-${ArtId}.${artDetail.mediaType === "VIDEO" ? "mp4" : "jpg"}`;
        localUri = `${RNFS.CachesDirectoryPath}/${filename}`;

        const exists = await RNFS.exists(localUri);
        if (!exists) {
          await RNFS.downloadFile({
            fromUrl: artDetail.mediaUrl,
            toFile: localUri,
          }).promise;
        }
      }

      const result = await Share.share({
        title: artDetail.title,
        message: `${artDetail.title}\n\n${
          artDetail?.description || ""
        }\n\nCreated by ${artDetail?.artistName}`,
        url: localUri, // ← local file path → better Story chance
      });

      if (result.action === Share.sharedAction) {
        // You can try to detect if it was Instagram, but it's unreliable
        // For now – send generic or keep your WHATSAPP logic
        const response = await postData<ShareArtResponse>(
          `${ENDPOINTS.ShareArt}/${ArtId}/share`,
          { platform: "APP_SHARE_SHEET" }, // or try to guess from result.activityType
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

  useEffect(() => {
    setImageLoading(true);
    mediaLoadedRef.current = false;
  }, [artDetail?.mediaUrl]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      keyboardVisible.current = true;
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      keyboardVisible.current = false;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (loading) {
    return <ArtDetailShimmer />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.side}>
            <TouchableOpacity activeOpacity={0.8}>
              <CustomIcon
                Icon={ICONS.backArrow}
                height={26}
                width={26}
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
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <FocusResetScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              showCommentInput && { paddingBottom: verticalScale(20) },
            ]}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const currentY = e.nativeEvent.contentOffset.y;
              const diff = currentY - lastScrollY.current;

              if (diff > 5) {
                setShowCommentInput(true);
                manualOpen.current = false;
              } else if (
                diff < -5 &&
                !manualOpen.current &&
                !keyboardVisible.current // 👈 CRITICAL
              ) {
                setShowCommentInput(false);
              }

              lastScrollY.current = currentY;
            }}
          >
            <TouchableWithoutFeedback onPress={handleImageDoubleTap}>
              <View style={styles.imageWrapper}>
                {artDetail?.mediaType === "IMAGE" && (
                  <>
                    {imageLoading && <MediaShimmer />}
                    <Image
                      source={{ uri: artDetail.mediaUrl }}
                      style={styles.updateImage}
                      resizeMode="cover"
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
                  </>
                )}

                {/* VIDEO */}
                {artDetail?.mediaType === "VIDEO" && (
                  <View style={styles.mediaWrapper}>
                    {imageLoading && <MediaShimmer />}

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
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
                paddingTop: verticalScale(12),
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
                  Share Art
                </CustomText>
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
              onLayout={(e) => {
                commentsSectionY.current = e.nativeEvent.layout.y;
              }}
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
                        <CommentShimmer key={i} />
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
          {showCommentInput && (
            <>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: COLORS.greyish,
                }}
              />
              <View style={styles.commentInputRow}>
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
                      <CustomIcon
                        Icon={ICONS.sendIcon}
                        height={24}
                        width={24}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      {uiIndex === 1 && (
        <View style={styles.fullscreenContainer}>
          <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
            {/* ===== HEADER ===== */}

            <View style={styles.fsHeader}>
              <View style={{ width: horizontalScale(20) }} />

              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={16}
                color={COLORS.darkText}
              >
                {artDetail?.createdAt
                  ?.slice(0, 10)
                  ?.split("-")
                  ?.reverse()
                  ?.join(".")}
              </CustomText>

              <TouchableOpacity onPress={() => setUiIndex(0)}>
                <CustomIcon Icon={ICONS.close} width={24} height={24} />
              </TouchableOpacity>
            </View>

            {/* ===== IMAGE WRAPPER ===== */}

            <View style={styles.fsImageWrapper}>
              {artDetail?.mediaType === "VIDEO" ? (
                <Video
                  source={{ uri: artDetail.mediaUrl }}
                  resizeMode="cover"
                  repeat
                  controls
                  style={styles.fsImage}
                />
              ) : (
                <Image
                  source={{ uri: artDetail?.mediaUrl }}
                  resizeMode="cover"
                  style={styles.fsImage}
                />
              )}

              {/* ===== FLOATING BUTTONS ===== */}
              <View style={styles.fsFloatingActions}>
                <TouchableOpacity
                  style={{}}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleDownloadImage(artDetail?.mediaUrl || "", ArtId)
                  }
                >
                  {isDownloadingArt ? (
                    <View
                      style={{
                        width: horizontalScale(66),
                        height: verticalScale(56),
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: COLORS.darkText,
                        borderRadius: 15,
                      }}
                    >
                      <ActivityIndicator color={COLORS.white} />
                    </View>
                  ) : (
                    <CustomIcon
                      Icon={ICONS.download}
                      width={horizontalScale(66)}
                      height={verticalScale(56)}
                    />
                  )}
                </TouchableOpacity>
                <PrimaryButton
                  title={"Share Art"}
                  onPress={() => {
                    setOpenModal(true);
                  }}
                  style={styles.saveButton}
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      )}

      <ShareArtModal
        visible={OpenModal}
        onClose={() => setOpenModal(false)}
        onShare={shareToApp}
        mediaUrl={artDetail?.mediaUrl}
        mediaType={artDetail?.mediaType}
      />
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
    paddingHorizontal: horizontalScale(20),
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.greyish,
    paddingRight: horizontalScale(8),
    paddingLeft: horizontalScale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.light,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  commentInput: {
    fontFamily: "SourceSansRegular",
    fontSize: 14,
    color: COLORS.darkText,
    paddingVertical: verticalScale(5),
    width: "88%",
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
    width: "100%",
    height: hp(49),
    borderRadius: 20,
    overflow: "hidden",
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
  mediaWrapper: {
    width: "100%",
    height: hp(49),
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.greyish,
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

  fullscreenContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  },

  fsImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 5,
  },

  mediaShimmer: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
});
