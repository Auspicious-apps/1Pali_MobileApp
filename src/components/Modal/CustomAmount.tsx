import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
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

interface CustomAmountSheetProps {
  onConfirm?: (amount: string) => void;
  initialAmount?: string;
}

export interface CustomAmountSheetRef {
  open: () => void;
  close: () => void;
}

const CustomAmount = forwardRef<CustomAmountSheetRef, CustomAmountSheetProps>(
  ({ initialAmount, onConfirm }, ref) => {
    const rbSheetRef = useRef<any>(null);
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

    const closeModal = () => {
      Keyboard.dismiss();
      rbSheetRef.current?.close();
    };

    useImperativeHandle(ref, () => ({
      open: () => {
        setAmount(initialAmount ?? "0");
        rbSheetRef.current?.open();
      },
      close: closeModal,
    }));

    const handleConfirm = () => {
      const numAmount = parseFloat(amount);
      if (numAmount >= 1) {
        if (onConfirm) onConfirm(amount);
        closeModal();
      }
    };

    return (
      <RBSheet
        ref={rbSheetRef}
        openDuration={250}
        draggable={true}
        customStyles={{
          container: [styles.container, {}],
          draggableIcon: styles.draggableIcon,
        }}
      >
        <View style={styles.content}>
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

          <View style={styles.keypad}>
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
                <CustomIcon Icon={ICONS.BackSpaceIcon} height={17} width={23} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RBSheet>
    );
  },
);

export default CustomAmount;

const styles = StyleSheet.create({
  content: {},
  container: {
    flexGrow: 1,
    borderTopLeftRadius: horizontalScale(20),
    borderTopRightRadius: horizontalScale(20),
  },
  draggableIcon: {
    backgroundColor: COLORS.greey,
    width: horizontalScale(40),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(5),
  },
  closeIcon: {
    position: "absolute",
    right: horizontalScale(14),
    top: horizontalScale(-4),
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
    marginBottom: verticalScale(100),
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
