import React, { useRef, useEffect, useMemo } from 'react';
import { View, Animated, PanResponder } from 'react-native';
import COLORS from '../utils/Colors';
import { horizontalScale, verticalScale } from '../utils/Metrics';
import CustomIcon from './CustomIcon';
import ICONS from '../assets/Icons';
import LinearGradient from 'react-native-linear-gradient';

const TRACK_WIDTH = horizontalScale(320);
const POINTER_SIZE = horizontalScale(12);
const ICON_SIZE = horizontalScale(48);
const TRACK_PADDING = 4;

const INNER_WIDTH = TRACK_WIDTH - TRACK_PADDING * 2;

interface Props {
  value: number;
  onChange: (val: number) => void;
}

const DonationSlider: React.FC<Props> = ({ value, onChange }) => {
  const pan = useRef(new Animated.Value(0)).current;
  const startPanX = useRef(0);
  const panValueRef = useRef(0);
  const lastReportedValue = useRef(value);
  const pointerOffset = useRef(
    new Animated.Value(POINTER_SIZE / 2 - ICON_SIZE / 2),
  ).current;
  const progressOffset = useRef(
    new Animated.Value(POINTER_SIZE + TRACK_PADDING),
  ).current;

  // 👉 Sync UI when parent value changes
  useEffect(() => {
    const maxX = INNER_WIDTH - POINTER_SIZE;
    const percentage = (value - 1) / (30 - 1);
    const newX = percentage * maxX;

    lastReportedValue.current = value;
    pan.setValue(newX);
  }, [value]);

  useEffect(() => {
    const listenerId = pan.addListener(({ value: panValue }) => {
      panValueRef.current = panValue;

      // Report value changes only when they cross a threshold
      const maxX = INNER_WIDTH - POINTER_SIZE;
      const percentage = Math.min(1, Math.max(0, panValue / maxX));
      const newValue = Math.round(1 + percentage * (30 - 1));
      const clampedValue = Math.min(30, Math.max(1, newValue));

      if (clampedValue !== lastReportedValue.current) {
        lastReportedValue.current = clampedValue;
        onChange(clampedValue);
      }
    });
    return () => pan.removeListener(listenerId);
  }, [pan, onChange]);

  const minX = 0;
  const maxX = INNER_WIDTH - POINTER_SIZE;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startPanX.current = panValueRef.current;
      },

      onPanResponderMove: (_, gesture) => {
        let newX = startPanX.current + gesture.dx;

        // Clamp values
        newX = Math.max(minX, Math.min(maxX, newX));
        pan.setValue(newX);
      },

      onPanResponderRelease: () => {
        startPanX.current = panValueRef.current;
      },
    }),
  ).current;

  const progressWidth = useMemo(
    () => Animated.add(pan, progressOffset),
    [pan, progressOffset],
  );
  const pointerTranslateX = useMemo(
    () => Animated.add(pan, pointerOffset),
    [pan, pointerOffset],
  );

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: TRACK_WIDTH }}>
        {/* ICON */}
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            position: 'absolute',
            left: TRACK_PADDING,
            transform: [
              {
                translateX: pointerTranslateX,
              },
            ],
            top: '50%',
            marginTop: -ICON_SIZE / 2,
            zIndex: 2,
          }}
        >
          <View
            style={{
              height: ICON_SIZE,
              width: ICON_SIZE,
              borderRadius: ICON_SIZE,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CustomIcon
              Icon={ICONS.SliderBarHeart}
              height={verticalScale(36)}
              width={verticalScale(36)}
            />
          </View>
        </Animated.View>

        {/* TRACK */}
        <View
          style={{
            width: TRACK_WIDTH,
            height: verticalScale(20),
            borderRadius: 50,
            overflow: 'hidden',
            backgroundColor: COLORS.appBackground,
          }}
          {...panResponder.panHandlers}
        >
          {/* GRADIENT PROGRESS */}
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              width: progressWidth,
              top: 0,
              bottom: 0,
            }}
          >
            <LinearGradient
              colors={['#1B7A4B', '#1B7A4B', '#2ECC71']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>

          {/* INNER SHADOW LAYER */}
          <View
            pointerEvents='none'
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 50,
              overflow: 'hidden',
            }}
          >
            {/* TOP + BOTTOM */}
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.08)',
                'transparent',
                'transparent',
                'rgba(0,0,0,0.08)',
              ]}
              locations={[0, 0.2, 0.8, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
              }}
            />

            {/* RIGHT SIDE ONLY */}
            <LinearGradient
              colors={['transparent', 'transparent', 'rgba(0,0,0,0.12)']}
              locations={[0, 0.85, 1]}
              start={{ x: 0.83, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default DonationSlider;
