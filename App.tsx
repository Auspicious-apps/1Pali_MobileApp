import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { StripeProvider } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { Image, LogBox, StatusBar, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import IMAGES from "./src/assets/Images";
import { CustomText } from "./src/components/CustomText";
import CustomToast from "./src/components/CustomToast";
import NetworkLogger from "./src/components/NetworkLogger";
import { NetworkProvider } from "./src/Context/NetworkProvider";
import { setStripeBootstrap } from "./src/redux/slices/StripeBootstrapSlice";
import { store } from "./src/redux/store";
import Routes from "./src/routes";
import ENDPOINTS from "./src/service/ApiEndpoints";
import { fetchData } from "./src/service/ApiService";
import COLORS from "./src/utils/Colors";
import { horizontalScale, verticalScale } from "./src/utils/Metrics";

LogBox.ignoreAllLogs();

type StripeConfigResponse = {
  mode: "live" | "test";
  publishableKey: string;
  productId: string;
};

function App() {
  GoogleSignin.configure({
    webClientId:
      "72813689825-4a7qk1lqdocivith6ooar38skujlp358.apps.googleusercontent.com",
    iosClientId:
      "72813689825-3uvkvar5timqdl5bce2gkenpgrfs2g60.apps.googleusercontent.com",
  });

  const [stripePublishableKey, setStripePublishableKey] = useState<
    string | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetchData<StripeConfigResponse>(
          ENDPOINTS.StripeConfig,
        );
        const data = (res as any)?.data?.data;
        const key = data?.publishableKey;
        const productId = data?.productId;
        const mode = data?.mode;

        if (
          isMounted &&
          typeof key === "string" &&
          key.length > 0 &&
          typeof productId === "string" &&
          productId.length > 0 &&
          (mode === "live" || mode === "test")
        ) {
          setStripePublishableKey(key);
          store.dispatch(
            setStripeBootstrap({ mode, publishableKey: key, productId }),
          );
        } else {
          throw new Error("Invalid stripe-config response");
        }
      } catch (e) {
        // Fallback so app still works if network fails.
        // Keep these values in sync with your backend live config.
        if (!isMounted) return;
        console.warn(
          "Failed to fetch Stripe publishable key/product id, using fallback",
          e,
        );
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!stripePublishableKey) {
    return;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NetworkProvider>
        <StripeProvider
          publishableKey={stripePublishableKey}
          merchantIdentifier="merchant.org.onepali.stripe.subscription"
        >
          <Provider store={store}>
            <SafeAreaProvider>
              <StatusBar
                barStyle={"dark-content"}
                backgroundColor={COLORS.white}
              />
              <Routes />
              {__DEV__ && <NetworkLogger />}
              <Toast
                config={{
                  customToast: (props) => (
                    <CustomToast {...props} type={props?.type} />
                  ),
                  inAppNotification: ({ text1, text2, props }: any) => (
                    <View style={styles.notificationContainer}>
                      {/* App Logo or Icon */}
                      <View style={styles.iconContainer}>
                        {props.icon ? (
                          <Image source={props.icon} style={styles.logo} />
                        ) : (
                          <Image
                            source={IMAGES.OnePaliLogo}
                            style={styles.logo}
                          />
                        )}
                      </View>

                      <View style={styles.textContainer}>
                        <CustomText
                          fontFamily="bold"
                          fontSize={14}
                          color={COLORS.darkText}
                        >
                          {text1 || "Notification"}
                        </CustomText>
                        <CustomText fontSize={12} color={COLORS.darkText}>
                          {text2}
                        </CustomText>
                      </View>
                    </View>
                  ),
                }}
                position="top"
                topOffset={50}
              />
            </SafeAreaProvider>
          </Provider>
        </StripeProvider>
      </NetworkProvider>
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  notificationContainer: {
    width: "90%",
    backgroundColor: COLORS.white, // Dark theme
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(10),
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  iconContainer: {
    marginRight: 12,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 8,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
  },
});
