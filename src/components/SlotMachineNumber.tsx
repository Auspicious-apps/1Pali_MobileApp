import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { CustomText } from "./CustomText";
import FONTS from "../assets/fonts";
import COLORS from "../utils/Colors";
import { responsiveFontSize, verticalScale } from "../utils/Metrics";

interface Props {
  number: number;
  onRevealComplete?: () => void;
}

export function SlotMachineNumber({ number, onRevealComplete }: Props) {
  const paddedNumber = String(number).padStart(6, "0").split("");
  const [digits, setDigits] = useState(["0", "0", "0", "0", "0", "0"]);
  const [finished, setFinished] = useState(false);
  const [visibleSlots, setVisibleSlots] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const colorAnim = useRef(
    [...Array(6)].map(() => new Animated.Value(0)),
  ).current;

  // 1. Create a separate animated value for the Hash
  const hashColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFinished(false);
    hashColorAnim.setValue(0); // Reset hash color
    const intervals: any[] = [];

    paddedNumber.forEach((digit, index) => {
      let spinCount = 0;

      setVisibleSlots((prev) => {
        const copy = [...prev];
        copy[index] = true;
        return copy;
      });

      const interval = setInterval(() => {
        spinCount++;
        setDigits((prev) => {
          const copy = [...prev];
          copy[index] = Math.floor(Math.random() * 10).toString();
          return copy;
        });

        if (spinCount > 20 + index * 6) {
          clearInterval(interval);
          setDigits((prev) => {
            const copy = [...prev];
            copy[index] = digit;
            return copy;
          });

          const isLeadingZero = paddedNumber
            .slice(0, index + 1)
            .every((d) => d === "0");
          const isFirstNonZero =
            !isLeadingZero && (index === 0 || paddedNumber[index - 1] === "0");

          // 2. If this is the first digit that stays visible, animate the Hash color too
          if (!isLeadingZero || index === paddedNumber.length - 1) {
            Animated.timing(hashColorAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: false,
            }).start();
          }

          if (isLeadingZero && index < paddedNumber.length - 1) {
            setVisibleSlots((prev) => {
              const copy = [...prev];
              copy[index] = false;
              return copy;
            });
          }

          Animated.timing(colorAnim[index], {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }).start();

          if (index === 5) {
            setFinished(true);
            onRevealComplete?.();
          }
        }
      }, 70);

      intervals.push(interval);
    });

    return () => intervals.forEach(clearInterval);
  }, [number]);

  // 3. Interpolate the Hash color
  const hashColor = hashColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.grey, COLORS.darkText],
  });

  return (
    <View style={styles.container}>
      <CustomText style={styles.label}>Your number is</CustomText>

      <View style={styles.row}>
        {/* Animated Hash */}
        <Animated.Text style={[styles.hash, { color: hashColor }]}>
          #
        </Animated.Text>

        {digits.map((digit, index) => {
          if (!visibleSlots[index]) return null;

          const color = colorAnim[index].interpolate({
            inputRange: [0, 1],
            outputRange: [COLORS.grey, COLORS.darkText],
          });

          return (
            <Animated.Text key={index} style={[styles.number, { color }]}>
              {digit}
            </Animated.Text>
          );
        })}
      </View>

      {finished && (
        <CustomText style={styles.subtext}>
          {"One of a million supporters"}
        </CustomText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  label: {
    fontFamily: FONTS.GabaritoRegular,
    fontSize: responsiveFontSize(18),
    color: COLORS.appText,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  hash: {
    fontFamily: FONTS.GabaritoSemiBold,
    fontSize: responsiveFontSize(72),
  },

  number: {
    fontFamily: FONTS.GabaritoSemiBold,
    fontSize: responsiveFontSize(72),
  },

  subtext: {
    fontFamily: FONTS.GabaritoSemiBold,
    fontSize: responsiveFontSize(22),
    color: COLORS.darkText,
    marginTop: verticalScale(8),
    textAlign: "center",
  },
});
