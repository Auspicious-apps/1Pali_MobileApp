import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${x} ${y}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
};

interface Props {
  percentage: number;
  size?: number;
  color?: string;
  borderWidth?: number;
}

const CircularOverlay = ({
  percentage,
  size = 40,
  color = "#1d222bcc",
  borderWidth = 0,
}: Props) => {
  const inset = 3;

  const effectiveSize = size - inset * 2;
  const radius = effectiveSize / 2;
  const adjustedRadius = radius - borderWidth / 2;

  const invertedPercentage = 100 - percentage;
  const angle = (invertedPercentage / 100) * 360;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.overlay,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          padding: inset,
        },
      ]}
    >
      <Svg
        width={effectiveSize}
        height={effectiveSize}
        viewBox={`0 0 ${effectiveSize} ${effectiveSize}`}
      >
        <Circle cx={radius} cy={radius} r={adjustedRadius} fill="transparent" />

        {percentage > 0 && (
          <Path
            d={describeArc(radius, radius, adjustedRadius, 0, angle)}
            fill={color}
          />
        )}
      </Svg>
    </View>
  );
};

export default CircularOverlay;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});
