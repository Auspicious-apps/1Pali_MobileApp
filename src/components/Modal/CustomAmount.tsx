import { BlurView } from "@react-native-community/blur";
import React, {
  Dispatch,
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
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import COLORS from "../../utils/Colors";
import { horizontalScale, responsiveFontSize, verticalScale } from "../../utils/Metrics";
import CustomIcon from "../CustomIcon";
import { CustomText } from "../CustomText";
import PrimaryButton from "../PrimaryButton";
import ICONS from "../../assets/Icons";
import FONTS from "../../assets/fonts";

interface CustomAmountProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  onConfirm?: (amount: string) => void;
  initialAmount?: string;
}

const CustomAmount: React.FC<CustomAmountProps> = ({
  isVisible,
  setIsVisible,
  onConfirm,
  initialAmount = '1',
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const inputRef = useRef<TextInput>(null);
  const translateY = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
const focusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeModal = () => {
    // Cancel any pending focus
    if (focusTimeout.current) {
      clearTimeout(focusTimeout.current);
      focusTimeout.current = null;
    }
    Keyboard.dismiss();
    setTimeout(() => {
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
    }, 50); // small delay for smooth UX
  };

  useEffect(() => {
    if (isVisible) {
      setAmount(initialAmount);
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
      ]).start(() => {
        focusTimeout.current = setTimeout(() => {
          if (isVisible) inputRef.current?.focus();
        }, 400);
      });
    } else {
      // If modal is not visible, cancel any pending focus
      if (focusTimeout.current) {
        clearTimeout(focusTimeout.current);
        focusTimeout.current = null;
      }
    }
    // Cleanup on unmount
    return () => {
      if (focusTimeout.current) {
        clearTimeout(focusTimeout.current);
        focusTimeout.current = null;
      }
    };
  }, [isVisible, initialAmount]);

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (numAmount >= 1) {
      if (onConfirm) onConfirm(amount);
      closeModal();
    }
  };

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
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={2}
            pointerEvents="none"
          />
        ) : (
          <View style={styles.androidBackdrop} />
        )}

        <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />

        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <Animated.View
            style={[styles.modalContainer, { transform: [{ translateY }] }]}
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
            <CustomText fontFamily="GabaritoRegular" fontSize={15} color={COLORS.appText} style={styles.subtitle}>
              Enter the custom amount you would like to donate every month.
              Minimum donation is $1.
            </CustomText>

            {/* Amount Display Field */}
            <View style={styles.inputContainer}>
              <CustomText
                fontFamily="GabaritoSemiBold"
                style={styles.hashText}
              >
                $
              </CustomText>
              <TextInput
                ref={inputRef}
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="number-pad"
                inputMode="decimal"
                maxLength={8}
                selectTextOnFocus
                returnKeyType={Platform.OS === 'ios' ? 'default' : 'done'}
              />
            </View>

            {/* Confirm Button */}
            <PrimaryButton
              title="Confirm amount"
              onPress={handleConfirm}
              disabled={parseFloat(amount || "0") < 1}
              style={{ marginBottom: 0 }}
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomAmount;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
  },
  androidBackdrop: {
    ...StyleSheet.absoluteFillObject,
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(12),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    right: horizontalScale(4),
    top: horizontalScale(-4),
  },
  subtitle: {
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
  },
  amountContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginBottom: verticalScale(24),
  },
  amountInput: {
    fontFamily: FONTS.GabaritoSemiBold,
    fontSize: responsiveFontSize(32),
    color: COLORS.darkText,
    width: "100%",
    paddingVertical: verticalScale(12),
  },
  inputContainer: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    gap: horizontalScale(12),
    marginBottom: verticalScale(24),
  },
  hashText: {
    fontSize: responsiveFontSize(32),
    color: COLORS.darkText,
  },
});
