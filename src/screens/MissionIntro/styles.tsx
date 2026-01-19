import { StyleSheet } from "react-native";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale } from "../../utils/Metrics";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
  },
  logo: {
    width: horizontalScale(59),
    height: verticalScale(59),
    resizeMode: 'contain',
  },
  headingContainer: {
    marginTop: verticalScale(45),
    alignItems: 'center',
  },
});

export default styles;