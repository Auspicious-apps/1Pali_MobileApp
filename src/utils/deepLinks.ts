import { BottomStackParams, MainStackParams } from "../typings/routes";

type MainStackScreen = Extract<Exclude<keyof MainStackParams, "tabs">, string>;
type BottomTabScreen = Extract<keyof BottomStackParams, string>;

export type DeepLinkTarget =
  | { type: "tab"; screen: BottomTabScreen }
  | { type: "main"; screen: MainStackScreen };

const LINK_HOSTS = new Set(["links.onepali.com", "links.onepali.app"]);
const PAYMENT_REDIRECT_HOST = "onepali-backend.onrender.com";

const normalizePath = (pathName: string): string =>
  pathName.replace(/^\/+|\/+$/g, "").toLowerCase();

const getPathFromUrl = (url: string): { host: string; path: string } | null => {
  try {
    // Avoid relying on the global URL type, which can be missing in some RN TS setups.
    const match = url.match(/^[a-z][a-z0-9+\-.]*:\/\/([^\/?#]+)([^?#]*)/i);
    if (!match) {
      return null;
    }

    const host = (match[1] ?? "").toLowerCase();
    const pathname = match[2] ?? "/";

    return {
      host,
      path: normalizePath(pathname),
    };
  } catch {
    return null;
  }
};

export const isPaymentRedirectDeepLink = (url: string): boolean => {
  const parsed = getPathFromUrl(url);

  if (!parsed || parsed.host !== PAYMENT_REDIRECT_HOST) {
    return false;
  }

  return (
    parsed.path === "subscription/success" ||
    parsed.path === "subscription/cancelled"
  );
};

export const resolveDeepLinkTarget = (url: string): DeepLinkTarget | null => {
  const parsed = getPathFromUrl(url);

  if (!parsed || !LINK_HOSTS.has(parsed.host)) {
    return null;
  }

  switch (parsed.path) {
    case "":
    case "home":
      return { type: "tab", screen: "home" };
    case "updates":
      return { type: "tab", screen: "updates" };
    case "gallery":
      return { type: "tab", screen: "art" };
    case "badges":
      return { type: "main", screen: "badges" };
    case "payment":
    case "resubscribe":
    case "donate":
      return { type: "main", screen: "manageDonation" };
    default:
      return null;
  }
};
