import {
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import COLORS from '../utils/Colors';
import { CustomText } from './CustomText';

interface CustomMaskedTextProps {
  text: string;
  colors?: string[];
  style?: ViewStyle;
  textStyle?: StyleProp<TextStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const CustomMaskedText: React.FC<CustomMaskedTextProps> = ({
  text,
  colors = [COLORS.Linear,COLORS.Pink],
  style,
  textStyle,
  start,
  end,
}) => {
  return (
    <View style={styles.wrapper}>
      <MaskedView
        style={[styles.maskedView, style]}
        maskElement={
          <CustomText
            style={[
              styles.maskText,
              textStyle,
              { backgroundColor: 'transparent' },
            ]}
          >
            {text}
          </CustomText>
        }
      >
        <LinearGradient
          colors={colors}
          style={{ backgroundColor: 'transparent' }}
          {...(start && { start })}
          {...(end && { end })}
        >
          <CustomText
            style={[
              styles.maskText,
              textStyle,
              { opacity: 0, backgroundColor: 'transparent' },
            ]}
          >
            {text}
          </CustomText>
        </LinearGradient>
      </MaskedView>
    </View>
  );
};

export default CustomMaskedText;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
  },
  maskedView: {
    backgroundColor: 'transparent',
  },
  maskText: {
    backgroundColor: 'transparent',
  },
});
