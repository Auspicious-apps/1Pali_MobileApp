import React, { FC, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { WebView } from "react-native-webview";
import COLORS from "../utils/Colors";
import { horizontalScale, hp, verticalScale, wp } from "../utils/Metrics";
import { CustomText } from "./CustomText";

interface WebViewBottomSheetProps {
  isVisible: boolean;
  title?: string;
  url: string;
  onClose: () => void;
}

const WebViewBottomSheet: FC<WebViewBottomSheetProps> = ({
  isVisible,
  title,
  url,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const safeUrl = useMemo(() => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return "https://onepali.app";
  }, [url]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      backdropTransitionOutTiming={0}
      useNativeDriver
      hideModalContentWhileAnimating
      statusBarTranslucent
    >
      <View style={styles.sheetContainer}>
        <View style={styles.header}>
          <CustomText fontFamily="GabaritoSemiBold" fontSize={16} color={COLORS.darkText}>
            {title || "Legal"}
          </CustomText>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <CustomText fontFamily="GabaritoSemiBold" fontSize={14} color={COLORS.greyText}>
              Close
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={styles.webviewContainer}>
          {isLoading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="small" color={COLORS.darkText} />
            </View>
          )}
          <WebView
            source={{ uri: safeUrl }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            startInLoadingState
            style={styles.webview}
          />
        </View>
      </View>
    </Modal>
  );
};

export default WebViewBottomSheet;

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  sheetContainer: {
    height: hp(82),
    width: wp(100),
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
  },
  header: {
    height: verticalScale(52),
    paddingHorizontal: horizontalScale(16),
    borderBottomWidth: 1,
    borderColor: COLORS.borderColor,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    zIndex: 1,
  },
});
