import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { StripeProvider } from "@stripe/stripe-react-native";
import { LogBox, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import CustomToast from "./src/components/CustomToast";
import NetworkLogger from "./src/components/NetworkLogger";
import { NetworkProvider } from "./src/Context/NetworkProvider";
import { store } from "./src/redux/store";
import Routes from "./src/routes";
import { useEffect } from "react";
import { initializeFirebaseMessaging } from "./src/Firebase/NotificationService";

LogBox.ignoreAllLogs();

function App() {
  GoogleSignin.configure({
    webClientId:
      "72813689825-4a7qk1lqdocivith6ooar38skujlp358.apps.googleusercontent.com",
  });

   useEffect(() => {
     initializeFirebaseMessaging();
   }, []);
   
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
