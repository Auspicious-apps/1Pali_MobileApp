import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import IMAGES from '../assets/Images';
import { showInAppNotification } from '../utils/Helpers';

// Request notification permission
export const requestUserPermission = async (): Promise<boolean> => {
  try {
    // 🍎 iOS
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('iOS permission status:', authStatus);
      return enabled;
    }

    // 🤖 Android 13+
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'One Pali Notifications',
          message: 'One Pali needs permission to send you notifications',
          buttonPositive: 'Allow',
          buttonNegative: 'Cancel',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    // 🤖 Android < 13
    return true;
  } catch (error) {
    console.error('❌ Permission request failed:', error);
    return false;
  }
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

// Listen for token refresh
export const onTokenRefresh = (callback: (token: string) => void) => {
  return messaging().onTokenRefresh(callback);
};

// Handle foreground notifications (when app is open)
export const setupForegroundMessageHandler = () => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
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
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Opened from background:', remoteMessage);
    if (remoteMessage?.data) {
      handleNotificationData(remoteMessage.data);
    }
  });

  // App opened from quit state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage?.data) {
        console.log('Opened from quit:', remoteMessage);
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
    console.log(authStatus, "kKJHKhkjh");
    
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('🔕 Notification permission not granted');
      return;
    }

    const token = await messaging().getToken();
    console.log('📱 FCM Token:', token);

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(
      async newToken => {
        console.log('🔄 Token refreshed:', newToken);
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
const handleNotificationData = (data: Record<string, any>) => {
  try {
    // Example: Handle different notification types
    const { type, userId, squadId, messageId } = data;

    switch (type) {
      case 'LIKE':
        console.log('New like from user:', userId);
        // Navigate to user profile or likes screen
        break;
      case 'MESSAGE':
        console.log('New message:', messageId);
        // Navigate to chat screen
        break;
      case 'SQUAD_INVITE':
        console.log('Squad invitation:', squadId);
        // Show squad invitation
        break;
      case 'FOLLOW':
        console.log('FOLLOWER ID invitation:', squadId);
        // Show squad invitation
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  } catch (error) {
    console.error('Error handling notification data:', error);
  }
};
