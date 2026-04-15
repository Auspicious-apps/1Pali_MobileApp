import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import FONTS from "../assets/fonts";
import COLORS from "../utils/Colors";
import {
  horizontalScale,
  responsiveFontSize,
  verticalScale,
} from "../utils/Metrics";
import { CustomText } from "./CustomText";

interface Props {
  number: number;
  onRevealComplete?: () => void;
  isRevealed?: boolean;
}

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export function SlotMachineNumber({
  number,
  onRevealComplete,
  isRevealed,
}: Props) {
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
  const hashColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFinished(false);
    hashColorAnim.setValue(0);
    const intervals: any[] = [];

    // [ ] Scramble begins: Single Light tap
    ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);

    paddedNumber.forEach((digit, index) => {
      let spinCount = 0;
      // Timing: ~300ms for first, then ~1000ms (14 ticks * 70ms) for others
      const lockThreshold = 4 + index * 10;

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

        if (spinCount >= lockThreshold) {
          clearInterval(interval);

          // [ ] Haptic Lock Logic
          if (index === 5) {
            // [ ] Final digit locks: Heavy
            ReactNativeHapticFeedback.trigger("impactHeavy", hapticOptions);
          } else {
            // [ ] Each digit locks (1-5): Medium
            ReactNativeHapticFeedback.trigger("impactMedium", hapticOptions);
          }

          setDigits((prev) => {
            const copy = [...prev];
            copy[index] = digit;
            return copy;
          });

          // Logic to hide leading zeros
          const isLeadingZero = paddedNumber
            .slice(0, index + 1)
            .every((d) => d === "0");

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

            // [ ] Emotional hook fades in: Light haptic
            setTimeout(() => {
              ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);
              onRevealComplete?.();
            }, 150);
          }
        }
      }, 50);

      intervals.push(interval);
    });

    return () => intervals.forEach(clearInterval);
  }, [number]);

  const hashColor = hashColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.grey, COLORS.darkText],
  });

  return (
    <View style={styles.container}>
      <CustomText style={[styles.label, { textAlign: "center" }]}>
        {/* {isRevealed
          ? "Every supporter has a unique number. \nThis one belongs to you."
          : "You are OnePali supporter"} */}
        OnePali Supporter
      </CustomText>

      <View style={styles.row}>
        <Animated.Text style={[styles.hash, { color: hashColor }]}>
          #
        </Animated.Text>

        {digits.map((digit, index) => {
          const color = colorAnim[index].interpolate({
            inputRange: [0, 1],
            outputRange: [COLORS.grey, COLORS.darkText],
          });

          return (
            <View
              key={index}
              style={[
                styles.digitContainer,
                {
                  width: visibleSlots[index] ? horizontalScale(40) : 0,
                  opacity: visibleSlots[index] ? 1 : 0,
                },
              ]}
            >
              <Animated.Text style={[styles.number, { color }]}>
                {digit}
              </Animated.Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: verticalScale(140),
  },
  label: {
    fontFamily: FONTS.GabaritoRegular,
    fontSize: responsiveFontSize(18),
    color: COLORS.appText,
    marginBottom: verticalScale(4),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  digitContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  hash: {
    fontFamily: FONTS.GabaritoSemiBold,
    fontSize: responsiveFontSize(72),
    marginRight: horizontalScale(2),
  },
  number: {
    fontFamily: FONTS.GabaritoSemiBold,
    fontSize: responsiveFontSize(72),
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
});
