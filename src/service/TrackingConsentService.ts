import { Platform } from "react-native";
import { PERMISSIONS, RESULTS, request } from "react-native-permissions";
import STORAGE_KEYS from "../utils/Constants";
import { getLocalStorageData, storeLocalStorageData } from "../utils/Helpers";
import { setAnalyticsTrackingEnabled } from "../Context/analyticsService";

export type TrackingConsentStatus = "granted" | "denied";

const normalizeConsent = (result: string): TrackingConsentStatus => {
  return result === RESULTS.GRANTED ? "granted" : "denied";
};

const applyConsent = async (status: TrackingConsentStatus) => {
  await setAnalyticsTrackingEnabled(status === "granted");
};

export const ensureTrackingConsent = async (): Promise<TrackingConsentStatus> => {
  const storedConsent = (await getLocalStorageData(
    STORAGE_KEYS.trackingConsent,
  )) as TrackingConsentStatus | null;

  if (storedConsent === "granted" || storedConsent === "denied") {
    await applyConsent(storedConsent);
    return storedConsent;
  }

  if (Platform.OS === "ios") {
    let permissionResult: string;
    try {
      permissionResult = await request(
        PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY,
      );
    } catch (error) {
      console.warn("Tracking permission request failed:", error);
      permissionResult = RESULTS.DENIED;
    }
    const normalized = normalizeConsent(permissionResult);
    await storeLocalStorageData(STORAGE_KEYS.trackingConsent, normalized);
    await applyConsent(normalized);
    return normalized;
  }

  const androidConsent: TrackingConsentStatus = "granted";
  await storeLocalStorageData(STORAGE_KEYS.trackingConsent, androidConsent);
  await applyConsent(androidConsent);
  return androidConsent;
};
