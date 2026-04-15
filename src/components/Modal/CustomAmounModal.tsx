import { BlurView } from "@react-native-community/blur";
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ICONS from "../../assets/Icons";
import COLORS from "../../utils/Colors";
import {
  deviceWidth,
  horizontalScale,
  verticalScale,
} from "../../utils/Metrics";
import CustomIcon from "../CustomIcon";
import { CustomText } from "../CustomText";
import PrimaryButton from "../PrimaryButton";

const keypadButtons = [
  [
    { value: "1", letters: "" },
    { value: "2", letters: "ABC" },
    { value: "3", letters: "DEF" },
  ],
  [
    { value: "4", letters: "GHI" },
    { value: "5", letters: "JKL" },
    { value: "6", letters: "MNO" },
  ],
  [
    { value: "7", letters: "PQRS" },
    { value: "8", letters: "TUV" },
    { value: "9", letters: "WXYZ" },
  ],
];

interface CustomAmounModalProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  onConfirm?: (amount: string) => void;
  initialAmount?: string;
}
const CustomAmounModal: FC<CustomAmounModalProps> = ({
  isVisible,
  setIsVisible,
  onConfirm,
  initialAmount,
}) => {
  const insets = useSafeAreaInsets();

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 500,
        duration: 150,
        easing: Easing.bezier(0.4, 0, 1, 1),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };
  const translateY = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [amount, setAmount] = useState(initialAmount ?? "0");

  useEffect(() => {
    setAmount(initialAmount ?? "0");
  }, [initialAmount]);

  const handleNumberPress = (num: string) => {
    setAmount((prev) => {
      if (!prev || prev === "0") {
        return num;
      }
      return prev + num;
    });
  };

  const handleDelete = () => {
    setAmount((prev) => {
      if (!prev || prev.length <= 1) {
        return "0";
      }
      return prev.slice(0, -1);
    });
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (numAmount >= 1) {
      if (onConfirm) onConfirm(amount);
      closeModal();
    }
  };

  useEffect(() => {
    if (isVisible) {
      translateY.setValue(500);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 380,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeModal}
        style={styles.modalBackdrop}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            style={[StyleSheet.absoluteFill]}
            blurType="dark"
            blurAmount={2}
            pointerEvents="none"
          />
        ) : (
          <View style={styles.androidBackdrop} />
        )}

        <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />

        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY }],
                paddingBottom: Platform.select({
                  ios: insets.bottom > 0 ? insets.bottom : verticalScale(24),
                  android: insets.bottom + verticalScale(24),
                }),
              },
            ]}
            onStartShouldSetResponder={() => true}
            onResponderRelease={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.header}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={18}
                color={COLORS.darkText}
              >
                Custom Amount
              </CustomText>

              <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
                <CustomIcon Icon={ICONS.CloseIcon} height={30} width={30} />
              </TouchableOpacity>
            </View>

            {/* Subtitle */}
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={15}
              color={COLORS.appText}
              style={styles.subtitle}
            >
              Enter the custom amount you would like to donate every month.
              Minimum donation is $1.
            </CustomText>

            <View style={styles.amountDisplay}>
              <CustomText
                color={COLORS.darkText}
                fontSize={28}
                fontFamily="GabaritoSemiBold"
              >
                $ {amount || "0"}
              </CustomText>
            </View>

            {/* Confirm Button */}
            <PrimaryButton
              title="Confirm amount"
              onPress={handleConfirm}
              disabled={parseFloat(amount) < 1}
              style={{ marginBottom: 0 }}
            />

            <View
              style={[
                styles.keypad,
                {
                  paddingBottom: Platform.select({
                    ios:
                      insets.bottom > 0 ? verticalScale(10) : verticalScale(0),
                    android: insets.bottom ? insets.bottom : verticalScale(25),
                  }),
                },
              ]}
            >
              {keypadButtons.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.keypadRow}>
                  {row.map((button) => (
                    <TouchableOpacity
                      key={button.value}
                      style={styles.keyButton}
                      onPress={() => handleNumberPress(button.value)}
                    >
                      <CustomText
                        fontSize={24}
                        fontFamily="GabaritoRegular"
                        color={COLORS.darkText}
                      >
                        {button.value}
                      </CustomText>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              <View style={styles.keypadRow}>
                {/* Empty space for alignment */}
                <View style={styles.transparentKeyButton} />

                {/* 0 Button */}
                <TouchableOpacity
                  style={styles.keyButton}
                  onPress={() => handleNumberPress("0")}
                >
                  <CustomText
                    fontSize={24}
                    color={COLORS.darkText}
                    fontFamily="GabaritoRegular"
                  >
                    0
                  </CustomText>
                </TouchableOpacity>

                {/* Backspace Button */}
                <TouchableOpacity
                  style={styles.transparentKeyButton}
                  onPress={handleDelete}
                >
                  <CustomIcon
                    Icon={ICONS.BackSpaceIcon}
                    height={17}
                    width={23}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomAmounModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    width: "100%",
    borderRadius: 30,
    paddingTop: verticalScale(16),
    maxHeight: "80%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: horizontalScale(16),
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    right: horizontalScale(14),
  },
  subtitle: {
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
    paddingHorizontal: horizontalScale(20),
  },
  amountContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginBottom: verticalScale(24),
  },
  keypad: {
    backgroundColor: "#D8DADE",
    paddingVertical: verticalScale(5),
    marginTop: verticalScale(20),
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: verticalScale(8),
  },
  keyButton: {
    width: deviceWidth / 3 - horizontalScale(10),
    height: verticalScale(50),
    backgroundColor: COLORS.white,
    borderRadius: horizontalScale(8),
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 1px 2px 0px #898A8D",
  },
  transparentKeyButton: {
    width: deviceWidth / 3 - horizontalScale(10),
    height: verticalScale(50),
    backgroundColor: "transparent",
    borderRadius: horizontalScale(8),
    justifyContent: "center",
    alignItems: "center",
  },
  amountDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(30),
    marginHorizontal: horizontalScale(20),
    gap: horizontalScale(10),
    backgroundColor: COLORS.greyBackground,
    borderRadius: horizontalScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(16),
  },
});
