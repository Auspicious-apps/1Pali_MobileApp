import React, { Dispatch, SetStateAction, useState } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { CustomText } from '../CustomText';
import COLORS from '../../utils/Colors';
import CustomIcon from '../CustomIcon';
import ICONS from '../../assets/Icons';
import { horizontalScale, hp, verticalScale } from '../../utils/Metrics';
import PrimaryButton from '../PrimaryButton';

export interface MyBadgeItem {
  id: number;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
}

interface MyBadgesModalProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  badges: MyBadgeItem[];
  onSeeAllPress?: () => void;
  onSelectBadge?: (badge: MyBadgeItem) => void;
}

const MyBadgesModal: React.FC<MyBadgesModalProps> = ({
  isVisible,
  setIsVisible,
  badges,
  onSeeAllPress,
  onSelectBadge,
}) => {
  const [visibleCount, setVisibleCount] = useState(2);

  const closeModal = () => {
    setIsVisible(false);
    setVisibleCount(2);
  };

  const handleSeeAll = () => {
    if (visibleCount < badges.length) {
      setVisibleCount(badges.length);
    }

    if (onSeeAllPress) {
      onSeeAllPress();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeModal}
        style={{ flex: 1 }}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={0.1}
          reducedTransparencyFallbackColor="white"
        />

        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
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
              data={badges.slice(0, visibleCount)}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.badgeRow}
                  onPress={() => {
                    if (onSelectBadge) {
                      onSelectBadge(item);
                    }
                    closeModal();
                  }}
                >
                  <Image source={item.image} style={styles.badgeImage} />
                  <View style={styles.badgeTextContainer}>
                    <CustomText
                      fontFamily="GabaritoMedium"
                      fontSize={18}
                      color={COLORS.darkText}
                    >
                      {item.title}
                    </CustomText>
                    <CustomText
                      fontFamily="SourceSansRegular"
                      fontSize={12}
                      color={'#1D222B90'}
                    >
                      {item.subtitle}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              )}
            />

            {/* See all button */}
            <PrimaryButton
              title="See all badges"
              onPress={handleSeeAll}
              style={styles.button}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default MyBadgesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 6,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    width: '100%',
    borderRadius: 30,
    paddingTop: verticalScale(16),
    paddingHorizontal: horizontalScale(16),
    paddingBottom: verticalScale(24),
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
  },
  closeIcon: {
    position: 'absolute',
    right: horizontalScale(8),
    top: verticalScale(5),
  },
  listContent: {
    paddingTop: verticalScale(24),
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: verticalScale(8),
  },
  badgeImage: {
    width: horizontalScale(75),
    height: verticalScale(75),
    marginRight: horizontalScale(12),
    resizeMode: 'contain',
  },
  badgeTextContainer: {
    flex: 1,
  },
  button: {
    marginTop: hp(2.5),
  },
});
