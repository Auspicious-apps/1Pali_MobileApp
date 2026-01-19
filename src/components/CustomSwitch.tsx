  import React, { useState } from 'react';
  import { TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
  import LinearGradient from 'react-native-linear-gradient';
  import COLORS from '../utils/Colors';

  interface CustomSwitchProps {
    value: boolean;
    onValueChange: (newValue: boolean) => void;
    thumbColorOn?: string;
    thumbColorOff?: string;
    trackColorOn?: string[];
    trackColorOff?: string[];
  }

  const CustomSwitch: React.FC<CustomSwitchProps> = ({
    value,
    onValueChange,
    thumbColorOn = COLORS.white,
    thumbColorOff = COLORS.grey,
    trackColorOn = [COLORS.Linear, COLORS.Pink],
    trackColorOff = ['transparent', 'transparent'],
  }) => {
    const [animValue] = useState(new Animated.Value(value ? 1 : 0));

    const toggleSwitch = () => {
      Animated.timing(animValue, {
        toValue: value ? 0 : 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      onValueChange(!value);
    };

    const translateX = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 18],
    });

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleSwitch}
        style={[
          styles.container,
          !value &&
            {
              // borderWidth: 1, borderColor: COLORS.white
            },
        ]}
      >
        <LinearGradient
          colors={value ? trackColorOn : trackColorOff}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0 }}
          style={styles.track}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                transform: [{ translateX }],
                backgroundColor: value ? thumbColorOn : thumbColorOff,
              },
            ]}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      width: Platform.OS === 'ios' ? 51 : 51,
      height: Platform.OS === 'ios' ? 31 : 31,
      borderRadius: 100,
    },
    track: {
      flex: 1,
      borderRadius: 100,
      justifyContent: 'center',
      paddingHorizontal: 1.5,
      // backgroundColor: COLORS.switch,
    },
    thumb: {
      width: 26,
      height: 26,
      borderRadius: 14,
    },
  });

  export default CustomSwitch;
