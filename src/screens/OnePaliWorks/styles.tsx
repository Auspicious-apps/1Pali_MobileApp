import { Platform, StyleSheet } from "react-native";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale } from "../../utils/Metrics";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
    paddingVertical:
      Platform.OS === "ios" ? verticalScale(0) : verticalScale(10),
  },
  appIcon: {
    width: horizontalScale(80),
    height: verticalScale(70),
    alignSelf: "center",
    resizeMode: "contain",
  },
  header: {
    marginTop: verticalScale(30),
    gap: verticalScale(8),
  },
  headerTitle: {
    width: "90%",
    textAlign: "left",
  },
  centerText: {
    textAlign: "center",
    color: COLORS.darkText,
  },
  infoCard: {
    backgroundColor: COLORS.borderColor,
    paddingHorizontal: horizontalScale(12),
    borderRadius: 12,
    marginTop: verticalScale(10),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(12),
  },
  sectionContainer: {},
  sectionDescription: {
    marginTop: verticalScale(6),
    textAlign: "center",
  },
  FaqText: {
    marginTop: verticalScale(24),
    textAlign: "center",
    textDecorationLine: "underline",
  },
  imageRow: {
    flexDirection: "row",
    gap: horizontalScale(10),
    marginTop: verticalScale(12),
  },
  image: {
    height: verticalScale(150),
    borderRadius: 8,
  },
  fundsListContent: {
    gap: horizontalScale(12),
  },
  fundCard: {
    padding: verticalScale(12),
    borderWidth: 1,
    borderColor: COLORS.LightGrey,
    marginTop: verticalScale(27),
    borderRadius: 12,
    backgroundColor: COLORS.white,
    width: horizontalScale(260),
  },
  fundCardImage: {
    width: "100%",
    height: verticalScale(220),
    backgroundColor: COLORS.greyish,
    borderRadius: 12,
  },
  fundCardTitle: {
    marginTop: verticalScale(12),
  },
  divider: {
    width: horizontalScale(200),
    borderBottomWidth: 1,
    borderColor: COLORS.greyish,
    alignSelf: "center",
    marginVertical: verticalScale(24),
  },
  sectionWrapper: {
    marginTop: verticalScale(24),
    gap: verticalScale(8),
  },
  whoCard: {
    borderWidth: 1,
    borderColor: COLORS.greyish,
    backgroundColor: COLORS.white,
    padding: verticalScale(16),
    borderRadius: 12,
  },
  rowContainer: {
    flexDirection: "row",
    gap: horizontalScale(12),
    width: "90%",
  },
  innerDivider: {
    borderBottomWidth: 1,
    borderColor: COLORS.greyish,
    marginVertical: verticalScale(12),
  },
  bottomImage: {
    width: "100%",
    height: verticalScale(150),
    marginTop: verticalScale(16),
  },
  primaryButton: {
    marginTop: verticalScale(34),
    width: "100%",
  },
  contentContainer: {
    paddingBottom: verticalScale(10),
  },
});

export default styles;
