import React, { FC } from 'react';
import { Image, StyleSheet, Touchable, TouchableOpacity, View } from 'react-native';
import { PrivacyPolicyScreenProps, TermsConditionsScreenProps } from '../../typings/routes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { horizontalScale, verticalScale } from '../../utils/Metrics';
import CustomIcon from '../../components/CustomIcon';
import ICONS from '../../assets/Icons';
import IMAGES from '../../assets/Images';
import { CustomText } from '../../components/CustomText';
import COLORS from '../../utils/Colors';

const PrivacyPolicy: FC<PrivacyPolicyScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.side}>
            <TouchableOpacity
              onPress={() => navigation.navigate('account')}
              activeOpacity={0.8}
            >
              <CustomIcon Icon={ICONS.backArrow} height={24} width={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.center}>
            <Image source={IMAGES.OnePaliLogo} style={styles.logo} />
          </View>

          <View style={styles.side} />
        </View>
        <View
          style={{
            marginTop: verticalScale(32),
            alignItems: 'center',
            gap: verticalScale(24),
          }}
        >
          {/* Privacy Policy content goes here */}
          <CustomText
            fontFamily="GabaritoSemiBold"
            fontSize={32}
            color={COLORS.darkText}
          >
            Privacy Policy
          </CustomText>
          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={14}
            color={COLORS.appText}
            style={{ textAlign: 'center' }}
          >
            Your use of OnePali is subject to these terms, our Privacy Policy,
            and all applicable laws. We reserve the right to modify these
            terms.Your use of OnePali is subject to these terms, our Privacy
            Policy, and all applicable laws. We reserve the right to modify
            these terms.Your use of OnePali is subject to these terms, our
            Privacy Policy, and all applicable laws. We reserve the right to
            modify these terms.Your use of OnePali is subject to these terms,
            our Privacy Policy, and all applicable laws. We reserve the right to
            modify these terms.Your use of OnePali is subject to these terms,
            our Privacy Policy, and all applicable laws. We reserve the right to
            modify these terms.
          </CustomText>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  logo: {
    width: horizontalScale(100),
    height: verticalScale(59),
  },
  header: {
    width: '100%',
    flexDirection: 'row',
  },
  side: {
    width: horizontalScale(40),
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
});
