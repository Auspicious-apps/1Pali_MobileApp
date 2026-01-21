import { View } from 'react-native';
import React, { FC, useEffect, useState, useRef } from 'react';
import { Animated } from 'react-native';
import { CustomText } from '../../components/CustomText';
import COLORS from '../../utils/Colors';
import styles from './styles';
import { OnboardingProps } from '../../typings/routes';


const texts = [
  "1,000,000 people ",
  "donating $1 each",
  "once a month",
  "for Palestine.",
  "This is OnePali.",
];

const LETTER_DELAY = 40;
const HOLD_DURATION = 300;

const Onboarding: FC<OnboardingProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleLetters, setVisibleLetters] = useState(0);
  const letters = texts[currentIndex].split('');
  // Always create a new array of Animated.Values when the text changes
  const opacityAnimsRef = useRef([] as Animated.Value[]);
  if (opacityAnimsRef.current.length !== letters.length) {
    opacityAnimsRef.current = letters.map(() => new Animated.Value(0));
  }
  const opacityAnims = opacityAnimsRef.current;

  useEffect(() => {
    // Reset for new text
    setVisibleLetters(0);
    opacityAnims.forEach(anim => anim.setValue(0));

    // Animate each letter in
    letters.forEach((_, i) => {
      setTimeout(() => {
        Animated.timing(opacityAnims[i], {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }).start();
        setVisibleLetters(i + 1);
      }, i * LETTER_DELAY);
    });

    // Move to next text after all letters + hold
    const totalTime = letters.length * LETTER_DELAY + HOLD_DURATION;
    const timer = setTimeout(() => {
      if (currentIndex < texts.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        navigation.navigate('OnBoardingStack', {
          screen: 'onePaliWorks',
        });
      }
    }, totalTime);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <View
        key={currentIndex}
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {letters.map((char, index) => (
          <Animated.View
            key={`${char}-${index}`}
            style={{ opacity: opacityAnims[index] }}
          >
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={42}
              color={COLORS.darkText}
            >
              {char === ' ' ? '\u00A0' : char}
            </CustomText>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default Onboarding;


