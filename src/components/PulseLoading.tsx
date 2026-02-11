import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import COLORS from "../utils/Colors";

const Pulse = ({ style }:any) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return <Animated.View style={[styles.pulse, style, { opacity }]} />;
};

const styles = StyleSheet.create({
  pulse: {
    backgroundColor: COLORS.greyBackground,
  },
});

export default Pulse;
