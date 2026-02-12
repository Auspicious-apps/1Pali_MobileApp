import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import RNFS from "react-native-fs";
import ShareLib, { Social } from "react-native-share";
import Video from "react-native-video";
import { captureRef } from "react-native-view-shot";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import { useAppSelector } from "../../redux/store";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale } from "../../utils/Metrics";
import CustomIcon from "../CustomIcon";
import { CustomText } from "../CustomText";

const { height } = Dimensions.get("window");
export type ShareType =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "WHATSAPP"
  | "MESSAGE"
  | "APP_SHARE_SHEET";

interface Props {
  visible: boolean;
  onClose: () => void;
  onShare: (type: ShareType) => Promise<void>;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO" | string;
}

export default function ShareArtModal({
  visible,
  onClose,
  onShare,
  mediaType,
  mediaUrl,
}: Props) {
  const { user } = useAppSelector((state) => state.user);
  const cardRef = useRef(null);
  const [capturingCard, setCapturingCard] = useState(false);
  const [isWhatsappInstalled, setIsWhatsappInstalled] = useState(false);
  const [isFacebookInstalled, setIsFacebookInstalled] = useState(false);
  const [isInstagramInstalled, setIsIInstagramInstalled] = useState(false);

  useEffect(() => {
    ShareLib.isPackageInstalled("com.whatsapp").then(({ isInstalled }) => {
      setIsWhatsappInstalled(isInstalled);
    });

    ShareLib.isPackageInstalled("com.facebook.katana").then(
      ({ isInstalled }) => {
        setIsFacebookInstalled(isInstalled);
      },
    );
    ShareLib.isPackageInstalled("com.instagram.android").then(
      ({ isInstalled }) => {
        setIsIInstagramInstalled(isInstalled);
      },
    );
  }, []);

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(height);
    }
  }, [visible]);

  // const handleShareToInstagram = async () => {
  //   try {
  //     setCapturingCard(true);
  //     const filePath = await captureRef(cardRef, {
  //       format: "png",
  //       quality: 0.9,
  //     });

  //     let shareFilePath = Platform.OS === "android" ? `${filePath}` : filePath;

  //     if (Platform.OS === "android") {
  //       const fileName = `onepali_ig_${Date.now()}.png`;
  //       const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

  //       await RNFS.copyFile(filePath, destPath);

  //       console.log(destPath, 'OPPDESTINATION PATH');

  //       shareFilePath = `file://${destPath}`;
  //     }

  //     // CLOSE LOADER BEFORE OPENING APP
  //     setCapturingCard(false);

  //     const shareOptions = {
  //       social: Social.Instagram,
  //       url: shareFilePath.replace("///", "//"),
  //       type: "image/png",
  //       forceFullSize: true,
  //     };

  //     await ShareLib.shareSingle(shareOptions as any);
  //     await onShare("INSTAGRAM");
  //   } catch (error) {
  //     setCapturingCard(false);
  //     console.log("Instagram share error:", error);
  //   }
  // };

  const handleShareToInstagram = async () => {
    try {
      setCapturingCard(true);

      const filePath = await captureRef(cardRef, {
        format: "png",
        quality: 0.9,
      });

      let shareFilePath = filePath;

      if (Platform.OS === "android") {
        const fileName = `onepali_ig_${Date.now()}.jpg`;
        const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

        await RNFS.copyFile(filePath, destPath);

        shareFilePath = `file://${destPath}`;
      }

      setCapturingCard(false);

      await ShareLib.open({
        url: shareFilePath,
        type: "image/*",
        failOnCancel: false,
        showAppsToView: true,
      });

      await onShare("INSTAGRAM");
    } catch (error) {
      setCapturingCard(false);
      console.log("Instagram share error:", error);
    }
  };

  const handleShareToWhatsapp = async () => {
    setCapturingCard(true);
    const filePath = await captureRef(cardRef, {
      format: "png",
      quality: 0.8,
    });

    const fileName = `onepali_wa_${Date.now()}.png`;
    const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    if (Platform.OS === "android") {
      await RNFS.copyFile(filePath, destPath);
    }

    const shareFilePath =
      Platform.OS === "android" ? `file://${destPath}` : filePath;
    try {
      setCapturingCard(false);

      const shareOptions = {
        // Try targeting WhatsApp Business specifically
        social: Social.Whatsapp || Social.Whatsappbusiness,
        url: shareFilePath,
        message: "Check out this artwork from OnePali!",
        type: "image/png",
        // Force the intent to look for the business package on Android
        forceFullSize: true,
      };

      await ShareLib.shareSingle(shareOptions as any);
      await onShare("WHATSAPP");
    } catch (error) {
      setCapturingCard(false);
      // Fallback: If Business fails, try standard WhatsApp
      console.log("WA Business fail, trying standard WA...");
      try {
        await ShareLib.shareSingle({
          social: Social.Whatsapp,
          url: shareFilePath,
          type: "image/png",
        } as any);
      } catch (e) {
        console.error("All WhatsApp shares failed", e);
      }
    }
  };

  const handleShareToFb = async () => {
    try {
      setCapturingCard(true);

      // Capture as file path
      const filePath = await captureRef(cardRef, {
        format: "png",
        quality: 0.8,
      });
      setCapturingCard(false);

      // On Android, copy to proper location
      let shareFilePath = filePath;
      if (Platform.OS === "android") {
        const fileName = `onepali-card-${Date.now()}.png`;
        const newPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

        await RNFS.copyFile(filePath, newPath);
        shareFilePath = `file://${newPath}`;
      } else {
        // iOS
        shareFilePath = `file://${filePath}`;
      }

      const shareOptions = {
        social: Social.Facebook,
        url: shareFilePath,
        type: "image/png",
      };

      await ShareLib.shareSingle(shareOptions as any);
      await onShare("FACEBOOK");
    } catch (error) {
      console.log("Facebook share error:", error);
      setCapturingCard(false);
    } finally {
      setCapturingCard(false);
    }
  };

  const handleShareToMore = async () => {
    try {
      setCapturingCard(true);

      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 0.8,
      });

      let shareFilePath = uri;
      if (Platform.OS === "android") {
        const fileName = `onepali-card-${Date.now()}.png`;
        const newPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.copyFile(uri, newPath);
        shareFilePath = `file://${newPath}`;
      } else {
        shareFilePath = `file://${uri}`;
      }

      // Set capturing to false RIGHT BEFORE opening the sheet
      // This ensures the loader is gone while the native UI is visible
      setCapturingCard(false);

      await ShareLib.open({
        url: shareFilePath,
        type: "image/png",
        message: `Check out this artwork from OnePali! Supporter #${user?.assignedNumber}`,
      });

      await onShare("APP_SHARE_SHEET");
    } catch (error) {
      // Check if the error is just a user cancellation
      if (
        error instanceof Error &&
        error.message.includes("User did not share")
      ) {
        console.log("User cancelled sharing");
      } else {
        console.log("Card share error:", error);
      }
    } finally {
      setCapturingCard(false); // Safety net
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Bottom sheet */}
      <Animated.View
        style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: verticalScale(30) }} />

          <CustomText
            fontFamily="GabaritoSemiBold"
            fontSize={18}
            color={COLORS.darkText}
          >
            Share Art
          </CustomText>

          <TouchableOpacity onPress={onClose}>
            <CustomIcon Icon={ICONS.CloseIcon} height={30} width={30} />
          </TouchableOpacity>
        </View>

        {/* Preview card */}
        <View ref={cardRef} style={styles.card}>
          {mediaType === "VIDEO" ? (
            <View style={styles.mediaWrapper}>
              <Video
                source={{ uri: mediaUrl }}
                posterResizeMode="cover"
                resizeMode="cover"
                controls
                repeat
                style={styles.cardImage}
                onError={(e) => console.log("Video error", e)}
              />
            </View>
          ) : (
            <FastImage
              source={{ uri: mediaUrl }}
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
              I’m supporter #{user?.assignedNumber} helping reach 1M donors for
              humanitarian aid in Palestine. Every bit counts. Join the movement
              at onepali.app
            </CustomText>
          </View>
        </View>

        {/* Share row */}
        <CustomText
          fontFamily="GabaritoRegular"
          fontSize={14}
          style={{ marginTop: verticalScale(32), color: COLORS.darkText }}
        >
          Share to
        </CustomText>

        <View style={styles.shareRow}>
          {isInstagramInstalled && (
            <TouchableOpacity
              style={{ alignItems: "center" }}
              activeOpacity={0.8}
              onPress={handleShareToInstagram}
              disabled={capturingCard}
            >
              <CustomIcon Icon={ICONS.InstagramIcon} width={40} height={40} />

              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={12}
                color={COLORS.darkText}
                style={{ marginTop: 6 }}
              >
                Instagram
              </CustomText>
            </TouchableOpacity>
          )}
          {isWhatsappInstalled && (
            <TouchableOpacity
              style={{ alignItems: "center" }}
              activeOpacity={0.8}
              onPress={handleShareToWhatsapp}
              disabled={capturingCard}
            >
              <CustomIcon Icon={ICONS.WhatsAppIcon} width={40} height={40} />

              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={12}
                color={COLORS.darkText}
                style={{ marginTop: 6 }}
              >
                Whatsapp
              </CustomText>
            </TouchableOpacity>
          )}
          {isFacebookInstalled && (
            <TouchableOpacity
              style={{ alignItems: "center" }}
              activeOpacity={0.8}
              onPress={handleShareToFb}
              disabled={capturingCard}
            >
              <CustomIcon Icon={ICONS.FacebookIcon} width={40} height={40} />

              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={12}
                color={COLORS.darkText}
                style={{ marginTop: 6 }}
              >
                Facebook
              </CustomText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ alignItems: "center" }}
            activeOpacity={0.8}
            onPress={handleShareToMore}
            disabled={capturingCard}
          >
            <CustomIcon Icon={ICONS.MoreIcon} width={40} height={40} />

            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={12}
              color={COLORS.darkText}
              style={{ marginTop: 6 }}
            >
              More
            </CustomText>
          </TouchableOpacity>
        </View>
      </Animated.View>
      {/* Card sharing indicator */}
      {capturingCard && Platform.OS === "android" && (
        <View style={styles.capturingOverlay}>
          <ActivityIndicator size="large" color={COLORS.darkText} />
          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={14}
            color={COLORS.darkText}
            style={{ marginTop: 12 }}
          >
            Preparing image...
          </CustomText>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  container: {
    position: "absolute",
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 16,
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(12),
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: verticalScale(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 6,
  },

  cardImage: {
    width: "100%",
    height: verticalScale(423),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  shareRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: verticalScale(16),
    paddingHorizontal: horizontalScale(8),
  },
  mediaWrapper: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.greyish,
  },
  capturingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
});
