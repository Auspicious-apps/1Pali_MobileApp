import { Platform, StyleSheet } from 'react-native';
import COLORS from '../../utils/Colors';
import { horizontalScale, verticalScale } from '../../utils/Metrics';
import FONTS from '../../assets/fonts';

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
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: horizontalScale(100),
    height: verticalScale(59),
  },
  headingContainer: {
    marginTop: verticalScale(50),
    gap: verticalScale(8),
    alignItems: 'center',
  },
  inputWrapper: {
    gap: verticalScale(8),
  },
  inputContainer: {
    paddingHorizontal: horizontalScale(14),
    paddingVertical:Platform.OS === 'ios' ? verticalScale(10) : verticalScale(0),
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    marginTop: verticalScale(40),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
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
    width: '80%',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    marginBottom: verticalScale(10),
  },
});

export default styles;
