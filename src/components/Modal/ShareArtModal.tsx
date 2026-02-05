import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import IMAGES from "../../assets/Images";
import ICONS from "../../assets/Icons";
import CustomIcon from "../CustomIcon";
import { horizontalScale, hp, verticalScale } from "../../utils/Metrics";
import { CustomText } from "../CustomText";
import COLORS from "../../utils/Colors";
import { useAppSelector } from "../../redux/store";
import Video from "react-native-video";

const { height } = Dimensions.get("window");
export type ShareType =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "message"
  | "more";

const SHARE_APPS = [
  { id: "1", type: "instagram", label: "Instagram", icon: ICONS.InstagramIcon },
  { id: "2", type: "facebook", label: "Facebook", icon: ICONS.FacebookIcon },
  { id: "3", type: "whatsapp", label: "WhatsApp", icon: ICONS.WhatsAppIcon },
  { id: "4", type: "message", label: "Message", icon: ICONS.MessageIcon },
  { id: "5", type: "more", label: "More", icon: ICONS.MoreIcon },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onShare: (type: ShareType) => void;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO" | string;
}

export default function ShareArtModal({ visible, onClose , onShare , mediaType , mediaUrl}: Props) {
  const { user } = useAppSelector((state) => state.user);

  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400 ,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(height);
    }
  }, [visible]);

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
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
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
            <Image
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
        </TouchableOpacity>

        {/* Share row */}
        <CustomText
          fontFamily="GabaritoRegular"
          fontSize={14}
          style={{ marginTop: verticalScale(32), color: COLORS.darkText }}
        >
          Share to
        </CustomText>

        <View style={styles.shareRow}>
          {SHARE_APPS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{ alignItems: "center" }}
              activeOpacity={0.8}
              onPress={() => onShare(item.type)}
            >
              <CustomIcon Icon={item.icon} width={40} height={40} />

              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={12}
                color={COLORS.darkText}
                style={{ marginTop: 6 }}
              >
                {item.label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>
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
});
