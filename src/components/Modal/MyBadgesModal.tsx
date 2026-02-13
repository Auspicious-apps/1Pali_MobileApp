import { BlurView } from "@react-native-community/blur";
import { useNavigation } from "@react-navigation/native";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  FlatList,
  ImageSourcePropType,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ICONS from "../../assets/Icons";
import { useAppSelector } from "../../redux/store";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale } from "../../utils/Metrics";
import BadgeIcon from "../BadgeIcon";
import CustomIcon from "../CustomIcon";
import { CustomText } from "../CustomText";
import PrimaryButton from "../PrimaryButton";

export interface MyBadgeItem {
  id: string | number;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
}

interface MyBadgesModalProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  navigateToBadge: any;
}

const MyBadgesModal: React.FC<MyBadgesModalProps> = ({
  isVisible,
  setIsVisible,
  navigateToBadge,
}) => {
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

  const { badges } = useAppSelector((state) => state.user);

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
                My Badges
              </CustomText>

              <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
                <CustomIcon Icon={ICONS.CloseIcon} height={30} width={30} />
              </TouchableOpacity>
            </View>

            {/* Badges list */}
            <FlatList
              data={badges?.badges}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const badge = item.badge;

                return (
                  <View style={styles.badgeRow}>
                    <BadgeIcon badge={badge.name} style={styles.badgeImage} />

                    <View style={styles.badgeTextContainer}>
                      <CustomText
                        fontFamily="GabaritoMedium"
                        fontSize={18}
                        color={COLORS.darkText}
                      >
                        {badge.title}
                      </CustomText>

                      <CustomText
                        fontFamily="SourceSansMedium"
                        fontSize={15}
                        color="#1D222B90"
                        numberOfLines={2}
                      >
                        {badge.milestone}
                      </CustomText>
                    </View>
                  </View>
                );
              }}
            />

            {/* See all button */}
            <PrimaryButton
              title="See all badges"
              onPress={() => {
                setIsVisible(false);
                navigateToBadge();
              }}
              style={styles.button}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default MyBadgesModal;

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
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(24),
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
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
  },
  closeIcon: {
    position: "absolute",
    right: horizontalScale(8),
    top: verticalScale(5),
  },
  listContent: {
    paddingTop: verticalScale(24),
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: verticalScale(8),
  },
  badgeImage: {
    width: horizontalScale(75),
    height: verticalScale(75),
    marginRight: horizontalScale(12),
    resizeMode: "contain",
  },
  badgeTextContainer: {
    flex: 1,
  },
  button: {
    marginTop: hp(2.5),
  },
});
