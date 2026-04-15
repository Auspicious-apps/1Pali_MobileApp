import AsyncStorage from "@react-native-async-storage/async-storage";

const RATE_US_DISMISSED_AT_KEY = "@rate_us_dismissed_at";
const RATE_US_SUBMITTED_KEY = "@rate_us_submitted";
const RATE_US_LAST_SHOWN_KEY = "@rate_us_last_shown_at";

const TWO_DAYS_IN_MS = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
const MIN_SUBSCRIPTION_DAYS = 7; // Minimum days subscribed before showing
const MIN_DAYS_BETWEEN_PROMPTS = 14; // Minimum days between prompts (prevent excessive asking)

/**
 * Check all eligibility criteria for showing rate us modal
 * Follows Google Play best practices:
 * 1. Don't prompt immediately - wait for meaningful app experience
 * 2. Don't prompt excessively - enforce cooldown periods
 * 3. Tie to user actions/milestones - good engagement signals
 */
export const shouldShowRateUsModal = async (userSubscribedAt?: string): Promise<boolean> => {
  try {
    // 1. Check if user has already submitted a rating
    const hasSubmittedRating = await AsyncStorage.getItem(RATE_US_SUBMITTED_KEY);
    if (hasSubmittedRating === "true") {
      console.log("[RateUs] Already rated - won't show again");
      return false;
    }

    // 2. Check if user has subscribed long enough (minimum days requirement)
    if (userSubscribedAt) {
      const subscribedDate = new Date(userSubscribedAt).getTime();
      const daysSinceSubscription = Math.floor(
        (Date.now() - subscribedDate) / (24 * 60 * 60 * 1000)
      );

      if (daysSinceSubscription < MIN_SUBSCRIPTION_DAYS) {
        console.log(
          `[RateUs] User only subscribed for ${daysSinceSubscription} days (min: ${MIN_SUBSCRIPTION_DAYS})`
        );
        return false; // User too new
      }
    }

    // 3. Check dismissal cooldown (2-day cooldown after dismissal)
    const dismissedAtStr = await AsyncStorage.getItem(RATE_US_DISMISSED_AT_KEY);
    if (dismissedAtStr) {
      const dismissedAtTime = Number(dismissedAtStr);
      const currentTime = Date.now();
      const timeSinceDismissal = currentTime - dismissedAtTime;

      if (timeSinceDismissal < TWO_DAYS_IN_MS) {
        const hoursRemaining = Math.ceil(
          (TWO_DAYS_IN_MS - timeSinceDismissal) / (60 * 60 * 1000)
        );
        console.log(`[RateUs] Still in 2-day cooldown (${hoursRemaining}h remaining)`);
        return false; // Still in cooldown
      }
    }

    // 4. Check excessive prompt protection (don't show more than once per 14 days)
    const lastShownStr = await AsyncStorage.getItem(RATE_US_LAST_SHOWN_KEY);
    if (lastShownStr) {
      const lastShownTime = Number(lastShownStr);
      const daysSinceLastShown = Math.floor(
        (Date.now() - lastShownTime) / (24 * 60 * 60 * 1000)
      );

      if (daysSinceLastShown < MIN_DAYS_BETWEEN_PROMPTS) {
        console.log(
          `[RateUs] Already shown recently (${daysSinceLastShown} days ago, min: ${MIN_DAYS_BETWEEN_PROMPTS})`
        );
        return false; // Requested too recently
      }
    }

    console.log("[RateUs] All eligibility checks passed - show modal");
    return true;
  } catch (error) {
    console.warn("[RateUs] Error checking modal visibility:", error);
    return false; // Default to NOT showing on error (conservative approach)
  }
};

/**
 * Mark that user dismissed the modal without rating
 * Sets a timestamp so we can check 2-day cooldown later
 */
export const markRateUsModalDismissed = async (): Promise<void> => {
  try {
    const now = Date.now();
    await AsyncStorage.setItem(RATE_US_DISMISSED_AT_KEY, now.toString());
    // Also update last shown time to prevent excessive prompts
    await AsyncStorage.setItem(RATE_US_LAST_SHOWN_KEY, now.toString());
    console.log(
      "[RateUs] Modal dismissed at:",
      new Date().toISOString(),
    );
  } catch (error) {
    console.warn("[RateUs] Error marking modal as dismissed:", error);
  }
};

/**
 * Mark that modal was shown (internal tracking)
 * Called right before showing to track excessive prompting
 */
export const markRateUsModalShown = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(RATE_US_LAST_SHOWN_KEY, Date.now().toString());
    console.log("[RateUs] Modal shown at:", new Date().toISOString());
  } catch (error) {
    console.warn("[RateUs] Error marking modal as shown:", error);
  }
};

/**
 * Mark that user submitted a rating
 * This will prevent the modal from ever showing again
 */
export const markRateUsSubmitted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(RATE_US_SUBMITTED_KEY, "true");
    // Clear the dismissed timestamp since it's no longer needed
    await AsyncStorage.removeItem(RATE_US_DISMISSED_AT_KEY);
    console.log("[RateUs] Rating submitted");
  } catch (error) {
    console.warn("[RateUs] Error marking rating as submitted:", error);
  }
};

/**
 * Reset rate us tracking (for testing or on logout)
 */
