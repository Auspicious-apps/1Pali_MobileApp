import { Platform, StyleSheet } from "react-native";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale, wp } from "../../utils/Metrics";

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
    marginTop: verticalScale(15),
  },

  header: {
    width: wp(90),
    flexDirection: "row",
    marginTop: Platform.OS === "android" ? verticalScale(15) : verticalScale(0),
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: horizontalScale(54),
    height: verticalScale(54),
    resizeMode: "contain",
  },

  headingContainer: {
    marginTop: verticalScale(45),
    alignItems: "center",
  },
});

export default styles;
