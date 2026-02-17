import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";
import IMAGES from "../assets/Images";
import {
  showInAppNotification,
  getLocalStorageData,
  storeLocalStorageData,
} from "../utils/Helpers";
import STORAGE_KEYS from "../utils/Constants";
import { postData } from "../service/ApiService";
import ENDPOINTS from "../service/ApiEndpoints";

// Request notification permission
export const requestUserPermission = async (): Promise<boolean> => {
  if (Platform.OS === "ios") {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  if (Platform.OS === "android" && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true; // Android < 13 permissions are granted at install
};

// Get FCM Token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    console.log("📱 FCM Token:", token);
    return token;
  } catch (error) {
    console.error("❌ Failed to get FCM token:", error);
    return null;
  }
};

// Update FCM Token in backend
const updateFCMTokenInBackend = async (fcmToken: string): Promise<boolean> => {
  try {
    const response = await postData(ENDPOINTS.UpdateFCMToken, {
      fcmToken,
    });
    console.log("✅ FCM Token updated in backend:", response.data);
    // Save as last synced token after successful update
    await storeLocalStorageData("lastSyncedFCMToken", fcmToken);
    return true;
  } catch (error) {
    console.error("❌ Failed to update FCM token in backend:", error);
    return false;
  }
};

// Request notification permission and update FCM token if user is logged in
export const requestNotificationPermissionAndUpdateFCM =
  async (): Promise<boolean> => {
    try {
      // Check if user is logged in (has accessToken)
      const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);

      if (!accessToken) {
        console.warn("⚠️ User not logged in. Skipping notification setup.");
        return false;
      }

      // Request permission
      const permissionGranted = await requestUserPermission();

      if (permissionGranted) {
        // Get FCM token
        const fcmToken = await getFCMToken();

        if (fcmToken) {
          // Update FCM token in backend
          const updated = await updateFCMTokenInBackend(fcmToken);
          if (updated) {
            // Token is already saved by updateFCMTokenInBackend
            console.log("✅ FCM token synced on permission allow");
          }
          return updated;
        } else {
          console.warn("⚠️ Failed to get FCM token");
          return false;
        }
      } else {
        console.warn("🔕 User denied notification permission");
        return false;
      }
    } catch (error) {
      console.error(
        "❌ Error in requestNotificationPermissionAndUpdateFCM:",
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
    console.log("Foreground Notification:", remoteMessage);

    if (remoteMessage.notification) {
      showInAppNotification(
        remoteMessage.notification.title || "Notification",
        remoteMessage.notification.body || "",
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
    console.log("Opened from background:", remoteMessage);
    if (remoteMessage?.data) {
      handleNotificationData(remoteMessage.data);
    }
  });

  // App opened from quit state
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.data) {
        console.log("Opened from quit:", remoteMessage);
        handleNotificationData(remoteMessage.data);
      }
    });
};

// Initialize Firebase Messaging
export const initializeFirebaseMessaging = async () => {
  try {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn("🔕 Notification permission not granted");
      return;
    }

    const token = await messaging().getToken();
    console.log("📱 FCM Token:", token);

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(
      async (newToken) => {
        console.log("🔄 Token refreshed:", newToken);

        // Only sync if user is logged in
        const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);
        if (accessToken) {
          await updateFCMTokenInBackend(newToken);
        }
      },
    );

    const unsubscribeForeground = setupForegroundMessageHandler();
    setupNotificationTapHandler();

    console.log("✅ FIREBASE MESSAGING READY");

    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  } catch (error) {
    console.error("❌ Firebase messaging init failed:", error);
  }
};

// Handle notification data payload
const handleNotificationData = (data: Record<string, any>) => {
  try {
    // Example: Handle different notification types
    console.log(data, "Notification Data");
  } catch (error) {
    console.error("Error handling notification data:", error);
  }
};

export const syncFCMTokenWithBackend = async (tokenFromServer?: string) => {
  try {
    // 1. Check if user is logged in
    const accessToken = await getLocalStorageData(STORAGE_KEYS.accessToken);
    if (!accessToken) {
      console.log("🚶 User not logged in. Skipping FCM sync.");
      return;
    }

    // 2. Request/Check Permissions
    const permissionGranted = await requestUserPermission();
    if (!permissionGranted) {
      console.log("🔕 Notification permission denied.");
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
      console.log("✅ FCM Token is already up to date on server.");
      return;
    }

    // 5. Hit API to update
    const response = await postData(ENDPOINTS.UpdateFCMToken, {
      fcmToken: currentToken,
    });

    if (response) {
      // 6. Save as last synced only after successful API call
      await storeLocalStorageData("lastSyncedFCMToken", currentToken);
      console.log("🚀 FCM Token successfully updated in backend.");
    }
  } catch (error) {
    console.error("❌ FCM Sync Error:", error);
  }
};
