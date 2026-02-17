import { View, StyleSheet } from 'react-native';
import React from 'react';
import { BaseToastProps } from 'react-native-toast-message';
import COLORS from '../utils/Colors';
import ICONS from '../assets/Icons';
import CustomIcon from './CustomIcon';
import { horizontalScale } from '../utils/Metrics';
import { CustomText } from './CustomText';

const getStylesByType = (type: string) => {
  switch (type) {
    case 'success':
      return {
        container: {
          backgroundColor: COLORS.green,
          borderColor: COLORS.Linear,
        },
        icon: ICONS.LikedIcon,
      };
    case 'error':
      return {
        container: {
          backgroundColor: '#FF3B30',
          borderColor: '#FF5F4E',
        },
        icon: ICONS.RedClose,
      };
    case 'inAppNotification':
      return {
        container: {
          backgroundColor: COLORS.Linear,
          borderColor: COLORS.borderColor,
        },
        icon: ICONS.LikedIcon,
      };
    case 'info':
    default:
      return {
        container: {
          backgroundColor: COLORS.Linear,
          borderColor: COLORS.borderColor,
        },
        icon: ICONS.LikedIcon,
      };
  }
};

const CustomToast = ({ text1, text2, type, props }: BaseToastProps & { type?: string }) => {
  const toastType = type || 'info';
  const { container, icon } = getStylesByType(toastType);
  const displayIcon = props?.icon || icon;

  return (
    <View style={[styles.toastContainer, container]}>
      <CustomIcon Icon={displayIcon} height={24} width={24} />
      <View style={styles.textContainer}>
        <CustomText fontFamily="GabaritoMedium" style={styles.toastTitle}>
          {text1}
        </CustomText>
        {text2 && (
          <CustomText fontFamily="GabaritoMedium" style={styles.toastBody}>
            {text2}
          </CustomText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    gap: horizontalScale(10),
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
    marginTop: 20,
    zIndex: 1000,
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  toastTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  toastBody: {
    color: COLORS.white,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
  toastText: {
    color: COLORS.white,
    fontSize: 16,
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default CustomToast;
