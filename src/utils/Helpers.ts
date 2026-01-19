import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import * as Keychain from 'react-native-keychain';
import uuid from 'react-native-uuid';

export const getLocalStorageData = async (key: string) => {
  const value = await AsyncStorage.getItem(key);
  if (!value) return null; // Return null if no value exists
  try {
    return JSON.parse(value); // Try to parse as JSON
  } catch (error) {
    console.warn(
      `Could not parse "${key}" as JSON, returning raw value:`,
      value,
    );
    return value; // Return the raw string if parsing fails
  }
};

export const storeLocalStorageData = async (key: string, value: any) => {
  await AsyncStorage.setItem(key, JSON.stringify(value)); // Always store as JSON string
};

export const deleteLocalStorageData = async (key: string) => {
  await AsyncStorage.removeItem(key); // Always store as JSON string
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Suffle messages

export const useChangingText = (
  messages: string[],
  interval: number = 2000,
) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages, interval]);

  return messages[index];
};

// Custom Toast Meessage

export const showToast = (
  type: 'success' | 'error' | 'info' | 'warning',
  title: string,
  meessage?: string,
) => {
  switch (type) {
    case 'success':
      Toast.show({
        type: 'success',
        text1: title,
        text2: meessage,
        topOffset: 100,
      });
      break;
    case 'error':
      Toast.show({
        type: 'error',
        text1: title,
        text2: meessage,
        topOffset: 100,
      });
      break;
    case 'info':
      Toast.show({
        type: 'info',
        text1: title,
        text2: meessage,
        topOffset: 100,
      });
      break;
    case 'warning':
      Toast.show({
        type: 'warning',
        text1: title,
        text2: meessage,
        topOffset: 100,
      });
      break;
    default:
      break;
  }
};

export const showCustomToast = (type: 'success' | 'error', message: string) => {
  Toast.show({
    type: 'customToast',
    text1: message,
    props: { type },
  });
};

// Define the unique service key for your custom ID
const SERVICE_ID = 'com.myapp.revenuecat.habibirizz';
const DUMMY_USERNAME = 'rc_user_identifier';

export async function generateAndStoreUserID() {
  // 1. Generate a new, unique ID (UUID)

  try {
    const newUserId = uuid.v4();
    // 2. Store the new ID securely
    const success = await Keychain?.setGenericPassword(
      DUMMY_USERNAME, // A static string (username field)
      newUserId, // Your custom ID (password field)
      {
        service: SERVICE_ID,
        // Optional, but recommended for max persistence on iOS
        accessible: Keychain?.ACCESSIBLE?.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      },
    );

    if (success) {
      console.log('Successfully stored new App User ID:', newUserId);
      return newUserId;
    }
  } catch (error) {
    console.error('Failed to store App User ID in Keychain/Keystore:', error);
  }
  return null; // Return null on failure
}

export async function retrieveUserID() {
  try {
    // The service option is key to retrieving the exact key you stored
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_ID,
    });

    if (credentials && credentials.password) {
      // credentials.username will be 'rc_user_identifier'
      // credentials.password will be your stored UUID
      console.log('Retrieved existing App User ID:', credentials?.password);
      return credentials?.password;
    } else {
      console.log('No App User ID found in secure storage.');
      return null; // No ID exists
    }
  } catch (error) {
    console.error(
      'Failed to retrieve App User ID from Keychain/Keystore:',
      error,
    );
    return null;
  }
}
