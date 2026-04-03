import analytics from "@react-native-firebase/analytics";

export const logScreen = async (screenName: string) => {
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
  try {
    await analytics().logEvent(eventName, params);
  } catch (e) {
    console.log("Analytics Event Error:", e);
  }
};
