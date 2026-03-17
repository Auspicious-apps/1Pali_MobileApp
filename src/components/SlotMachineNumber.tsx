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
  const finalNumber = String(number).padStart(6, "0").split("");

  const [digits, setDigits] = useState(["0", "0", "0", "0", "0", "0"]);
  const [finished, setFinished] = useState(false);

  const colorAnim = useRef(
    [...Array(6)].map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    setFinished(false);

    const intervals: any[] = [];

    finalNumber.forEach((digit, index) => {
      let spinCount = 0;

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

          Animated.timing(colorAnim[index], {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }).start();

          // when last digit revealed
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

  return (
    <View style={styles.container}>
      <CustomText style={styles.label}>Your number is</CustomText>

      <View style={styles.row}>
        <Animated.Text
          style={[
            styles.hash,
            {
              color: colorAnim[0].interpolate({
                inputRange: [0, 1],
                outputRange: [COLORS.grey, COLORS.darkText],
              }),
            },
          ]}
        >
          #
        </Animated.Text>

        {digits.map((digit, index) => {
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
          {"Every number is a stand for \n Palestine"}
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
    marginTop: verticalScale(20),
    textAlign:"center"
  },
});
