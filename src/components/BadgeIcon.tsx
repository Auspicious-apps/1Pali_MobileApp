import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import BADGES from "../assets/badges";

type BadgeKey = keyof typeof BADGES;

type BadgeIconProps = {
  badge: string;
  style: StyleProp<ImageStyle> | any;
};

const BadgeIcon: React.FC<BadgeIconProps> = ({ badge, style }) => {
  return (
    <Image
      source={BADGES[badge?.toLowerCase() as keyof typeof BADGES]}
      style={style}
    />
  );
};

export default BadgeIcon;
