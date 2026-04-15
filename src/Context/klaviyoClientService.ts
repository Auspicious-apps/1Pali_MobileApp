import { AppState, AppStateStatus, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import { EventProperties, Klaviyo } from "klaviyo-react-native-sdk";

const INSTALL_KEY = "@klaviyo_app_installed";
const SESSION_COUNT_KEY = "@klaviyo_session_count";
const LAST_OPEN_KEY = "@klaviyo_last_open_date";
const ONBOARDING_STARTED_KEY = "@klaviyo_onboarding_started";
const LAST_ONBOARDING_STEP_KEY = "@klaviyo_last_onboarding_step";
const ONBOARDING_ABANDONED_KEY = "@klaviyo_onboarding_abandoned";
const ONBOARDING_STEP_START_TIME_KEY = "@klaviyo_onboarding_step_start_time";

// Onboarding step tracking
export interface OnboardingStep {
  step_number: number;
  step_name: string;
  timestamp: string;
}

let onboardingSteps: OnboardingStep[] = [];
let onboardingStartTime: number = 0;
const ONBOARDING_INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
let onboardingInactivityTimer: any | null = null;

let isInitialized = false;
let currentAppState: AppStateStatus = AppState.currentState;
let appStateSubscription: { remove: () => void } | null = null;

const safeSetItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn(`[Klaviyo] Failed to persist ${key}:`, error);
  }
};

const safeGetItem = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.warn(`[Klaviyo] Failed to read ${key}:`, error);
    return null;
  }
};

const trackKlaviyoEvent = (name: string, properties: EventProperties) => {
  try {
    Klaviyo.createEvent({ name, properties });
    console.log("Succcessfully tracked Klaviyo event:", name, properties);
  } catch (error) {
    console.warn(`[Klaviyo] Failed to create event ${name}:`, error);
  }
};

const ensureAppInstalledEvent = async () => {
  const installed = await safeGetItem(INSTALL_KEY);
  console.log(installed);

  if (installed === "true") return;

  const payload = {
    platform: Platform.OS,
    app_version: DeviceInfo.getVersion(),
    device_model: DeviceInfo.getModel(),
  };

  trackKlaviyoEvent("App Installed", payload);
  void safeSetItem(INSTALL_KEY, "true");
};

const trackAppOpenedEvent = async () => {
  const previousLastOpen = await safeGetItem(LAST_OPEN_KEY);
  const sessionCountRaw = await safeGetItem(SESSION_COUNT_KEY);
  const sessionCount = Number(sessionCountRaw ?? "0") + 1;
  const now = new Date().toISOString();

  trackKlaviyoEvent("App Opened", {
    session_count: sessionCount,
    last_open_date: previousLastOpen ?? now,
  });

  // Check for abandoned onboarding when app opens
  void checkForAbandonedOnboarding();

  void Promise.all([
    safeSetItem(SESSION_COUNT_KEY, sessionCount.toString()),
    safeSetItem(LAST_OPEN_KEY, now),
  ]);
};

const checkForAbandonedOnboarding = async () => {
  try {
    const onboardingStartTime = await safeGetItem(
      ONBOARDING_STEP_START_TIME_KEY,
    );
    const lastOnboardingStep = await safeGetItem(LAST_ONBOARDING_STEP_KEY);
    const hasAbandonedBefore = await safeGetItem(ONBOARDING_ABANDONED_KEY);

    // Only track if onboarding was started but not completed and not already tracked
    if (
      onboardingStartTime &&
      lastOnboardingStep &&
      hasAbandonedBefore !== "true"
    ) {
      try {
        const stepData = JSON.parse(lastOnboardingStep);
        const startTimeNum = Number(onboardingStartTime);
        const timeSpentSeconds = Math.floor(
          (Date.now() - startTimeNum) / 1000,
        );

        const stepsSeen = onboardingSteps.map((s) => s.step_number);
        trackOnboardingAbandoned(
          stepData.step_number,
          stepsSeen.length > 0 ? stepsSeen : [stepData.step_number],
          timeSpentSeconds,
        );
      } catch (e) {
        console.warn("[Klaviyo] Failed to parse abandonment data:", e);
      }
    }
  } catch (error) {
    console.warn("[Klaviyo] Error checking for abandoned onboarding:", error);
  }
};

