import { Image, ImageStyle, StyleProp } from "react-native";
import React from "react";
import BADGES from "../assets/badges";

type BadgeKey = keyof typeof BADGES;

type BadgeIconProps = {
  badge: string;
  locked?: boolean;
  style?: StyleProp<ImageStyle>;
};

const BadgeIcon: React.FC<BadgeIconProps> = ({
  badge,
  locked = false,
  style,
}) => {
  const baseKey = badge?.toLowerCase();

  const badgeKey = locked ? `${baseKey}Locked` : baseKey;

  const source = BADGES[badgeKey as BadgeKey];

  if (!source) {
    console.warn("Badge not found:", badgeKey);
    return null;
  }

  return <Image source={source} style={style} />;
};

export default BadgeIcon;
