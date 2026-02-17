import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import IMAGES from '../assets/Images'
import { horizontalScale, verticalScale } from '../utils/Metrics'
import COLORS from '../utils/Colors'
import { CustomText } from './CustomText'

const ImpactLoader = () => {
  return (
    <View style={styles.container}>
      <Image
        source={IMAGES.OnePaliLogo}
        resizeMode="contain"
        style={styles.logo}
      />
      <View style={{ alignItems: "center", marginTop: verticalScale(54) }}>
        <CustomText
          fontFamily="GabaritoSemiBold"
          fontSize={32}
          color={COLORS.darkText}
          style={{textAlign:"center"}}
        >
          {"Thank you for\nsupporting Palestine"}
        </CustomText>
        <View style={{marginTop: verticalScale(24),gap: verticalScale(12)}}>
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={18}
            color={COLORS.appText}
          >
            Setting things up...
          </CustomText>
          <ActivityIndicator color={COLORS.appText} size={"small"} />
        </View>
      </View>
    </View>
  );
}

export default ImpactLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.appBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: horizontalScale(64),
    height: verticalScale(64),
    resizeMode: "contain",
    alignSelf: "center",
  },
});