import { useTranslation } from "react-i18next";
import { Text, type TextProps } from "react-native";
import FONTS, { FontFamilyType } from "../assets/fonts";
import COLORS from "../utils/Colors";
import { responsiveFontSize } from "../utils/Metrics";

export type CustomTextProps = TextProps & {
  values?: Record<string, any>; // interpolation values
  color?: string;
  fontFamily?: FontFamilyType;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  isTranslate?: boolean;
};

export function CustomText({
  style,
  values,
  fontFamily = "regular",
  fontSize = 16,
  color = COLORS.white,
  lineHeight,
  children,
  isTranslate = true,
  ...rest
}: CustomTextProps) {
  const { t } = useTranslation();
  const resolvedFontSize = responsiveFontSize(fontSize);

  // Process children safely
  let processedChildren = children;
  if (typeof children === "string" && isTranslate) {
    try {
      processedChildren = t(children, values);
    } catch (error) {
      console.warn("Translation error for:", children, error);
      processedChildren = children;
    }
  }

  return (
    <Text
      maxFontSizeMultiplier={1}
      allowFontScaling={false}
      accessible={true}
      accessibilityRole="text"
      style={[
        {
          color,
          fontFamily: FONTS[fontFamily],
          fontSize: resolvedFontSize,
          lineHeight: lineHeight ?? Math.round(resolvedFontSize * 1.2),
          opacity: rest.disabled ? 0.7 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {processedChildren}
    </Text>
  );
}
