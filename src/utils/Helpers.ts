import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";

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

// Custom Toast Meessage
export const showToast = (
  type: "success" | "error" | "info" | "warning",
  title: string,
  meessage?: string,
) => {
  switch (type) {
    case "success":
      Toast.show({
        type: "success",
        text1: title,
        text2: meessage,
        topOffset: 100,
      });
      break;
    case "error":
      Toast.show({
        type: "error",
        text1: title,
        text2: meessage,
        topOffset: 100,
      });
      break;
    case "info":
      Toast.show({
        type: "info",
        text1: title,
        text2: meessage,
        topOffset: 100,
      });
      break;
    case "warning":
      Toast.show({
        type: "warning",
        text1: title,
        text2: meessage,
        topOffset: 100,
      });
      break;
    default:
      break;
  }
};

export const showCustomToast = (type: "success" | "error", message: string) => {
  Toast.show({
    type: "customToast",
    text1: message,
    props: { type },
  });
};

/**
 * Converts a number into a readable string with suffixes (K, M, B, T)
 * @param {number} num - The number to convert
 * @param {number} digits - Number of decimal places to keep (default: 1)
 */
export function formatNumber(num: number, digits = 1) {
  if (!num) return "0";

  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
  ];

  // Regex to remove trailing zeros (e.g., 1.0k -> 1k)
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });

  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : num.toPrecision(digits);
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};



export function getSupportingDuration(subscriptionDate: string) {
  const now = dayjs();
  const start = dayjs(subscriptionDate);

  const diffDays = now.diff(start, "day");

  if (diffDays <= 0) {
    return "Supporting since today";
  }

  // Less than 30 days → show days
  if (diffDays < 30) {
    return `Supporting for ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  }

  // Less than 365 days → show months (floor)
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Supporting for ${months} month${months > 1 ? "s" : ""}`;
  }

  // 365+ days → show years (floor)
  const years = Math.floor(diffDays / 365);
  return `Supporting for ${years} year${years > 1 ? "s" : ""}`;
}

export const showInAppNotification = (
  title: string,
  body: string,
  icon?: any, // Pass a require('./path') here
) => {
  Toast.show({
    type: "inAppNotification",
    text1: title,
    text2: body,
    topOffset: 60,
    visibilityTime: 6000,
    props: { icon }, // Passing custom icon to the config
  });
};