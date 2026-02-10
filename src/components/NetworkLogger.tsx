import React from "react";
import { StyleSheet, TouchableOpacity, Text, Modal } from "react-native";
import NL from "react-native-network-logger";
import { useState } from "react";
import COLORS from "../utils/Colors";
import { SafeAreaView } from "react-native-safe-area-context";

const NetworkLogger = ({ onPress }: { onPress?: () => void }) => {
  const [isNetworkModalVisible, setIsNetworkModalVisible] = useState(false);
  return (
    <>
      <Modal
        style={styles.modal}
        visible={isNetworkModalVisible}
        // onBackButtonPress={() => setIsNetworkModalVisible(false)}
      >
        <SafeAreaView style={styles.contentContainer} edges={["top"]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsNetworkModalVisible(false)}
          >
            <Text style={styles.closeButtonTitle}>{"CLOSE"}</Text>
          </TouchableOpacity>
          <NL />
        </SafeAreaView>
      </Modal>
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          onPress && onPress();
          setIsNetworkModalVisible(true);
        }}
      >
        <Text maxFontSizeMultiplier={1} style={styles.content}>
          {"Network Logs"}
        </Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    backgroundColor: COLORS.white,
  },
  container: {
    width: 45,
    height: 45,
    position: "absolute",
    left: 24,
    bottom: 80,
    borderRadius: 45,
    backgroundColor: COLORS.darkGreen,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  content: {
    fontSize: 9,
    textAlign: "center",
    color: "white",
  },
  contentContainer: {
    flex: 1,
  },
  closeButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButtonTitle: {
    textAlign: "center",
  },
});

export default React.memo(NetworkLogger);
