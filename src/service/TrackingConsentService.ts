import { Alert, AppState, InteractionManager, Platform } from 'react-native';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import STORAGE_KEYS from '../utils/Constants';
import { getLocalStorageData, storeLocalStorageData } from '../utils/Helpers';
import { setAnalyticsTrackingEnabled } from '../Context/analyticsService';

export type TrackingConsentStatus = 'granted' | 'denied';

const normalizeConsent = (result: string): TrackingConsentStatus => {
  return result === RESULTS.GRANTED ? 'granted' : 'denied';
};

const applyConsent = async (status: TrackingConsentStatus) => {
  await setAnalyticsTrackingEnabled(status === 'granted');
};

const wait = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

const waitForAppToBeActive = (maxWaitMs = 2000): Promise<void> => {
  if (AppState.currentState === 'active') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (!settled && nextState === 'active') {
        settled = true;
        clearTimeout(timeout);
        subscription.remove();
        resolve();
      }
    });

    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      subscription.remove();
      resolve();
    }, maxWaitMs);
  });
};

const waitForInteractions = () => {
  return new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => resolve());
  });
};

const requestAndroidTrackingConsent = async (): Promise<TrackingConsentStatus> => {
  await waitForAppToBeActive();
  await waitForInteractions();
  await wait(250);

  return new Promise((resolve) => {
    Alert.alert(
      'Allow analytics tracking?',
      'We use analytics to improve app performance and user experience.',
      [
        {
          text: "Don't Allow",
          style: 'cancel',
          onPress: () => resolve('denied'),
        },
        {
          text: 'Allow',
          onPress: () => resolve('granted'),
        },
      ],
      { cancelable: false },
    );
  });
};

export const ensureTrackingConsent =
  async (): Promise<TrackingConsentStatus> => {
    const storedConsent = (await getLocalStorageData(
      STORAGE_KEYS.trackingConsent,
    )) as TrackingConsentStatus | null;

    if (storedConsent === 'granted' || storedConsent === 'denied') {
      await applyConsent(storedConsent);
      return storedConsent;
    }

    if (Platform.OS === 'ios') {
      let permissionResult: string;
      try {
        permissionResult = await request(
          PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY,
        );
      } catch (error) {
        console.warn('Tracking permission request failed:', error);
        permissionResult = RESULTS.DENIED;
      }
      const normalized = normalizeConsent(permissionResult);
      await storeLocalStorageData(STORAGE_KEYS.trackingConsent, normalized);
      await applyConsent(normalized);
      return normalized;
    }

    const androidConsent = await requestAndroidTrackingConsent();

    await storeLocalStorageData(STORAGE_KEYS.trackingConsent, androidConsent);
    await applyConsent(androidConsent);
    return androidConsent;
  };
