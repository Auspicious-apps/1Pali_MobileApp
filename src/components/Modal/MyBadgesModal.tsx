import React, { Dispatch, SetStateAction, useState } from "react";
import {
  FlatList,
  Image,
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

interface MyBadgesModalProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}

const MyBadgesModal: React.FC<MyBadgesModalProps> = ({
  isVisible,
  setIsVisible,
}) => {
  const { badges } = useAppSelector((state) => state.user);

  const badgeList = [
    ...(badges?.growthBadges || []),
    ...(badges?.impactBadges || []),
    ...(badges?.artBadges || []),
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const closeModal = () => {
    setActiveIndex(null);
    setIsVisible(false);
  };

  const activeBadge = activeIndex !== null ? badgeList[activeIndex] : null;

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
        style={{ flex: 1 }}
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
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContainer}
          >
            {/* 🔹 HEADER */}
            <View style={styles.header}>
              <CustomText fontFamily="GabaritoSemiBold" fontSize={18}>
                {activeIndex === null ? "My Badges" : "Badge Details"}
              </CustomText>

              <TouchableOpacity
                onPress={() =>
                  activeIndex !== null ? setActiveIndex(null) : closeModal()
                }
                style={styles.closeIcon}
              >
                <CustomIcon Icon={ICONS.CloseIcon} height={30} width={30} />
              </TouchableOpacity>
            </View>

            {/* 🔹 LIST VIEW */}
            {activeIndex === null && (
              <>
                <FlatList
                  data={badgeList}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={styles.badgeRow}
                      activeOpacity={0.8}
                      onPress={() => setActiveIndex(index)}
                    >
                      <Image
                        source={{ uri: item.badge.iconPngUrl }}
                        style={styles.badgeImage}
                      />

                      <View style={{ flex: 1 }}>
                        <CustomText fontSize={18} fontFamily="GabaritoMedium">
                          {item.badge.title}
                        </CustomText>
                        <CustomText
                          fontSize={12}
                          color="#1D222B90"
                          numberOfLines={2}
                        >
                          {item.badge.description}
                        </CustomText>
                      </View>
                    </TouchableOpacity>
                  )}
                />

                <PrimaryButton
                  title="See all badges"
                  onPress={closeModal}
                  style={{ marginTop: hp(2.5) }}
                />
              </>
            )}

            {/* 🔹 DETAIL VIEW */}
            {activeBadge && (
              <View style={styles.detailContainer}>
                <Image
                  source={{ uri: activeBadge.badge.iconPngUrl }}
                  style={styles.detailImage}
                  resizeMode="contain"
                />

                <CustomText fontSize={18} fontFamily="GabaritoMedium">
                  {activeBadge.badge.title}
                </CustomText>

                <CustomText fontSize={14} color="#1D222B80">
                  Awarded for supporting{" "}
                  {activeBadge.metadata?.consecutiveMonths
                    ? `${activeBadge.metadata.consecutiveMonths} months`
                    : "1 month"}
                </CustomText>

                <View style={styles.divider} />

                <CustomText
                  fontSize={16}
                  style={{ width: "70%", textAlign: "center" }}
                >
                  {activeBadge.badge.description}
                </CustomText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default MyBadgesModal;

const styles = StyleSheet.create({
  androidBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
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
    paddingBottom: verticalScale(30),
    maxHeight: "80%",
  },
  header: {
    alignItems: "center",
    paddingVertical: verticalScale(8),
  },
  closeIcon: {
    position: "absolute",
    right: horizontalScale(8),
    top: verticalScale(5),
  },
  listContent: {
    paddingTop: verticalScale(20),
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: verticalScale(12),
  },
  badgeImage: {
    width: horizontalScale(70),
    height: verticalScale(70),
    marginRight: horizontalScale(12),
  },
  detailContainer: {
    alignItems: "center",
    marginTop: verticalScale(30),
    gap: verticalScale(12),
  },
  detailImage: {
    width: horizontalScale(70),
    height: verticalScale(70),
  },
  divider: {
    width: horizontalScale(100),
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginVertical: verticalScale(16),
  },
});
