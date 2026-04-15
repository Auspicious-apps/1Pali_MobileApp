import { AppState, AppStateStatus, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import { EventProperties, Klaviyo } from "klaviyo-react-native-sdk";

const INSTALL_KEY = "@klaviyo_app_installed";
const SESSION_COUNT_KEY = "@klaviyo_session_count";
const LAST_OPEN_KEY = "@klaviyo_last_open_date";

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

  void Promise.all([
    safeSetItem(SESSION_COUNT_KEY, sessionCount.toString()),
    safeSetItem(LAST_OPEN_KEY, now),
  ]);
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
};