const handleAppStateChange = (nextState: AppStateStatus) => {
  if (currentAppState !== "active" && nextState === "active") {
    void trackAppOpenedEvent();
  }
  currentAppState = nextState;
};

export const initKlaviyoClientTracking = () => {
  if (isInitialized) return;
  isInitialized = true;

  void ensureAppInstalledEvent();
  void trackAppOpenedEvent();

  appStateSubscription = AppState.addEventListener(
    "change",
    handleAppStateChange,
  );
};

export const cleanupKlaviyoClientTracking = () => {
  appStateSubscription?.remove();
  appStateSubscription = null;
  isInitialized = false;
  
  // Clear onboarding timers
  if (onboardingInactivityTimer) {
    clearTimeout(onboardingInactivityTimer);
    onboardingInactivityTimer = null;
  }
};

/**
 * Track when user completes an onboarding step
 * @param stepNumber - The step number (1, 2, 3, etc.)
 * @param stepName - The name of the step (e.g., "Impact Stats", "Badge Exploration", "Paywall")
 * @param totalStepsCompleted - Total number of steps completed so far
 */
export const trackOnboardingStepCompleted = (
  stepNumber: number,
  stepName: string,
  totalStepsCompleted: number,
) => {
  try {
    const properties: EventProperties = {
      step_name: stepName,
      step_number: stepNumber,
      total_steps_completed: totalStepsCompleted,
    };

    trackKlaviyoEvent("Onboarding Step Completed", properties);

    // Store locally for abandonment tracking
    onboardingSteps.push({
      step_number: stepNumber,
      step_name: stepName,
      timestamp: new Date().toISOString(),
    });

    // Reset inactivity timer on each step completion
    resetOnboardingInactivityTimer();

    // Persist to async storage
    void safeSetItem(
      LAST_ONBOARDING_STEP_KEY,
      JSON.stringify({ step_number: stepNumber, step_name: stepName }),
    );
  } catch (error) {
    console.warn("[Klaviyo] Failed to track onboarding step:", error);
  }
};

/**
 * Track when user abandons onboarding
 * Called when: user returns to app without completing onboarding or 30+ min inactivity
 * @param lastStepCompleted - The last step number they completed
 * @param stepsSeen - Array of all steps they viewed
 * @param timeSpentSeconds - Total time spent in onboarding (in seconds)
 */
export const trackOnboardingAbandoned = (
  lastStepCompleted: number,
  stepsSeen: number[],
  timeSpentSeconds: number,
) => {
  try {
    const properties: EventProperties = {
      last_step_completed: lastStepCompleted,
      steps_seen: JSON.stringify(stepsSeen),
      time_spent_seconds: timeSpentSeconds,
    };

    trackKlaviyoEvent("Onboarding Abandoned", properties);

    // Mark as abandoned so we don't track it again in same session
    void safeSetItem(ONBOARDING_ABANDONED_KEY, "true");
  } catch (error) {
    console.warn("[Klaviyo] Failed to track onboarding abandoned:", error);
  }
};

/**
 * Initialize onboarding tracking
 * Call this when user starts onboarding (e.g., on Splash screen or first onboarding screen)
 */
