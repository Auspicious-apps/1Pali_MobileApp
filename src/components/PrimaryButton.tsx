import React, { FC } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import COLORS from '../utils/Colors';
import { horizontalScale, verticalScale, wp } from '../utils/Metrics';
import CustomIcon from './CustomIcon';
import { CustomText } from './CustomText';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  textColor?: string;
  style?: ViewStyle;
  disabled?: boolean;
  textSize?: number;
  isFullWidth?: boolean;
  textStyle?: TextStyle;
  isLoading?: boolean;
  leftIcon?: {
    Icon: any;
    height?: number;
    width?: number;
  };
  loaderColor?: string;
  isTranslate?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

const PrimaryButton: FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  textColor = COLORS.white,
  style,
  textSize = 16,
  isFullWidth = true,
  textStyle,
  isLoading = false,
  leftIcon,
  loaderColor = COLORS.white,
  isTranslate = true,
  accessibilityLabel,
  testID,
}) => {
  const backgroundColor = disabled ? '#E5E7EF' : '#1D222B';

  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.button,
        isFullWidth && styles.fullWidth,
        { backgroundColor },
        style,
      ]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={loaderColor} />
        ) : (
          <View style={styles.row}>
            {leftIcon && (
              <CustomIcon
                Icon={leftIcon.Icon}
                height={leftIcon.height || 16}
                width={leftIcon.width || 16}
              />
            )}
            <CustomText
              fontFamily="MontserratSemiBold"
              fontSize={textSize}
              color={disabled ? '#FFFFFF' : textColor}
              style={textStyle}
              isTranslate={isTranslate}
            >
              {title}
            </CustomText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: verticalScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: wp(90),
    alignSelf: 'center',
  },
  contentContainer: {
    minHeight: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },
});

export default PrimaryButton;
