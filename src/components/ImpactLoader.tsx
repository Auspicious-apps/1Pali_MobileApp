import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import LOTTIES from "../assets/lotties";
import { useAppSelector } from "../redux/store";
import COLORS from "../utils/Colors";
import { horizontalScale, verticalScale } from "../utils/Metrics";
import { CustomText } from "./CustomText";

const ImpactLoader = () => {
  const { claimedNumber } = useAppSelector((state) => state.user);
  return (
    <View style={styles.container}>
      <LottieView
        source={LOTTIES.logoLoading}
        style={styles.logo}
        speed={0.8}
        autoPlay
        loop
      />
      <View style={{ alignItems: "center", marginTop: verticalScale(20) }}>
        <CustomText
          fontFamily="GabaritoSemiBold"
          fontSize={63}
          color={COLORS.darkText}
          style={{ textAlign: "center" }}
        >
          {`#${claimedNumber || 100}`}
        </CustomText>
        <CustomText
          fontFamily="GabaritoMedium"
          fontSize={20}
          color={COLORS.darkText}
          style={{ textAlign: "center" }}
        >
          Thank you for supporting Palestine
        </CustomText>
        {/* <View style={{ marginTop: verticalScale(32), gap: verticalScale(12) }}>
          <ActivityIndicator color={COLORS.appText} size={"small"} />
        </View> */}
      </View>
    </View>
  );
};

export default ImpactLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.appBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: horizontalScale(100),
    height: verticalScale(100),
    resizeMode: "contain",
    alignSelf: "center",
  },
});
