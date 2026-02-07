import dayjs from "dayjs";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import {
  fetchReceipts,
  setDownloadingId,
  setSelectedYear,
} from "../../redux/slices/ReceiptsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { ReceiptsScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale } from "../../utils/Metrics";

const ReceiptsScreen: FC<ReceiptsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { receipts, loading, selectedYear, years, downloadingId } =
    useAppSelector((state) => state.receipts);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const yearButtonRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const formatReceiptMonth = (date: string) => dayjs(date).format("MMMM YYYY");
  const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

  const measureAndToggleDropdown = () => {
    if (loading) return;
    yearButtonRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({ top: y + height + 4, left: x, width });
      setShowYearDropdown((prev) => !prev);
    });
  };

  const handleDownloadPDF = async (url: string, receiptId: string) => {
    if (downloadingId === receiptId) return;
    const fileName = `Receipt_${receiptId}.pdf`;

    try {
      dispatch(setDownloadingId(receiptId));
      const { fs, config } = ReactNativeBlobUtil;

      // 1. Skip permission requests for Android 13+ (API 33+)
      // Android 15 will auto-reject legacy storage requests
      if (Platform.OS === "android" && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show({ type: "error", text1: "Permission Denied" });
          return;
        }
      }

      const options = Platform.select({
        ios: {
          fileCache: true,
          path: `${fs.dirs.DocumentDir}/${fileName}`,
        },
        android: {
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            title: fileName,
            description: "Downloading Receipt...",
            mime: "application/pdf",
            // CRITICAL CHANGE FOR ANDROID 15:
            // Do not provide a full file path string here.
            // Setting it to true or a sub-folder allows the system to manage the write.
            storeInDownloads: true,
            mediaScannable: true,
          },
        },
      });

      // 2. The Fetch call
      // If you still get an error, try removing 'path' from the root config for Android
      const res = await config(options!).fetch("GET", url);

      // 3. Success Handling
      if (Platform.OS === "ios") {
        ReactNativeBlobUtil.ios.previewDocument(res.path());
      } else {
        Toast.show({
          type: "success",
          text1: "Download Started",
          text2: "Check your notifications for the file",
        });
      }
    } catch (error: any) {
      console.error("Download failed:", error);

      // If DownloadManager still fails, fallback to a simple cache download + Share
      if (Platform.OS === "android") {
        handleFallbackDownload(url, fileName);
      }
    } finally {
      dispatch(setDownloadingId(null));
    }
  };

  const handleFallbackDownload = async (url: string, fileName: string) => {
    const { fs, config } = ReactNativeBlobUtil;
    const tempPath = `${fs.dirs.CacheDir}/${fileName}`;

    try {
      const res = await config({ fileCache: true, path: tempPath }).fetch(
        "GET",
        url,
      );

      // Open the Android Share Sheet so the user can "Save to Device" or "Open with PDF"
      await ReactNativeBlobUtil.android.actionViewIntent(
        res.path(),
        "application/pdf",
      );
    } catch (err) {
      Toast.show({ type: "error", text1: "Download failed entirely" });
    }
  };

  const isDownloading = (receiptId: string) => downloadingId === receiptId;

  useEffect(() => {
    dispatch(fetchReceipts({ year: selectedYear }));
  }, [selectedYear, dispatch]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <FocusResetScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.side}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <CustomIcon Icon={ICONS.backArrow} height={26} width={26} />
              </TouchableOpacity>
            </View>
            <View style={styles.center}>
              <Image source={IMAGES.LogoText} style={styles.logo} />
            </View>
            <View style={styles.side} />
          </View>

          <View style={styles.titleContainer}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={32}
              color={COLORS.darkText}
            >
              Receipts
            </CustomText>
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={14}
              color={COLORS.appText}
              style={styles.subtitle}
            >
              Track your donations and export receipts
            </CustomText>
          </View>

          {/* Year selector */}
          <TouchableOpacity
            ref={yearButtonRef}
            style={styles.yearFilter}
            onPress={measureAndToggleDropdown}
            disabled={loading}
          >
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={16}
              color={COLORS.appText}
            >
              {selectedYear}
            </CustomText>
            <CustomIcon Icon={ICONS.DropdownIcon} height={24} width={24} />
          </TouchableOpacity>
          {loading ? (
            <View style={styles.fullScreenLoader}>
              <ActivityIndicator size="large" color={COLORS.darkText} />
            </View>
          ) : (
            <View style={styles.card}>
              {receipts.length === 0 ? (
                <View style={styles.emptyState}>
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={18}
                    color={COLORS.appText}
                    style={{ textAlign: "center" }}
                  >
                    No receipts found for {selectedYear}
                  </CustomText>
                </View>
              ) : (
                <FlatList
                  data={receipts}
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item) => item?.receiptId}
                  contentContainerStyle={styles.listContent}
                  renderItem={({ item, index }) => (
                    <View
                      style={[
                        styles.receiptRow,
                        index === receipts.length - 1 && styles.lastReceiptRow,
                      ]}
                    >
                      <View style={styles.receiptRowLeft}>
                        <CustomIcon
                          Icon={ICONS.currncyDoller}
                          height={67}
                          width={67}
                        />
                        <View style={styles.receiptTextContainer}>
                          <View>
                            <CustomText
                              fontFamily="GabaritoRegular"
                              fontSize={18}
                              color={COLORS.darkText}
                            >
                              {formatReceiptMonth(item.date)}
                            </CustomText>
                            <CustomText
                              fontFamily="GabaritoRegular"
                              fontSize={16}
                              color={COLORS.appText}
                            >
                              {formatAmount(item.price)}
                            </CustomText>
                          </View>
                          <CustomText
                            fontFamily="SourceSansRegular"
                            fontSize={14}
                            color={COLORS.appText}
                          >
                            {/* Receipt ID:  */}
                            {item.receiptId}
                          </CustomText>
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          handleDownloadPDF(item.receiptUrl, item.receiptId)
                        }
                        disabled={isDownloading(item.receiptId)}
                      >
                        {isDownloading(item.receiptId) ? (
                          <ActivityIndicator
                            size="small"
                            color={COLORS.darkText}
                          />
                        ) : (
                          <CustomIcon
                            Icon={ICONS.DownloadIcon}
                            height={40}
                            width={40}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </FocusResetScrollView>

        {/* Year dropdown */}
        {showYearDropdown && (
          <Modal transparent animationType="none">
            <TouchableWithoutFeedback
              onPress={() => setShowYearDropdown(false)}
            >
              <View style={{ flex: 1 }}>
                <View
                  style={[
                    styles.dropdownContainer,
                    {
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                      width: dropdownPosition.width,
                    },
                  ]}
                >
                  <FlatList
                    data={years}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.toString()}
                    style={{ maxHeight: 240 }}
                    renderItem={({ item: year }) => (
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          year === selectedYear && {
                            backgroundColor: COLORS.greyish,
                          },
                        ]}
                        onPress={() => {
                          dispatch(setSelectedYear(year));
                          setShowYearDropdown(false);
                        }}
                      >
                        <CustomText
                          fontFamily="GabaritoRegular"
                          fontSize={16}
                          color={COLORS.appText}
                        >
                          {year}
                        </CustomText>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  safeArea: { flex: 1, paddingHorizontal: horizontalScale(20) },
  scrollContent: { flexGrow: 1, paddingBottom: verticalScale(32) },
  header: { width: "100%", flexDirection: "row", marginTop: verticalScale(10) },
  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
  },
  side: { width: horizontalScale(40), alignItems: "flex-start" },
  center: { flex: 1, alignItems: "center" },
  titleContainer: { marginTop: verticalScale(32), alignItems: "center" },
  subtitle: { textAlign: "center" },
  yearFilter: {
    backgroundColor: COLORS.greyish,
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10),
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(8),
    marginTop: verticalScale(24),
    width: horizontalScale(80),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginTop: verticalScale(16),
    marginHorizontal: horizontalScale(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  listContent: {},
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: COLORS.greyish,
    paddingBottom: verticalScale(12),
    marginBottom: verticalScale(12),
  },
  lastReceiptRow: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  receiptRowLeft: { flexDirection: "row", gap: horizontalScale(12) },
  receiptTextContainer: { gap: verticalScale(8) },

  // New styles
  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: verticalScale(30),
    alignItems: "center",
    justifyContent: "center",
  },

  dropdownContainer: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.greyish,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
  },
});

export default ReceiptsScreen;
