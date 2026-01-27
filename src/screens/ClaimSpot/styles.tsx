import { Platform, StyleSheet } from "react-native";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale } from "../../utils/Metrics";
import FONTS from "../../assets/fonts";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: horizontalScale(20),
  },
  keyboardView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? verticalScale(10) : verticalScale(20),
    paddingBottom: verticalScale(10),
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
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
    marginBottom: Platform.OS === "ios" ? verticalScale(10) : verticalScale(0),
  },
  signInText: {
    textAlign: "center",
  },
});

export default styles;
