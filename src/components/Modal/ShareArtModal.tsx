import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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

  const handleShareToInstagram = async () => {
    try {
      setCapturingCard(true);

      // Capture as file path (same as WhatsApp)
      const filePath = await captureRef(cardRef, {
        format: "png",
        quality: 0.8,
      });

      let shareFilePath = filePath;

      // Android: Copy to cache (Instagram needs accessible path)
      if (Platform.OS === "android") {
        const fileName = `onepali-card-${Date.now()}.png`;
        const newPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        await RNFS.copyFile(filePath, newPath);
        shareFilePath = `file://${newPath}`;
      } else {
        shareFilePath = `file://${filePath}`;
      }

      const shareOptions = {
        social: Social.Instagram, // Opens Stories/Camera by default
        url: shareFilePath,
        type: "image/png",
      };

      await ShareLib.shareSingle(shareOptions as any);

      await onShare("INSTAGRAM");
    } catch (error) {
      console.log("Instagram share error:", error);
    } finally {
      setCapturingCard(false);
    }
  };

  const handleShareToWhatsapp = async () => {
    try {
      setCapturingCard(true);

      const filePath = await captureRef(cardRef, {
        format: "png",
        quality: 0.8,
      });

      // Single path normalization (cleaner)
      const destPath =
        Platform.OS === "android"
          ? `${RNFS.CachesDirectoryPath}/onepali-card-${Date.now()}.png`
          : filePath;

      if (Platform.OS === "android") {
        await RNFS.copyFile(filePath, destPath);
      }

      const shareOptions = {
        social: Social.Whatsapp,
        url: `file://${destPath}`, // Always file://
        message: "Check out this artwork from OnePali!",
        type: "image/png",
        // Remove appId - not needed for WhatsApp
      };

      console.log("Sharing to:", shareOptions.url);
      await ShareLib.shareSingle(shareOptions as any);

      await onShare("WHATSAPP");
    } catch (error) {
      console.error("WhatsApp share failed:", error);
      // Fallback to native Share.open
    } finally {
      setCapturingCard(false);
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
    } finally {
      setCapturingCard(false);
    }
  };

  const handleShareToMore = async () => {
    try {
      setCapturingCard(true);

      // Capture the preview card
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 0.8,
      });

      // On Android, copy to proper location
      let shareFilePath = uri;
      if (Platform.OS === "android") {
        const fileName = `onepali-card-${Date.now()}.png`;
        const newPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

        await RNFS.copyFile(uri, newPath);
        shareFilePath = `file://${newPath}`;
      } else {
        // iOS
        shareFilePath = `file://${uri}`;
      }

      // Share the captured image
      const result = await ShareLib.open({
        url: shareFilePath,
        type: "image/png",
        message: `Check out this artwork from OnePali! Supporter #${user?.assignedNumber}`,
      });
    } catch (error) {
      console.log("Card share error:", error);
      await onShare("APP_SHARE_SHEET");
    } finally {
      setCapturingCard(false);
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
            <FastImage
              source={IMAGES.OnePaliLogo}
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
              Supporter #{user?.assignedNumber} helping reach 1M donors for
              humanitarian aid in Palestine. Join us at onepali.app
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

        {/* Card sharing indicator */}
        {capturingCard && (
          <View style={styles.capturingOverlay}>
            <ActivityIndicator size="large" color={COLORS.darkText} />
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={14}
              color={COLORS.darkText}
              style={{ marginTop: 12 }}
            >
              Preparing card...
            </CustomText>
          </View>
        )}
      </Animated.View>
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: verticalScale(24),
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
    justifyContent: "space-between",
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
