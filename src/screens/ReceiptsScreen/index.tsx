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
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import FocusResetScrollView from "../../components/FocusResetScrollView";
import ENDPOINTS from "../../service/ApiEndpoints";
import {
  GetUserReceiptResponse,
  ReceiptsData,
} from "../../service/ApiResponses/RecieptApiResponse";
import { fetchData } from "../../service/ApiService";
import { ReceiptsScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale } from "../../utils/Metrics";

const ReceiptsScreen: FC<ReceiptsScreenProps> = ({ navigation }) => {
  const [receipts, setReceipts] = useState<GetUserReceiptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [years, setYears] = useState<number[]>([]);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const yearButtonRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const currentYear = dayjs().year();

  const formatReceiptMonth = (date: string) => dayjs(date).format("MMMM YYYY");
  const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

  const fetchUserReceipts = async (year: number) => {
    try {
      setLoading(true);
      setReceipts([]);
      const response = await fetchData<ReceiptsData>(
        ENDPOINTS.GetUserReceipts,
        { year },
      );
      const data = response?.data?.data?.receipts || [];
      setReceipts(data);

      if (years.length === 0) {
        const startYear = 2026;
        const totalYears = 6;

        const yrs = Array.from({ length: totalYears }, (_, i) => startYear + i);

        setYears(yrs);
      }
    } catch (error) {
      console.error("Receipts fetch error:", error);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const measureAndToggleDropdown = () => {
    if (loading) return;
    yearButtonRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({ top: y + height + 4, left: x, width });
      setShowYearDropdown((prev) => !prev);
    });
  };

  const handleDownloadPDF = async (url: string, receiptId: string) => {
    if (downloadingId === receiptId) return;

    try {
      setDownloadingId(receiptId);

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
              console.log("Permission denied");
              return;
            }

            // If "never_ask_again", still proceed - the download manager might work
            if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
              console.log(
                "Permission set to never ask again, proceeding anyway",
              );
            }
          }
        } catch (error) {
          console.error("Permission check error:", error);
        }
      }

      const { fs, config } = ReactNativeBlobUtil;
      const dir =
        Platform.OS === "ios" ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
      const fileName = `Receipt_${receiptId}_${Date.now()}.pdf`;
      const path = `${dir}/${fileName}`;

      if (Platform.OS === "ios") {
        ReactNativeBlobUtil.ios.previewDocument(path);
      }
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const isDownloading = (receiptId: string) => downloadingId === receiptId;

  useEffect(() => {
    fetchUserReceipts(selectedYear);
  }, [selectedYear]);

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
                          setSelectedYear(year);
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
  header: { width: "100%", flexDirection: "row" },
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
