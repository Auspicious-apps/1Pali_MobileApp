import React, { useRef, useEffect } from "react";
import { View, Animated, PanResponder } from "react-native";
import COLORS from "../utils/Colors";
import { horizontalScale, verticalScale } from "../utils/Metrics";
import CustomIcon from "./CustomIcon";
import ICONS from "../assets/Icons";
import LinearGradient from "react-native-linear-gradient";

const TRACK_WIDTH = horizontalScale(320);
const POINTER_SIZE = horizontalScale(12);
const ICON_SIZE = horizontalScale(48);
const TRACK_PADDING = 4;

const INNER_WIDTH = TRACK_WIDTH - TRACK_PADDING * 2;

interface Props {
  value: number;
  onChange: (val: number) => void;
}

const DonationSlider: React.FC<Props> = ({ value, onChange }) => {
  const pan = useRef(new Animated.Value(0)).current;

  // 👉 Sync UI when parent value changes
  useEffect(() => {
    const maxX = INNER_WIDTH - POINTER_SIZE;
    const percentage = (value - 1) / (30 - 1);
    const newX = percentage * maxX;

    pan.setValue(newX);
  }, [value]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        let newX = gesture.moveX - 40 - TRACK_PADDING;

        const minX = 0;
        const maxX = INNER_WIDTH - POINTER_SIZE;

        if (newX < minX) newX = minX;
        if (newX > maxX) newX = maxX;

        pan.setValue(newX);
        const percentage = Math.min(1, Math.max(0, newX / maxX));
        const newValue = Math.round(1 + percentage * (30 - 1));
        const clampedValue = Math.min(30, Math.max(1, newValue));

        onChange(clampedValue);
      },
    }),
  ).current;

  const progressWidth = Animated.add(
    pan,
    new Animated.Value(POINTER_SIZE + TRACK_PADDING),
  );

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: TRACK_WIDTH }}>
        {/* ICON */}
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            position: "absolute",
            left: TRACK_PADDING,
            transform: [
              {
                translateX: Animated.add(
                  pan,
                  new Animated.Value(POINTER_SIZE / 2 - ICON_SIZE / 2),
                ),
              },
            ],
            top: "50%",
            marginTop: -ICON_SIZE / 2,
            zIndex: 2,
          }}
        >
          <View
            style={{
              height: ICON_SIZE,
              width: ICON_SIZE,
              borderRadius: ICON_SIZE,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CustomIcon Icon={ICONS.SliderBarHeart} height={36} width={36} />
          </View>
        </Animated.View>

        {/* TRACK */}
        <View
          style={{
            width: TRACK_WIDTH,
            height: verticalScale(20),
            borderRadius: 50,
            overflow: "hidden",
            backgroundColor: COLORS.appBackground,
          }}
          {...panResponder.panHandlers}
        >
          {/* GRADIENT PROGRESS */}
          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              width: progressWidth,
              top: 0,
              bottom: 0,
            }}
          >
            <LinearGradient
              colors={["#1B7A4B", "#1B7A4B", "#2ECC71"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>

          {/* INNER SHADOW LAYER */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 50,
              overflow: "hidden",
            }}
          >
            {/* TOP + BOTTOM */}
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.08)",
                "transparent",
                "transparent",
                "rgba(0,0,0,0.08)",
              ]}
              locations={[0, 0.2, 0.8, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
              }}
            />

            {/* RIGHT SIDE ONLY */}
            <LinearGradient
              colors={["transparent", "transparent", "rgba(0,0,0,0.12)"]}
              locations={[0, 0.85, 1]}
              start={{ x: 0.83, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default DonationSlider;
