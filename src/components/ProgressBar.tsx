import { StyleSheet, View, Dimensions } from "react-native";
import React from "react";
import { horizontalScale, verticalScale } from "../utils/Metrics";
import COLORS from "../utils/Colors";
import { useAppSelector } from "../redux/store";

const TOTAL_GOAL = 1000000;
const MAX_STRIPES = 10;
const STRIPE_WIDTH = horizontalScale(14.8);
const STRIPE_GAP = horizontalScale(12);
const CONTAINER_PADDING = horizontalScale(18);

const ProgressBar = () => {
  const { user } = useAppSelector((state) => state.user);

  // 1. Get the current count and CAP it at 1,000,000
  // This ensures even if totalDonors is 1,500,000, we treat it as 1,000,000
  const currentCount = Math.min(
    user?.globalStats?.totalDonors || 0,
    TOTAL_GOAL,
  );

  // 2. Calculate stripes
  const usersPerStripe = TOTAL_GOAL / MAX_STRIPES;

  // Using Math.floor ensures we only show a stripe when the threshold is fully met
  // We clamp the activeStripes between 0 and 10 as a safety measure
  const activeStripes = Math.min(
    Math.floor(currentCount / usersPerStripe),
    MAX_STRIPES,
  );

  // 3. Calculate exact pixel width
  const calculateWidth = () => {
    if (activeStripes === 0) return 0;
    const stripesSpace = activeStripes * STRIPE_WIDTH;
    const gapsSpace = (activeStripes - 1) * STRIPE_GAP;
    // We add CONTAINER_PADDING * 2 because the stripes are padded on both sides
    return CONTAINER_PADDING * 2 + stripesSpace + gapsSpace;
  };

  const progressWidth = calculateWidth();

  return (
    <View style={styles.progressOuter}>
      <View style={styles.progressInsetShadow} pointerEvents="none" />

      <View style={styles.progressTrack}>
        {/* State: Less than 1 stripe achieved */}
        {activeStripes === 0 ? (
          <View style={styles.initialCircle} />
        ) : (
          /* State: 1 or more stripes achieved */
          <View style={[styles.progressFill, { width: progressWidth }]}>
            <View style={styles.stripeContainer}>
              {Array.from({ length: activeStripes }).map((_, index) => (
                <View key={index} style={styles.progressHighlight} />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  progressOuter: {
    backgroundColor: "#F2F3F8",
    borderRadius: 999,
    paddingVertical: verticalScale(4),
    marginVertical: verticalScale(12),
  },
  progressInsetShadow: {
    position: "absolute",
    inset: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.06)",
  },
  progressTrack: {
    borderRadius: 100,
    justifyContent: "center",
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(4),
  },
  initialCircle: {
    width: verticalScale(32),
    height: verticalScale(32),
    borderRadius: 100,
    backgroundColor: COLORS.DarkGreen,
  },
  progressFill: {
    height: verticalScale(33),
    backgroundColor: COLORS.DarkGreen,
    borderRadius: 50,
    justifyContent: "center",
  },
  stripeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: CONTAINER_PADDING,
  },
  progressHighlight: {
    width: STRIPE_WIDTH,
    height: verticalScale(28),
    backgroundColor: COLORS.lightGreen,
    marginRight: STRIPE_GAP,
  },
});
