import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import NetInfo from "@react-native-community/netinfo";
import {
  View,
  Image,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import COLORS from "../utils/Colors";
import { CustomText } from "../components/CustomText";
import { verticalScale, horizontalScale } from "../utils/Metrics";
import PrimaryButton from "../components/PrimaryButton";
import { SafeAreaView } from "react-native-safe-area-context";
import IMAGES from "../assets/Images";

interface NetworkContextType {
  isConnected: boolean;
  checkConnection: () => void;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context)
    throw new Error("useNetwork must be used within NetworkProvider");
  return context;
};

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    const state = await NetInfo.fetch();
    const connected = state.isConnected ?? false;
    setIsConnected(connected);
    setIsVisible(!connected);
    setChecking(false);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      setIsVisible(!connected);
    });

    checkConnection();
    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected, checkConnection }}>
      {children}

      <Modal visible={isVisible} transparent animationType="fade">
        <SafeAreaView style={styles.overlay}>
          <View style={styles.card}>
            <Image
              source={IMAGES.ChangedSplash}
              style={styles.image}
              resizeMode="contain"
            />

            <CustomText
              fontFamily="GabaritoBold"
              fontSize={22}
              color={COLORS.darkText}
              style={{ marginBottom: verticalScale(6) }}
            >
              No Internet Connection
            </CustomText>

            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={14}
              color={COLORS.appText}
              style={styles.desc}
            >
              Please check your Wi-Fi or mobile data and try again.
            </CustomText>

            <PrimaryButton
              title={checking ? "Checking..." : "Try Again"}
              onPress={checkConnection}
              disabled={checking}
              style={styles.button}
            />

            {checking && (
              <ActivityIndicator
                size="small"
                color={COLORS.white}
                style={{ marginTop: verticalScale(10) }}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </NetworkContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: verticalScale(24),
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    elevation: 10,
  },
  image: {
    width: 90,
    height: 90,
    marginBottom: verticalScale(15),
  },
  desc: {
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  button: {
    width: "100%",
    borderRadius: 50,
    backgroundColor: COLORS.darkText,
  },
});