export const resetRateUsTracking = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(RATE_US_DISMISSED_AT_KEY),
      AsyncStorage.removeItem(RATE_US_SUBMITTED_KEY),
      AsyncStorage.removeItem(RATE_US_LAST_SHOWN_KEY),
    ]);
    console.log("[RateUs] Tracking reset");
  } catch (error) {
    console.warn("[RateUs] Error resetting rate us tracking:", error);
  }
};

/**
 * Get debug info about rate us modal state
 * Helps understand why modal may not be showing
 */
export const getRateUsDebugInfo = async (userSubscribedAt?: string): Promise<{
  hasSubmittedRating: boolean;
  dismissedAt: string | null;
  lastShownAt: string | null;
  nextEligibleAfterCooldown: string | null;
  nextEligibleAfterPromptLimit: string | null;
  daysSinceSubscription: number | null;
  daysSinceLastShown: number | null;
  minSubscriptionDays: number;
  minDaysBetweenPrompts: number;
  shouldShow: boolean;
  reason: string;
}> => {
  try {
    const hasSubmittedRating =
      (await AsyncStorage.getItem(RATE_US_SUBMITTED_KEY)) === "true";
    const dismissedAtStr = await AsyncStorage.getItem(RATE_US_DISMISSED_AT_KEY);
    const lastShownStr = await AsyncStorage.getItem(RATE_US_LAST_SHOWN_KEY);

    let nextEligibleAfterCooldown: string | null = null;
    let dismissedAtFormatted: string | null = null;
    let lastShownAtFormatted: string | null = null;
    let nextEligibleAfterPromptLimit: string | null = null;
    let daysSinceSubscription: number | null = null;
    let daysSinceLastShown: number | null = null;
    let reason = "Unknown";

    // Parse dismissed time
    if (dismissedAtStr) {
      const dismissedTime = Number(dismissedAtStr);
      dismissedAtFormatted = new Date(dismissedTime).toISOString();
      const nextTime = dismissedTime + TWO_DAYS_IN_MS;
      nextEligibleAfterCooldown = new Date(nextTime).toISOString();
    }

    // Parse last shown time
    if (lastShownStr) {
      const lastShownTime = Number(lastShownStr);
      lastShownAtFormatted = new Date(lastShownTime).toISOString();
      daysSinceLastShown = Math.floor(
        (Date.now() - lastShownTime) / (24 * 60 * 60 * 1000)
      );
      const nextEligibleTime = lastShownTime + (MIN_DAYS_BETWEEN_PROMPTS * 24 * 60 * 60 * 1000);
      nextEligibleAfterPromptLimit = new Date(nextEligibleTime).toISOString();
    }

    // Calculate subscription days
    if (userSubscribedAt) {
      const subscribedDate = new Date(userSubscribedAt).getTime();
      daysSinceSubscription = Math.floor(
        (Date.now() - subscribedDate) / (24 * 60 * 60 * 1000)
      );
    }

    // Determine reason
    if (hasSubmittedRating) {
      reason = "✓ User already rated - won't show again";
    } else if (daysSinceSubscription !== null && daysSinceSubscription < MIN_SUBSCRIPTION_DAYS) {
      reason = `✗ User only subscribed ${daysSinceSubscription} days (need ${MIN_SUBSCRIPTION_DAYS})`;
    } else if (dismissedAtStr && nextEligibleAfterCooldown) {
      const hoursRemaining = Math.ceil(
        (Number(dismissedAtStr) + TWO_DAYS_IN_MS - Date.now()) / (60 * 60 * 1000)
      );
      if (hoursRemaining > 0) {
        reason = `✗ In 2-day cooldown (${hoursRemaining}h remaining)`;
      }
    } else if (lastShownStr && daysSinceLastShown !== null && daysSinceLastShown < MIN_DAYS_BETWEEN_PROMPTS) {
      reason = `✗ Shown too recently (${daysSinceLastShown} days ago, need ${MIN_DAYS_BETWEEN_PROMPTS})`;
    } else {
      reason = "✓ Ready to show";
    }

    const shouldShow = await shouldShowRateUsModal(userSubscribedAt);

    return {
      hasSubmittedRating,
      dismissedAt: dismissedAtFormatted,
      lastShownAt: lastShownAtFormatted,
      nextEligibleAfterCooldown,
      nextEligibleAfterPromptLimit,
      daysSinceSubscription,
      daysSinceLastShown,
      minSubscriptionDays: MIN_SUBSCRIPTION_DAYS,
      minDaysBetweenPrompts: MIN_DAYS_BETWEEN_PROMPTS,
      shouldShow,
      reason,
    };
  } catch (error) {
    console.warn("[RateUs] Error getting debug info:", error);
    return {
      hasSubmittedRating: false,
      dismissedAt: null,
      lastShownAt: null,
      nextEligibleAfterCooldown: null,
      nextEligibleAfterPromptLimit: null,
      daysSinceSubscription: null,
      daysSinceLastShown: null,
      minSubscriptionDays: MIN_SUBSCRIPTION_DAYS,
      minDaysBetweenPrompts: MIN_DAYS_BETWEEN_PROMPTS,
      shouldShow: false,
      reason: "Error checking debug info",
    };
  }
};
