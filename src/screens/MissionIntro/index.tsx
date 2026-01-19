import { View, Text, Image, Animated, Easing } from 'react-native'
import React, { FC, useEffect, useRef, useState, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import IMAGES from '../../assets/Images';
import styles from './styles';
import { CustomText } from '../../components/CustomText';
import COLORS from '../../utils/Colors';
import { MissionIntroProps } from '../../typings/routes';
import { hp, verticalScale, wp } from '../../utils/Metrics';
import PrimaryButton from '../../components/PrimaryButton';
import ICONS from '../../assets/Icons';

const heading = 'Join OnePali';
const initialTimer = 60;
const subheadingBase = "Number #";
const disclaimer = "By joining OnePali, you accept our Terms of Use and Privacy Policy";


const MissionIntro: FC<MissionIntroProps> = ({ navigation, route }) => {
  // Memoize letter arrays so they never change between renders
  const headingLetters = useMemo(() => heading.split("").map((l) => l === " " ? "\u00A0" : l), []); // use non-breaking space for spaces
  const [timer, setTimer] = useState(initialTimer);
  const [timerStarted, setTimerStarted] = useState(false);
  const number = route?.params?.number || "1948";
  const subheading = `${subheadingBase}${number} reserved for ${timer}s`;
  const subheadingLetters = useMemo(() => subheading.split("").map((l) => l === " " ? "\u00A0" : l), [subheading]);
  const disclaimerLetters = useMemo(() => disclaimer.split("").map((l) => l === " " ? "\u00A0" : l), []);

  // Animation refs for each letter in each line (created only once)
  const headingLetterAnims = useRef(headingLetters.map(() => new Animated.Value(100))).current;
  const subheadingLetterAnims = useRef(subheadingLetters.map(() => new Animated.Value(100))).current;
  const disclaimerLetterAnims = useRef(disclaimerLetters.map(() => new Animated.Value(100))).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  // For controlling when to show each element
  const [showSubheading, setShowSubheading] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    // Animation timings for letters
    const letterDuration = 220;
    const letterDelay = 20;

    // Animate heading letters
    Animated.stagger(letterDelay, headingLetterAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 0,
        duration: letterDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    )).start(() => {
      setShowSubheading(true);
      // Animate subheading letters
      Animated.stagger(letterDelay, subheadingLetterAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: letterDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )).start(() => {
        setShowImage(true);
        // Animate image
        Animated.timing(imageAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowButton(true);
          // Animate button
          Animated.timing(buttonAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowDisclaimer(true);
            // Animate disclaimer letters
            Animated.stagger(letterDelay, disclaimerLetterAnims.map((anim) =>
              Animated.timing(anim, {
                toValue: 0,
                duration: letterDuration,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              })
            )).start(() => {
              setTimerStarted(true);
            });
          });
        });
      });
    });
  }, []);

  // Timer countdown effect (must be a separate effect)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timerStarted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStarted, timer]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Image source={IMAGES.OnePaliLogo} style={styles.logo} />
        <View style={styles.headingContainer}>
          {/* Heading letters */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {headingLetters.map((letter, i) => (
              <Animated.View
                key={i}
                style={{
                  transform: [{ translateX: headingLetterAnims[i] ?? 0 }],
                  opacity: headingLetterAnims[i].interpolate({ inputRange: [0, 100], outputRange: [1, 0] }),
                }}
              >
                <CustomText
                  fontFamily="GabaritoSemiBold"
                  fontSize={42}
                  color={COLORS.darkText}
                >
                  {letter}
                </CustomText>
              </Animated.View>
            ))}
          </View>
          {/* Subheading letters */}
          {showSubheading && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
              {subheadingLetters.map((letter, i) => (
                <Animated.View
                  key={i}
                  style={{
                    transform: [{ translateX: subheadingLetterAnims[i] ?? 0 }],
                    opacity: subheadingLetterAnims[i].interpolate({ inputRange: [0, 100], outputRange: [1, 0] }),
                  }}
                >
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={16}
                    color={COLORS.appText}
                    style={{ textAlign: 'center' }}
                  >
                    {letter}
                  </CustomText>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
        <View style={{ marginTop: verticalScale(20) }}>
          {showImage && (
            <Animated.Image
              source={IMAGES.MissionImage}
              resizeMode="cover"
              style={{
                width: wp(73),
                height: hp(42),
                opacity: imageAnim,
                transform: [{ scale: imageAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
              }}
            />
          )}
        </View>
        <View style={{ alignItems: 'center' }}>
          {showButton && (
            <Animated.View
              style={{
                opacity: buttonAnim,
                transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              }}
            >
              <PrimaryButton
                title="Sign up with Apple"
                leftIcon={{
                  Icon: ICONS.AppleLogo,
                  height: 22,
                  width: 16,
                }}
                onPress={() => {
                  navigation.navigate('joinOnePali' , { number });
                }}
                style={{ marginTop: verticalScale(20) }}
              />
            </Animated.View>
          )}
          {showDisclaimer && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: wp(50), marginTop: verticalScale(15) }}>
              {disclaimerLetters.map((letter, i) => (
                <Animated.View
                  key={i}
                  style={{
                    transform: [{ translateX: disclaimerLetterAnims[i] ?? 0 }],
                    opacity: disclaimerLetterAnims[i].interpolate({ inputRange: [0, 100], outputRange: [1, 0] }),
                  }}
                >
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={12}
                    color={COLORS.grayColor}
                    style={{ textAlign: 'center' }}
                  >
                    {letter}
                  </CustomText>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

export default MissionIntro;