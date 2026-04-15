import analytics from "@react-native-firebase/analytics";
import { Platform } from "react-native";

let analyticsCollectionEnabled = false;

export const setAnalyticsTrackingEnabled = async (enabled: boolean) => {
  analyticsCollectionEnabled = enabled;
  try {
    await analytics().setAnalyticsCollectionEnabled(enabled);
  } catch (e) {
    console.log("Failed to toggle analytics collection:", e);
  }
};

export const logScreen = async (screenName: string) => {
  if (!analyticsCollectionEnabled) return;
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (e) {
    console.log("Analytics Screen Error:", e);
  }
};

export const logEvent = async (
  eventName: string,
  params?: Record<string, any>,
) => {
  if (!analyticsCollectionEnabled) {
    console.log(`Skipping event ${eventName}: analytics disabled`);
    return;
  }
  try {
    await analytics()
      .logEvent(eventName, {
        ...params,
        OS: Platform.OS,
      })
      .then(() => {
        console.log(`Logged event: ${eventName}`, params);
      });
  } catch (e) {
    console.log("Analytics Event Error:", e);
  }
};
