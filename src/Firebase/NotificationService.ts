import messaging from '@react-native-firebase/messaging';
import { Klaviyo } from 'klaviyo-react-native-sdk';
import { PermissionsAndroid, Platform } from 'react-native';
import IMAGES from '../assets/Images';
import {
  showInAppNotification,
  getLocalStorageData,
  storeLocalStorageData,
  navigate,
} from '../utils/Helpers';
import STORAGE_KEYS from '../utils/Constants';
import { postData } from '../service/ApiService';
import ENDPOINTS from '../service/ApiEndpoints';

const maskToken = (token?: string | null) =>
  token ? `${token.slice(0, 8)}...${token.slice(-6)}` : 'null';
const KLAVIYO_PUSH_PROFILE_PROPERTY = 'onepali_has_push_token';
const LAST_KLAVIYO_PUSH_PROFILE_PROPERTY_VALUE =
  'lastKlaviyoOnepaliHasPushTokenValue';

const getNotificationPermissionGrantedWithoutPrompt =
  async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted;
    }

    return true; // Android < 13 permissions are granted at install
  };

const syncKlaviyoPushPermissionProfileProperty = async (
  hasPushPermission: boolean,
) => {
  try {
    const nextValue = hasPushPermission ? 'true' : 'false';
    const previousValue = await getLocalStorageData(
      LAST_KLAVIYO_PUSH_PROFILE_PROPERTY_VALUE,
    );

    if (previousValue === nextValue) {
      return;
    }

    Klaviyo.setProfileAttribute(KLAVIYO_PUSH_PROFILE_PROPERTY, nextValue);
    await storeLocalStorageData(
      LAST_KLAVIYO_PUSH_PROFILE_PROPERTY_VALUE,
      nextValue,
    );

    console.log(
      `[Push][Klaviyo] Updated profile property ${KLAVIYO_PUSH_PROFILE_PROPERTY}:`,
      nextValue,
    );
  } catch (error) {
    console.warn(
      '[Push][Klaviyo] Failed to sync push permission profile property:',
      error,
    );
  }
};

const syncFCMTokenToKlaviyo = (fcmToken: string) => {
  try {
    console.log('[Push][Klaviyo] Setting push token:', maskToken(fcmToken));
    Klaviyo.setPushToken(fcmToken);
    Klaviyo.getPushToken((sdkToken: string) => {
      console.log(
        '[Push][Klaviyo] SDK push token after set:',
        maskToken(sdkToken),
      );
    });
    console.log('[Push][Klaviyo] setPushToken invoked');
  } catch (error) {
    console.warn('[Push][Klaviyo] Failed to sync FCM token:', error);
  }
};

// Request notification permission
export const requestUserPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const granted =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    await syncKlaviyoPushPermissionProfileProperty(granted);
    return granted;
  }

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
    await syncKlaviyoPushPermissionProfileProperty(isGranted);
    return isGranted;
  }

  await syncKlaviyoPushPermissionProfileProperty(true);
  return true; // Android < 13 permissions are granted at install
};

// Get FCM Token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    console.log('📱 FCM Token:', token);
    return token;
  } catch (error) {
    console.error('❌ Failed to get FCM token:', error);
    return null;
  }
};

// Update FCM Token in backend
const updateFCMTokenInBackend = async (fcmToken: string): Promise<boolean> => {
  try {
    const response = await postData(ENDPOINTS.UpdateFCMToken, {
      fcmToken,
    });
    console.log('✅ FCM Token updated in backend:', response.data);
    // Save as last synced token after successful update
    await storeLocalStorageData('lastSyncedFCMToken', fcmToken);
    return true;
  } catch (error) {
    console.error('❌ Failed to update FCM token in backend:', error);
    return false;
  }
};

// Request notification permission and update FCM token if user is logged in
export const requestNotificationPermissionAndUpdateFCM =
  async (): Promise<boolean> => {
    try {
      if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
        console.log('[Push][Auth] Registered device for remote messages');
      }

      // Check if user is logged in (has accessToken)
      const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);

      if (!accessToken) {
        console.warn('⚠️ User not logged in. Skipping notification setup.');
        return false;
      }

      // Request permission
      const permissionGranted = await requestUserPermission();

      if (permissionGranted) {
        // Get FCM token
        const fcmToken = await getFCMToken();

        if (fcmToken) {
          syncFCMTokenToKlaviyo(fcmToken);

          // Update FCM token in backend
          const updated = await updateFCMTokenInBackend(fcmToken);
          if (updated) {
            // Token is already saved by updateFCMTokenInBackend
            console.log('✅ FCM token synced on permission allow');
          }
          return updated;
        } else {
          console.warn('⚠️ Failed to get FCM token');
          return false;
        }
      } else {
        console.warn('🔕 User denied notification permission');
        return false;
      }
    } catch (error) {
      console.error(
        '❌ Error in requestNotificationPermissionAndUpdateFCM:',
        error,
      );
      return false;
    }
  };

export const requestNotificationPermissionDuringOnboarding =
  async (): Promise<boolean> => {
    try {
      if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
        console.log('[Push][Onboarding] Registered device for remote messages');
      }

      const permissionGranted = await requestUserPermission();
      console.log('[Push][Onboarding] Permission granted:', permissionGranted);
      if (!permissionGranted) {
        console.log('🔕 Notification permission denied.');
        return false;
      }

      const fcmToken = await getFCMToken();
      if (!fcmToken) {
        console.warn('⚠️ Unable to retrieve FCM token during onboarding.');
        return false;
      }

      console.log(
        '[Push][Onboarding] FCM token for onboarding sync:',
        maskToken(fcmToken),
      );
      syncFCMTokenToKlaviyo(fcmToken);

      await postData(ENDPOINTS.storeFcmTokenDuringOnBoarding, {
        fcmToken,
      });

      console.log(
        '📩 Onboarding FCM token stored via storeFcmTokenDuringOnBoarding.',
      );

      return true;
    } catch (error) {
      console.error(
        '❌ Error while requesting notification permission during onboarding:',
        error,
      );
      return false;
    }
  };

