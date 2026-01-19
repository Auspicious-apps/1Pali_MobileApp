import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const isTablet = Math.min(deviceWidth, deviceHeight) >= 600;

// Scaling functions
const horizontalScale = (size: number) =>
  (deviceWidth / guidelineBaseWidth) * size;

const verticalScale = (size: number) =>
  (deviceHeight / guidelineBaseHeight) * size;

const responsiveFontSize = (size: number) => {
  const factor = 0.5;
  return size + (horizontalScale(size) - size) * factor;
};

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

const deviceSpecificSize = (
  tabletSize: number,
  mobileSize: number,
  isTablet: boolean,
) => {
  return isTablet ? tabletSize : mobileSize;
};

// Functions to calculate percentage-based dimensions
const wp = (widthPercent: string | number) => {
  const elemWidth =
    typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((deviceWidth * elemWidth) / 100);
};

const hp = (heightPercent: string | number) => {
  const elemHeight =
    typeof heightPercent === 'number'
      ? heightPercent
      : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((deviceHeight * elemHeight) / 100);
};

export {
  deviceHeight,
  deviceSpecificSize,
  deviceWidth,
  horizontalScale,
  hp,
  responsiveFontSize,
  verticalScale,
  wp,
  isAndroid,
  isIOS,
  isTablet,
};
