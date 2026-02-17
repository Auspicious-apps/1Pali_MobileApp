import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { StripeProvider } from "@stripe/stripe-react-native";
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
import { store } from "./src/redux/store";
import Routes from "./src/routes";
import COLORS from "./src/utils/Colors";
import { horizontalScale, verticalScale } from "./src/utils/Metrics";

LogBox.ignoreAllLogs();

function App() {
  GoogleSignin.configure({
    webClientId:
      "72813689825-4a7qk1lqdocivith6ooar38skujlp358.apps.googleusercontent.com",
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NetworkProvider>
        <StripeProvider
          publishableKey="pk_test_51SqHBdExhCC15nGQ18UmHov4F2tehEgOGbCE92V8NGizINZ26wFEz1wmsBR4feBelyBkuHGMc3GftNFAqSXwkTJw00oDSLVg4d"
          merchantIdentifier="merchant.org.onepali.stripe.subscription"
        >
          <Provider store={store}>
            <SafeAreaProvider>
              <StatusBar barStyle={"dark-content"} />
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
                        <CustomText fontFamily="bold" fontSize={14}>
                          {text1}
                        </CustomText>
                        <CustomText fontSize={12}>{text2}</CustomText>
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
