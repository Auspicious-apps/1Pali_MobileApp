import React, { Dispatch, SetStateAction } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { CustomText } from '../CustomText';
import COLORS from '../../utils/Colors';
import CustomIcon from '../CustomIcon';
import ICONS from '../../assets/Icons';
import IMAGES from '../../assets/Images';
import { horizontalScale, verticalScale } from '../../utils/Metrics';
import PrimaryButton from '../PrimaryButton';

interface InviteFriendModalProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  onInvitePress?: () => void;
}

const InviteFriendModal: React.FC<InviteFriendModalProps> = ({
  isVisible,
  setIsVisible,
  onInvitePress,
}) => {
  const closeModal = () => setIsVisible(false);

  const handleInvite = () => {
    if (onInvitePress) {
      onInvitePress();
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
                Invite a Friend
              </CustomText>

              <TouchableOpacity
                onPress={closeModal}
                style={styles.closeIcon}
              >
                <CustomIcon Icon={ICONS.CloseIcon} height={30} width={30} />
              </TouchableOpacity>
            </View>

            {/* Illustration */}
            <View style={styles.imageContainer}>
              <Image
                source={IMAGES.InviteFriends}
                resizeMode="contain"
                style={styles.image}
              />
            </View>

            {/* Action button */}
            <PrimaryButton
              title="Invite a friend"
              onPress={handleInvite}
              style={styles.button}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default InviteFriendModal;

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
  imageContainer: {
    marginTop: verticalScale(16),
    alignItems: 'center',
  },
  image: {
    width: horizontalScale(136),
    height: verticalScale(142),
    resizeMode: 'contain',
  },
  button: {
    marginVertical: verticalScale(32),
  },
});