// Listen for token refresh
export const onTokenRefresh = (callback: (token: string) => void) => {
  return messaging().onTokenRefresh(callback);
};

// Handle foreground notifications (when app is open)
export const setupForegroundMessageHandler = () => {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground Notification:', remoteMessage);

    if (remoteMessage.notification) {
      showInAppNotification(
        remoteMessage.notification.title || 'Notification',
        remoteMessage.notification.body || '',
        IMAGES.OnePaliLogo, // Optional custom icon
      );
    }

    if (remoteMessage.data) {
      handleNotificationData(remoteMessage.data);
    }
  });

  return unsubscribe;
};

// Handle background/terminated notification taps
export const setupNotificationTapHandler = () => {
  // App opened from background
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Opened from background:', remoteMessage);
    if (remoteMessage?.data) {
      handleNotificationData(remoteMessage.data);
    }
  });

  // App opened from quit state
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.data) {
        console.log('Opened from quit:', remoteMessage);
        handleNotificationData(remoteMessage.data);
      }
    });
};

// Initialize Firebase Messaging
export const initializeFirebaseMessaging = async () => {
  try {
    console.log('[Push][Init] Initializing Firebase Messaging');
    const currentPermissionGranted =
      await getNotificationPermissionGrantedWithoutPrompt();
    await syncKlaviyoPushPermissionProfileProperty(currentPermissionGranted);

    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
      console.log('[Push][Init] Device registered for remote messages');
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('🔕 Notification permission not granted');
      return;
    }

    const token = await messaging().getToken();
    console.log('[Push][Init] FCM token:', maskToken(token));

    // Sync initial FCM token if user is logged in
    if (token) {
      syncFCMTokenToKlaviyo(token);

      const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);
      if (accessToken) {
        await updateFCMTokenInBackend(token);
      }
    }

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(
      async (newToken) => {
        console.log('🔄 Token refreshed:', newToken);
        syncFCMTokenToKlaviyo(newToken);

        // Only sync if user is logged in
        const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);
        if (accessToken) {
          await updateFCMTokenInBackend(newToken);
        }
      },
    );

    const unsubscribeForeground = setupForegroundMessageHandler();
    setupNotificationTapHandler();

    console.log('✅ FIREBASE MESSAGING READY');

    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  } catch (error) {
    console.error('❌ Firebase messaging init failed:', error);
  }
};

// Handle notification data payload
// const handleNotificationData = (data: Record<string, any>) => {
//   try {
//     // Example: Handle different notification types
//     console.log(data, "Notification Data");
//   } catch (error) {
//     console.error("Error handling notification data:", error);
//   }
// };

const handleNotificationData = (data: Record<string, any>) => {
  try {
    console.log('Notification Data:', data);

    const { resourceType, type, resourceId } = data;

    // ART notifications
    if (resourceType === 'ART') {
      if (type === 'ART_PUBLISHED' || type === 'ART_UPDATED') {
        navigate('MainStack', {
          screen: 'artDetail',
          params: {
            ArtId: resourceId,
          },
        });
        return;
      }
    }
    // UPDATE notifications
    if (resourceType === 'BLOG') {
      if (type === 'BLOG_PUBLISHED' || type === 'BLOG_UPDATED') {
        navigate('MainStack', {
          screen: 'updateDetail',
          params: {
            blogId: resourceId,
          },
        });
        return;
      }
    }
    if (resourceType === 'BADGE') {
      if (type === 'BADGE_EARNED' || type === 'BLOG_UPDATED') {
        navigate('MainStack', {
          screen: 'badges',
        });
        return;
      }
    }

    if (type === 'SUBSCRIPTION_EXPIRATION_REMINDER') {
      navigate('MainStack', {
        screen: 'manageDonation',
      });
      return;
    }
    console.log('Unhandled notification:', data);
  } catch (error) {
    console.error('Notification navigation error:', error);
  }
};

export const syncFCMTokenWithBackend = async (tokenFromServer?: string) => {
  try {
    // 1. Check if user is logged in
    const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);
    if (!accessToken) {
      console.log('🚶 User not logged in. Skipping FCM sync.');
      return;
    }

    // 2. Request/Check Permissions
    const permissionGranted = await requestUserPermission();
    if (!permissionGranted) {
      console.log('🔕 Notification permission denied.');
      return;
    }

    // 3. Get Current Token
    const currentToken = await messaging().getToken();
    if (!currentToken) return;

    // 4. Compare with last synced token to avoid unnecessary API calls
    let lastSyncedToken;
    if (tokenFromServer) {
      lastSyncedToken = tokenFromServer;
    }

    if (currentToken === lastSyncedToken) {
      console.log('✅ FCM Token is already up to date on server.');
      return;
    }

    // 5. Hit API to update
    const response = await postData(ENDPOINTS.UpdateFCMToken, {
      fcmToken: currentToken,
    });

    if (response) {
      // 6. Save as last synced only after successful API call
      await storeLocalStorageData('lastSyncedFCMToken', currentToken);
      console.log('🚀 FCM Token successfully updated in backend.');
    }
  } catch (error) {
    console.error('❌ FCM Sync Error:', error);
  }
};
