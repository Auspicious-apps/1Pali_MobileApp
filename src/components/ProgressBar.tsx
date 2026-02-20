import React from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { useAppSelector } from "../redux/store";
import COLORS from "../utils/Colors";
import { horizontalScale, verticalScale } from "../utils/Metrics";
import BadgeIcon from "./BadgeIcon";
import CircularOverlay from "./CircularOverlay";
import { CustomText } from "./CustomText";
import HapticFeedback from "react-native-haptic-feedback";

const STRIPE_WIDTH = horizontalScale(14.8);
const STRIPE_GAP = horizontalScale(12);
const CONTAINER_PADDING = horizontalScale(18);

const COMMUNITY_BADGE_MAP: any = {
  1000: "olive",
  10000: "watermelon",
  50000: "jaffa",
  100000: "tatreez",
  250000: "kaffiyez",
  500000: "fig",
  1000000: "key",
};

const ProgressBar = ({ hideFooter = false, isAccountScreen = false }) => {
  const { user } = useAppSelector((state) => state.user);
  const [showFinalGoal, setShowFinalGoal] = React.useState(true);
  const nextMilestone = user?.nextCommunityMilestone;
  const [trackWidth, setTrackWidth] = React.useState(0);

  const animatedProgress = React.useRef(new Animated.Value(0)).current;

  const growthBadgeName = user?.nextGrowthBadge?.name || "Growth Badge";

  const milestoneTarget = showFinalGoal
    ? 1000000
    : nextMilestone?.threshold || 1000000;

  const milestoneLabel = showFinalGoal
    ? "1M supporters"
    : `${nextMilestone?.threshold?.toLocaleString()} supporters`;


    console.log(nextMilestone, "NEXT MILESTONE. ");
    

  // const badgeName = showFinalGoal
  //   ? "Key"
  //   : nextMilestone?.name || "Next Milestone Badge";
  const badgeName = isAccountScreen
    ? growthBadgeName
    : COMMUNITY_BADGE_MAP[milestoneTarget] ??
      nextMilestone?.name ??
      "Next Milestone Badge";

  const currentValue = user?.globalStats?.totalDonors || 0;

  const progressPercentage = Math.min(currentValue / milestoneTarget, 1);
  const progressPercentValue = Math.min(
    (currentValue / milestoneTarget) * 100,
    100,
  );

  const MIN_STROKE_THRESHOLD = 0.08; // 8% feels good visually
  const showStroke = progressPercentage > MIN_STROKE_THRESHOLD;

  const hapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  React.useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progressPercentage,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width animation can't use native driver
    }).start();
  }, [progressPercentage]);

  return (
    <View style={{ gap: verticalScale(12) }}>
      <View style={styles.progressOuter}>
        <View style={styles.progressInsetShadow} pointerEvents="none" />

        <View
          style={styles.progressTrack}
          onLayout={(e) => {
            setTrackWidth(e.nativeEvent.layout.width);
          }}
        >
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: animatedProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [verticalScale(22), trackWidth],
                }),
              },
            ]}
          >
            {showStroke && (
              <Animated.View style={[styles.progressFillStroke]} />
            )}
          </Animated.View>

          <View
            style={{
              position: "absolute",
              right: -10,
              shadowColor: "#000000",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.22,
              shadowRadius: 1.54,

              // Android
              elevation: 2,
            }}
          >
            <BadgeIcon
              badge={badgeName}
              style={{
                height: verticalScale(48),
                width: verticalScale(48),
                resizeMode: "cover",
              }}
            />

            <CircularOverlay
              percentage={progressPercentValue}
              borderWidth={0}
              size={verticalScale(48)}
            />
          </View>
        </View>
      </View>
      {!hideFooter && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: horizontalScale(6),
          }}
        >
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={15}
            color={COLORS.darkText}
            style={{ textAlign: "center" }}
          >
            {currentValue.toLocaleString()}
          </CustomText>
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={15}
            color={COLORS.appText}
          >
            of
          </CustomText>
          <Pressable
            disabled={isAccountScreen}
            onPress={() => {
              if (isAccountScreen) return;
              HapticFeedback.trigger("impactLight", hapticOptions);
              setShowFinalGoal((prev) => !prev);
            }}
          >
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={15}
              color={COLORS.greyText}
              style={{
                textAlign: "center",
                paddingHorizontal: horizontalScale(16),
                paddingVertical: verticalScale(4),
                backgroundColor: COLORS.greyBackground,
                borderRadius: 100,
              }}
            >
              {milestoneLabel}
            </CustomText>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  progressOuter: {
    backgroundColor: "#F2F3F8",
    borderRadius: 999,
    // paddingVertical: verticalScale(4),
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
    width: verticalScale(22),
    height: verticalScale(22),
    borderRadius: 100,
    backgroundColor: COLORS.DarkGreen,
  },
  progressFill: {
    height: verticalScale(22),
    backgroundColor: COLORS.DarkGreen,
    borderRadius: 50,
    paddingTop: verticalScale(4),
  },
  progressFillStroke: {
    height: verticalScale(5),
    backgroundColor: "#ffffff64",
    borderRadius: 50,
    justifyContent: "center",
    alignSelf: "center",
    width: "90%",
  },
  stripeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: CONTAINER_PADDING,
  },
  progressHighlight: {
    width: STRIPE_WIDTH,
    height: verticalScale(20),
    backgroundColor: COLORS.lightGreen,
    marginRight: STRIPE_GAP,
  },
});
