import { LogBox, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomToast from './src/components/CustomToast';
import NetworkLogger from './src/components/NetworkLogger';
import Routes from './src/routes';

LogBox.ignoreAllLogs();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={'light-content'} />
        <Routes />
        {__DEV__ && <NetworkLogger />}
        <Toast
          config={{
            customToast: props => <CustomToast {...props} type={props?.type} />,
          }}
          position="top"
          topOffset={50}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
