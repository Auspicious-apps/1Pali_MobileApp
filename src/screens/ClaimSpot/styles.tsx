import { Platform, StyleSheet } from "react-native";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale, wp } from "../../utils/Metrics";
import FONTS from "../../assets/fonts";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.appBackground,
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    width: wp(90),
    flexDirection: "row",
    marginTop: Platform.OS === "android" ? verticalScale(10) : verticalScale(0),
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
  },
  side: { width: horizontalScale(40), alignItems: "flex-start" },
  center: { flex: 1, alignItems: "center" },
  content: {
    flex: 1,
    alignItems: "center",
  },
  headingContainer: {
    marginTop: Platform.OS === "ios" ? verticalScale(40) : verticalScale(40),
    gap: verticalScale(8),
    alignItems: "center",
  },
  inputWrapper: {
    marginTop: Platform.OS === "ios" ? verticalScale(40) : verticalScale(40),
    gap: verticalScale(8),
  },
  inputContainer: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical:
      Platform.OS === "ios" ? verticalScale(10) : verticalScale(0),
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(10),
  },
  hashText: {
    fontSize: 32,
    color: COLORS.grey,
  },
  textInput: {
    fontFamily: FONTS.MontserratSemiBold,
    fontSize: 32,
    color: COLORS.darkText,
    width: "80%",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  button: {
    marginTop: verticalScale(30),
  },
  signInText: {
    textAlign: "center",
    marginBottom: verticalScale(6),
  },
});

export default styles;
