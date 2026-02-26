import { Platform, StyleSheet } from "react-native";
import COLORS from "../../utils/Colors";
import {
  horizontalScale,
  isTablet,
  verticalScale,
  wp,
} from "../../utils/Metrics";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.appBackground,
  },
  safeArea: {
    flex: 1,
    // paddingHorizontal: horizontalScale(20),
    paddingBottom:
      Platform.OS === "ios" ? verticalScale(20) : verticalScale(10),
    paddingTop: verticalScale(5),
  },
  appIcon: {
    width: horizontalScale(54),
    height: verticalScale(54),
    alignSelf: "center",
    resizeMode: "contain",
  },
  header: {
    marginTop: verticalScale(30),
    gap: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
  },
  headerTitle: {
    width: "100%",
    textAlign: "left",
    lineHeight: isTablet ? verticalScale(45) : verticalScale(40),
  },
  centerText: {
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
  sectionContainer: {
    paddingHorizontal: horizontalScale(20),
  },
  sectionDescription: {
    lineHeight: verticalScale(18),
  },
  FaqText: {
    marginTop: verticalScale(18),
    textAlign: "center",
    textDecorationLine: "underline",
  },
  imageRow: {
    flexDirection: "row",
    gap: horizontalScale(10),
    marginTop: verticalScale(16),
  },
  image: {
    height: verticalScale(150),
    borderRadius: 8,
  },
  fundsListContent: {
    gap: horizontalScale(12),
    paddingRight: horizontalScale(5),
    paddingLeft: horizontalScale(20),
  },
  fundCard: {
    padding: verticalScale(8),
    marginTop: verticalScale(16),
    borderRadius: 24,
    width: "100%",
  },
  fundCardImage: {
    // width: wp(77.4),
    width: "100%",
    height: verticalScale(220),
    backgroundColor: COLORS.greyish,
    borderRadius: 18,
  },
  fundCardTitle: {},
  divider: {
    width: horizontalScale(200),
    borderBottomWidth: 1,
    borderColor: COLORS.greyish,
    alignSelf: "center",
    marginBottom: verticalScale(24),
  },
  sectionWrapper: {
    marginTop: verticalScale(24),
    gap: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
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
    marginTop: verticalScale(10),
    zIndex: 10,
  },
  contentContainer: {
    paddingBottom:
      Platform.OS === "android" ? verticalScale(100) : verticalScale(70),
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#000",
    marginHorizontal: 4,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: verticalScale(20),
    paddingTop: verticalScale(20),
    justifyContent: "flex-end",
  },

  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: verticalScale(40),
  },
  card: {
    backgroundColor: COLORS.appBackground,
    borderRadius: 20,
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(4),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 6,
    marginTop: verticalScale(12),
  },
  mecaImage: {
    width: wp(80),
    height: verticalScale(40),
    alignSelf: "center",
    resizeMode: "contain",
    marginTop: verticalScale(18),
  },
});

export default styles;
