import React from "react";
import { Image, ImageStyle, StyleProp, StyleSheet, View } from "react-native";
import { Grayscale } from "react-native-color-matrix-image-filters";
import BADGES from "../assets/badges";

type BadgeKey = keyof typeof BADGES;

type BadgeIconProps = {
  badge: string;
  locked?: boolean;
  style?: StyleProp<ImageStyle>;
};

const BORDER = 6;

const BadgeIcon: React.FC<BadgeIconProps> = ({
  badge,
  locked = false,
  style,
}) => {
  const baseKey = badge?.toLowerCase();
  const source = BADGES[baseKey as BadgeKey];

  if (!source) {
    return null;
  }

  //  safely extract dynamic size (TS safe)
  const flatStyle = StyleSheet.flatten(style) || {};
  const size = typeof flatStyle?.width === "number" ? flatStyle.width : 94;

  //  UNLOCKED → simple image
  if (!locked) {
    return <Image source={source} style={style} />;
  }

  //  LOCKED → grayscale + overlay (perfect circle)
  return (
    <View
      style={[
        styles.outerCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Grayscale>
        <Image source={source} style={[styles.image, style]} />
      </Grayscale>

      <View
        style={[
          styles.overlay,
          {
            top: BORDER,
            bottom: BORDER,
            left: BORDER,
            right: BORDER,
            borderRadius: size / 2,
          },
        ]}
      />
    </View>
  );
};

export default BadgeIcon;

const styles = StyleSheet.create({
  outerCircle: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  innerCircle: {
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  overlay: {
    position: "absolute",
    backgroundColor: "rgba(25,30,40,0.55)",
  },
});
