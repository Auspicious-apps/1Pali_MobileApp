import { Image, StyleSheet, Text, View } from 'react-native'
import React, { FC, useEffect } from 'react'
import COLORS from '../../utils/Colors'
import IMAGES from '../../assets/Images'
import { hp, verticalScale } from '../../utils/Metrics'
import { SplashInitialScreenProps } from '../../typings/routes'
import { Screen } from 'react-native-screens'

const SplashInitial: FC<SplashInitialScreenProps> = ({navigation}) => {

useEffect(() => {
  const timer = setTimeout(() => {
    navigation.replace('OnBoardingStack', {screen:"splash"})
  }, 1000); 

  return () => clearTimeout(timer);
}, []);
    

  return (
    <View style={styles.container}>
      <Image source={IMAGES.SplashInitial} style={styles.image} />
    </View>
  );
};

export default SplashInitial

const styles = StyleSheet.create({
    container: {
        flex:1 ,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor: COLORS.appBackground
    },
    image:{
        width:"100%",
        height: verticalScale(132),
        resizeMode:"contain"
    }
})    