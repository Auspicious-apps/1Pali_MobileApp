import { LogBox, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomToast from './src/components/CustomToast';
import NetworkLogger from './src/components/NetworkLogger';
import Routes from './src/routes';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import CollectBadges from "./src/components/Modal/CollectBadges";

LogBox.ignoreAllLogs();

function App() {
  GoogleSignin.configure({
    webClientId:
      "72813689825-4a7qk1lqdocivith6ooar38skujlp358.apps.googleusercontent.com",
  });
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar barStyle={"light-content"} />
          <Routes />
          {/* <CollectBadges /> */}
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
    </GestureHandlerRootView>
  );
}

export default App;
