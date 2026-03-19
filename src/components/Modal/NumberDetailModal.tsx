import { BlurView } from "@react-native-community/blur";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ICONS from "../../assets/Icons";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale } from "../../utils/Metrics";
import CustomIcon from "../CustomIcon";
import { CustomText } from "../CustomText";

interface NumnerDetailModalProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}

const NumnerDetailModal: React.FC<NumnerDetailModalProps> = ({
  isVisible,
  setIsVisible,
}) => {
  const translateY = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

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
    ]).start(() => setIsVisible(false));
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
        style={{ flex: 1 }}
        onPress={closeModal}
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

        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY }],
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
                Your OnePali Number
              </CustomText>

              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <CustomIcon
                  Icon={ICONS.CloseIcon}
                  height={verticalScale(30)}
                  width={verticalScale(30)}
                />
              </TouchableOpacity>
            </View>

            {/* Info Content (New UI) */}
            <View style={styles.infoContainer}>
              <View style={styles.row}>
                <CustomText fontFamily="GabaritoRegular" fontSize={28}>
                  🔢
                </CustomText>
                <View style={styles.textWrap}>
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={18}
                    color={COLORS.darkText}
                  >
                    It’s uniquely yours.
                  </CustomText>
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={15}
                    color="#6B7280"
                  >
                    No one else in the movement will ever have this number.
                  </CustomText>
                </View>
              </View>

              <View style={styles.row}>
                <CustomText fontFamily="GabaritoRegular" fontSize={28}>
                  🌐
                </CustomText>
                <View style={styles.textWrap}>
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={18}
                    color={COLORS.darkText}
                  >
                    Every number is a person.
                  </CustomText>
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={15}
                    color="#6B7280"
                  >
                    Together, one million numbers means one million stands for
                    Palestine.
                  </CustomText>
                </View>
              </View>

              <View style={styles.row}>
                <CustomText fontFamily="GabaritoRegular" fontSize={28}>
                  🎲
                </CustomText>
                <View style={styles.textWrap}>
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={18}
                    color={COLORS.darkText}
                  >
                    Don’t love it?
                  </CustomText>
                  <CustomText
                    fontFamily="GabaritoRegular"
                    fontSize={15}
                    color="#6B7280"
                  >
                    Tap ‘Choose my own number’ to pick one that means something
                    to you.
                  </CustomText>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default NumnerDetailModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 6,
  },

  modalContainer: {
    backgroundColor: "#F5F6F8", 
    width: "100%",
    borderRadius: 30,
    paddingTop: verticalScale(10),
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(32),

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  androidBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  header: {
    alignItems: "center",
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
  },

  closeBtn: {
    position: "absolute",
    right: horizontalScale(8),
    top: verticalScale(8),
  },

  infoContainer: {
    marginTop: verticalScale(24),
    gap: verticalScale(24),
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: horizontalScale(12),
  },

  textWrap: {
    flex: 1,
  },
});