export const initializeOnboardingTracking = async () => {
  try {
    const hasAbandonedBefore = await safeGetItem(ONBOARDING_ABANDONED_KEY);

    // If user abandoned onboarding and is opening app again, track it
    if (hasAbandonedBefore === "true") {
      const lastStep = await safeGetItem(LAST_ONBOARDING_STEP_KEY);
      const startTime = await safeGetItem(ONBOARDING_STEP_START_TIME_KEY);

      if (lastStep && startTime) {
        try {
          const stepData = JSON.parse(lastStep);
          const startTimeNum = Number(startTime);
          const timeSpentSeconds = Math.floor(
            (Date.now() - startTimeNum) / 1000,
          );

          const stepsSeen = onboardingSteps.map((s) => s.step_number);
          trackOnboardingAbandoned(
            stepData.step_number,
            stepsSeen.length > 0 ? stepsSeen : [0],
            timeSpentSeconds,
          );
        } catch (e) {
          console.warn("[Klaviyo] Failed to parse abandonment data:", e);
        }
      }
    }

    // Reset for new onboarding session
    onboardingSteps = [];
    onboardingStartTime = Date.now();
    void safeSetItem(
      ONBOARDING_STEP_START_TIME_KEY,
      onboardingStartTime.toString(),
    );
    void safeSetItem(ONBOARDING_ABANDONED_KEY, "false");

    // Start inactivity timer
    resetOnboardingInactivityTimer();
  } catch (error) {
    console.warn("[Klaviyo] Failed to initialize onboarding tracking:", error);
  }
};

/**
 * Reset onboarding tracking state
 * Call this when user logs out or account is changed
 * This ensures that the next login/onboarding flow tracks fresh events
 */
export const resetOnboardingTrackingState = async () => {
  try {
    // Clear all onboarding tracking data from AsyncStorage
    await Promise.all([
      safeSetItem(ONBOARDING_ABANDONED_KEY, "false"),
      safeSetItem(LAST_ONBOARDING_STEP_KEY, ""),
      safeSetItem(ONBOARDING_STEP_START_TIME_KEY, ""),
    ]);

    // Clear in-memory state
    onboardingSteps = [];
    onboardingStartTime = 0;

    // Clear inactivity timer
    if (onboardingInactivityTimer) {
      clearTimeout(onboardingInactivityTimer);
      onboardingInactivityTimer = null;
    }

    console.log("[Klaviyo] Onboarding tracking state reset");
  } catch (error) {
    console.warn("[Klaviyo] Failed to reset onboarding tracking state:", error);
  }
};

/**
 * Complete onboarding successfully
 * Call this when user finishes onboarding (e.g., after sign-in/payment)
 */
export const completeOnboarding = async () => {
  try {
    // Clear onboarding tracking data
    void Promise.all([
      safeSetItem(ONBOARDING_ABANDONED_KEY, "false"),
      safeSetItem(LAST_ONBOARDING_STEP_KEY, ""),
      safeSetItem(ONBOARDING_STEP_START_TIME_KEY, ""),
    ]);

    if (onboardingInactivityTimer) {
      clearTimeout(onboardingInactivityTimer);
      onboardingInactivityTimer = null;
    }

    onboardingSteps = [];
  } catch (error) {
    console.warn("[Klaviyo] Failed to complete onboarding:", error);
  }
};

/**
 * Reset the onboarding inactivity timer
 * If user is inactive for 30 minutes, mark onboarding as abandoned
 */
const resetOnboardingInactivityTimer = () => {
  if (onboardingInactivityTimer) {
    clearTimeout(onboardingInactivityTimer);
  }

  onboardingInactivityTimer = setTimeout(() => {
    const lastStepNum = onboardingSteps[onboardingSteps.length - 1]?.step_number ?? 0;
    const timeSpentSeconds = Math.floor(
      (Date.now() - onboardingStartTime) / 1000,
    );
    const stepsSeen = onboardingSteps.map((s) => s.step_number);

    trackOnboardingAbandoned(
      lastStepNum,
      stepsSeen.length > 0 ? stepsSeen : [0],
      timeSpentSeconds,
    );
  }, ONBOARDING_INACTIVITY_TIMEOUT);
};
