import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Mask, Path, Rect } from "react-native-svg";

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
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `
    M ${x} ${y}
    L ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
    Z
  `;
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

  const angle = (percentage / 100) * 360;

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
        <Defs>
          <Mask id="mask">
            {/* Everything visible by default */}
            <Rect
              x="0"
              y="0"
              width={effectiveSize}
              height={effectiveSize}
              fill="white"
            />

            {/* This arc becomes transparent (black removes) */}
            {percentage > 0 && (
              <Path
                d={describeArc(radius, radius, adjustedRadius, 0, angle)}
                fill="black"
              />
            )}
          </Mask>
        </Defs>

        {/* Full Circle with mask applied */}
        <Circle
          cx={radius}
          cy={radius}
          r={adjustedRadius}
          fill={color}
          mask="url(#mask)"
        />
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
