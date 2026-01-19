import { Image, StyleSheet, Text, View } from 'react-native'
import React, { FC, useEffect } from 'react'
import { CustomText } from '../../components/CustomText'
import IMAGES from '../../assets/Images';
import { hp, verticalScale, wp } from '../../utils/Metrics';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../utils/Colors';
import { SplashScreenProps } from '../../typings/routes';
import PrimaryButton from '../../components/PrimaryButton';
import ICONS from '../../assets/Icons';

const Splash: FC<SplashScreenProps> = ({ navigation }) => {

    // useEffect(() => {
    //   const timer = setTimeout(() => {
    //     navigation.replace('OnBoardingStack' , { screen: 'onboarding' });
    //   }, 1000000000);

    //   return () => clearTimeout(timer);
    // }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.innerContainer}>
        <View style={styles.contentContainer}>
          <Image
            source={IMAGES.OnePaliLogo}
            style={styles.logo}
          />
          <View style={styles.titleContainer}>
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={32}
              color={COLORS.darkText}
              style={styles.titleText}
            >
              OnePali
            </CustomText>
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={20}
              color={COLORS.lightPurple}
              style={styles.subtitleText}
            >
              One cause. One million supporters.
            </CustomText>
          </View>
          <View style={styles.globalImageContainer}>
            <Image
              source={IMAGES.GlobalImage}
              style={styles.globalImage}
            />
          </View>

          <View style={styles.dividerRow}>
            <View
              style={styles.dividerLine}
            />
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={16}
              color={COLORS.greyText}
              style={styles.collabText}
            >
              In collaboration with
            </CustomText>
            <View
              style={styles.dividerLine}
            />
          </View>
          <View style={styles.partnersRow}>
            <Image
              source={IMAGES.MecaImage}
              style={styles.mecaImage}
            />
            <Image
              source={IMAGES.Paliroot}
              style={styles.palirootImage}
            />
          </View>
        </View>
        <PrimaryButton
          title="Get Started"
          onPress={() => {
            navigation.navigate('OnBoardingStack', { screen: 'onboarding' });
          }}
          style={styles.button}
        />
      </SafeAreaView>
    </View>
  );
};

export default Splash

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: wp(15.5), 
    height: hp(7.1), 
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  titleContainer: {
    gap: hp(0.25), 
    marginTop: verticalScale(32), 
  },
  titleText: {
    textAlign: 'center',
  },
  subtitleText: {
    textAlign: 'center',
  },
  globalImageContainer: {
    marginTop: hp(4),
  },
  globalImage: {
    width: wp(45.6), 
    height: hp(29.3), 
    alignSelf: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3.2),
    marginTop: hp(4.8), 
  },
  dividerLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
    width: wp(20), 
  },
  collabText: {
    textAlign: 'center',
    lineHeight: hp(2.7), 
  },
  partnersRow: {
    flexDirection: 'row',
    gap: wp(7.7), 
    marginTop: hp(1), 
  },
  mecaImage: {
    width: wp(36), 
    height: hp(6), 
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  palirootImage: {
    width: wp(35.7), 
    height: hp(3.3), 
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  button: {
    marginTop: hp(2.5), 
  },
});