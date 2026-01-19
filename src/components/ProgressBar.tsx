import { StyleSheet, View } from 'react-native';
import React from 'react';
import { horizontalScale, verticalScale } from '../utils/Metrics';
import COLORS from '../utils/Colors';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const clampedStep = Math.max(0, Math.min(currentStep, totalSteps));
  const hasSteps = totalSteps > 0;

  // For steps >= 1 we grow the green pill from a minimum width (step 1)
  // up to full width (last step), based purely on the index.
  const minPercent = 18; // visual width for step 1
  const maxPercent = 100;

  let progressPercent = 0;

  if (clampedStep > 0 && hasSteps) {
    if (totalSteps === 1) {
      progressPercent = maxPercent;
    } else {
      const ratio = (clampedStep - 1) / (totalSteps - 1);
      progressPercent = minPercent + ratio * (maxPercent - minPercent);
    }
  }

  return (
    <View style={styles.progressOuter}>
      <View style={styles.progressInsetShadow} pointerEvents="none" />

      <View style={styles.progressTrack}>
        {/* Step 0: single green dot */}
        {clampedStep === 0 && <View style={styles.initialDot} />}

        {/* Steps >= 1: growing green pill with candles */}
        {clampedStep > 0 && (
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
            ]}
          >
            {Array.from({ length: clampedStep }).map((_, index) => (
              <View key={index} style={styles.progressHighlight} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  progressOuter: {
    backgroundColor: '#F2F3F8',
    borderRadius: 999,
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(2),
    marginVertical: verticalScale(12),
    overflow: 'hidden',
  },

  progressInsetShadow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.06)',
  },

  progressTrack: {
    backgroundColor: '#F8F8FB',
    borderRadius: 100,
    minHeight: verticalScale(32),
    justifyContent: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: horizontalScale(6),
  },

  // Step 0 visual
  initialDot: {
    width: verticalScale(32),
    height: verticalScale(32),
    borderRadius: 20,
    backgroundColor: COLORS.DarkGreen,
  },

  progressFill: {
    height: verticalScale(33),
    backgroundColor: COLORS.DarkGreen,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  progressHighlight: {
    width: horizontalScale(15),
    height: verticalScale(30),
    backgroundColor: COLORS.lightGreen,
  },
});
