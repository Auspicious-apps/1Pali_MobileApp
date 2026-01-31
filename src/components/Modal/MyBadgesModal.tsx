import React, { Dispatch, SetStateAction, useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { BlurView } from "@react-native-community/blur";
import { CustomText } from "../CustomText";
import COLORS from "../../utils/Colors";
import CustomIcon from "../CustomIcon";
import ICONS from "../../assets/Icons";
import { horizontalScale, hp, verticalScale } from "../../utils/Metrics";
import PrimaryButton from "../PrimaryButton";
import { useAppSelector } from "../../redux/store";
import { useNavigation } from "@react-navigation/native";

export interface MyBadgeItem {
  id: string | number;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
}

interface MyBadgesModalProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}

const MyBadgesModal: React.FC<MyBadgesModalProps> = ({
  isVisible,
  setIsVisible,
}) => {
  const navigation = useNavigation<any>();
  const closeModal = () => {
    setIsVisible(false);
  };

  const { badges } = useAppSelector((state) => state.user);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeModal}
        style={styles.modalBackdrop}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={1}
          />
        ) : (
          <View style={styles.androidBackdrop} />
        )}

        <View style={styles.overlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
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
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.badgeRow}
                    onPress={closeModal}
                  >
                    <Image
                      source={{ uri: badge.iconPngUrl }}
                      style={styles.badgeImage}
                    />

                    <View style={styles.badgeTextContainer}>
                      <CustomText
                        fontFamily="GabaritoMedium"
                        fontSize={18}
                        color={COLORS.darkText}
                      >
                        {badge.title}
                      </CustomText>

                      <CustomText
                        fontFamily="SourceSansRegular"
                        fontSize={12}
                        color="#1D222B90"
                        numberOfLines={2}
                      >
                        {badge.milestone}
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            {/* See all button */}
            <PrimaryButton
              title="See all badges"
              onPress={() => {
                setIsVisible(false);
                setTimeout(() => {
                  navigation.navigate("accountStack", { screen: "badges" });
                }, 300);
              }}
              style={styles.button}
            />
          </TouchableOpacity>
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
