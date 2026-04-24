import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { FC, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShareLib from 'react-native-share';
import ICONS from '../../assets/Icons';
import IMAGES from '../../assets/Images';
import BadgeIcon from '../../components/BadgeIcon';
import CustomIcon from '../../components/CustomIcon';
import { CustomText } from '../../components/CustomText';
import ProgressBar from '../../components/ProgressBar';
import {
  resetKlaviyoProfile,
  resetOnboardingTrackingState,
} from '../../Context/klaviyoClientService';
import { clearCollectBadges } from '../../redux/slices/CollectBadgesSlice';
import { clearReceipts } from '../../redux/slices/ReceiptsSlice';
import {
  clearUserData,
  selectGrowthBadges,
  selectIdentityBadges,
  selectImpactBadges,
  selectLatestCommunityBadges,
  selectLatestGrowthBadges,
  selectLatestImpactBadges,
} from '../../redux/slices/UserSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import ENDPOINTS from '../../service/ApiEndpoints';
import { deleteData } from '../../service/ApiService';
import { resetRateUsTracking } from '../../service/RateUsService';
import { AccountScreenProps } from '../../typings/routes';
import COLORS from '../../utils/Colors';
import STORAGE_KEYS from '../../utils/Constants';
import {
  deleteLocalStorageData,
  formatDate,
  formatMembershipDuration,
} from '../../utils/Helpers';
import {
  horizontalScale,
  isTablet,
  verticalScale,
  wp,
} from '../../utils/Metrics';

const Account: FC<AccountScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] =
    useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const growthBadges = useAppSelector(selectGrowthBadges);
  const impactBadges = useAppSelector(selectImpactBadges);
  const identityBadges = useAppSelector(selectIdentityBadges);
  const latestGrowthBadge = useAppSelector(selectLatestGrowthBadges);
  const latestCommunityBadge = useAppSelector(selectLatestCommunityBadges);
  const latestImpactBadge = useAppSelector(selectLatestImpactBadges);

  const handleAuthCleanupAndNavigate = async () => {
    // Clear Redux slices
    dispatch(clearUserData());
    dispatch(clearCollectBadges());
    dispatch(clearReceipts());

    // Clear local storage tokens
    deleteLocalStorageData(STORAGE_KEYS.accessToken);
    deleteLocalStorageData(STORAGE_KEYS.refreshToken);
    deleteLocalStorageData(STORAGE_KEYS.expiresIn);

    // Reset tracking states for next login
    await resetOnboardingTrackingState();
    resetKlaviyoProfile();
    await resetRateUsTracking();

    // Sign out from Google if available
    try {
      await GoogleSignin.signOut();
    } catch (googleSignOutError) {
      console.log('Google sign out error:', googleSignOutError);
    }

    navigation.replace('OnBoardingStack', { screen: 'splash' });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') {
      return;
    }
    try {
      setIsDeletingAccount(true);
      await deleteData(ENDPOINTS.DeleteAccount);
      setDeleteConfirmText('');
      setIsDeleteAccountModalVisible(false);
      await handleAuthCleanupAndNavigate();
    } catch (error: any) {
      console.log('Delete account error:', error);
      Alert.alert(
        'Unable to delete account',
        error?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const ACCOUNT_OPTIONS = [
    {
      id: 'member',
      icon: ICONS.HashIcon,
      label: 'Member number',
      value: `#${user?.assignedNumber}`,
      onPress: undefined,
    },
    {
      id: 'email',
      icon: ICONS.EmailIcon,
      label: 'Email',
      value: user?.email,
      onPress: undefined,
    },
    {
      id: 'badges',
      icon: ICONS.BadgesIcon,
      label: 'Badges',
      arrow: true,
      onPress: () => navigation.navigate('badges', {}),
    },
    {
      id: 'donations',
      icon: ICONS.dollerIcon,
      label: 'Manage Donations',
      arrow: true,
      onPress: () => navigation.navigate('manageDonation'),
    },
    {
      id: 'receipts',
      icon: ICONS.ReceiptIcon,
      label: 'Receipts',
      arrow: true,
      onPress: () => {
        navigation.navigate('receipts');
      },
    },
    {
      id: 'faqs',
      icon: ICONS.FAQsIcon,
      label: 'FAQs',
      arrow: true,
      onPress: () => {
        navigation.navigate('faq');
      },
    },
    {
      id: 'meca',
      icon: ICONS.PrivacyIcon,
      label: "MECA's Privacy policy",
      arrow: true,
      onPress: () => navigation.navigate('mecaPrivacyPolicy'),
    },
    {
      id: 'privacy',
      icon: ICONS.PrivacyIcon,
      label: "Onepali's Privacy policy",
      arrow: true,
      onPress: () => {
        navigation.navigate('privacyPolicy');
      },
    },
    {
      id: 'terms',
      icon: ICONS.TermIcon,
      label: "Onepali's Terms of Use",
      arrow: true,
      onPress: () => navigation.navigate('termsConditions'),
    },
    {
      id: 'signout',
      icon: ICONS.SignoutIcon,
      label: 'Sign Out',
      danger: false,
      onPress: () => {
        Alert.alert('Sign out', 'Are you sure you want to sign out?', [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign out',
            style: 'destructive',
            onPress: async () => {
              try {
                await handleAuthCleanupAndNavigate();
              } catch (error) {
                console.log('Logout error:', error);
              }
            },
          },
        ]);
      },
    },
    {
      id: 'deleteAccount',
      icon: ICONS.DeleteIcon,
      label: 'Delete Account',
      danger: true,
      onPress: () => {
        setDeleteConfirmText('');
        setIsDeleteAccountModalVisible(true);
      },
    },
  ];

  const renderRow = (item: any, index: number, total: number) => {
    const Container = item.onPress ? TouchableOpacity : View;
    const isLastItem = index === total - 1;

    return (
      <Container
        key={item.id}
        onPress={item.onPress}
        activeOpacity={0.7}
        style={[styles.row, isLastItem && { borderBottomWidth: 0 }]}
      >
        <View style={styles.leftRow}>
          <CustomIcon
            Icon={item.icon}
            height={verticalScale(32)}
            width={verticalScale(32)}
          />
          <CustomText
            fontFamily='GabaritoRegular'
            fontSize={16}
            color={item.danger ? COLORS.darkRed : COLORS.darkText}
          >
            {item.label}
          </CustomText>
        </View>

        <View style={styles.rightRow}>
          {item.value && (
            <CustomText
              fontFamily='GabaritoRegular'
              fontSize={16}
              color={COLORS.appText}
            >
              {item.value}
            </CustomText>
          )}

          {item.arrow && (
            <CustomIcon
              Icon={ICONS.ArrowRight}
              height={verticalScale(24)}
              width={verticalScale(24)}
            />
          )}
        </View>
      </Container>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <ScrollView
          bounces={false}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
          contentContainerStyle={{
            paddingBottom: verticalScale(70),
          }}
        >
          <View style={{ alignItems: 'center', width: '100%' }}>
            <Image
              source={IMAGES.OnePaliLogo}
              style={styles.logo}
            />
            <View style={{ marginTop: verticalScale(30), width: '100%' }}>
              <CustomText
                fontFamily='GabaritoSemiBold'
                fontSize={42}
                color={COLORS.darkText}
                style={{ textAlign: 'center' }}
              >
                #{user?.assignedNumber}
              </CustomText>
              <CustomText
                fontFamily='GabaritoRegular'
                fontSize={18}
                color={COLORS.appText}
                style={{ textAlign: 'center' }}
              >
                Member since {formatDate(user?.createdAt!)}
              </CustomText>
            </View>
            <View style={styles.card}>
              {/* Badge Row */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate('badges', {});
                }}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: '#91919110',
                    paddingHorizontal: horizontalScale(12),
                    paddingVertical: verticalScale(10),
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                  }}
                >
                  <CustomText
                    fontFamily='GabaritoMedium'
                    fontSize={16}
                    color={COLORS.darkText}
                  >
                    {latestGrowthBadge?.badge.name
                      ? latestGrowthBadge.badge.name.charAt(0).toUpperCase() +
                        latestGrowthBadge.badge.name.slice(1).toLowerCase()
                      : ''}
                  </CustomText>
                  <CustomText
                    fontFamily='GabaritoRegular'
                    fontSize={14}
                    color={COLORS.appText}
                  >
                    {latestGrowthBadge?.badge.name === 'Seed'
                      ? 'Day 1  '
                      : Number(user?.consecutivePaidMonths!) +
                        ' ' +
                        (Number(user?.consecutivePaidMonths!) > 1
                          ? 'months'
                          : 'month')}
                  </CustomText>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    right: horizontalScale(isTablet ? 25 : 15),
                  }}
                >
                  {[
                    latestGrowthBadge,
                    latestCommunityBadge,
                    ...identityBadges,
                    latestImpactBadge,
                  ]
                    ?.filter(Boolean)
                    ?.map((badge, index) => (
                      <BadgeIcon
                        key={badge?.id}
                        badge={badge?.badge.name!}
                        style={{
                          width: horizontalScale(72),
                          height: verticalScale(72),
                          marginLeft:
                            index === 0
                              ? 0
                              : horizontalScale(isTablet ? -45 : -35),
                          borderRadius: horizontalScale(36),
                          zIndex: growthBadges?.length - index,
                          resizeMode: 'contain',
                        }}
                      />
                    ))}
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('badges', {});
                  }}
                >
                  <CustomIcon
                    Icon={ICONS.RightArrow}
                    height={verticalScale(24)}
                    width={verticalScale(24)}
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: '#EAEAEA',
                  marginBottom: 12,
                }}
              />
              {/* Stats Row */}
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: verticalScale(12),
                  paddingHorizontal: horizontalScale(20),
                }}
              >
                <View
                  style={{
                    alignItems: 'center',
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <CustomText
                      fontFamily='GabaritoRegular'
                      fontSize={18}
                      color={COLORS.darkText}
                    >
                      {`$${
                        user?.hasIncludeProcessingFees
                          ? user?.totalDonationsExcludingFees
                          : user?.totalDonations
                      }`}
                    </CustomText>
                    <CustomText
                      fontFamily='GabaritoRegular'
                      fontSize={14}
                      color={COLORS.appText}
                    >
                      Donated
                    </CustomText>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: 'center',
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <CustomText
                      fontFamily='GabaritoRegular'
                      fontSize={18}
                      color={COLORS.darkText}
                    >
                      {identityBadges?.[0]?.badge?.name}
                    </CustomText>
                    <CustomText
                      fontFamily='GabaritoRegular'
                      fontSize={14}
                      color={COLORS.appText}
                      style={{ textAlign: 'center' }}
                    >
                      First{' '}
                      {identityBadges?.[0]?.badge?.milestone.split(' ')[2]}{' '}
                    </CustomText>
                  </View>
                </View>
                <View
                  style={{
                    alignItems: 'center',
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <CustomText
                      fontFamily='GabaritoRegular'
                      fontSize={18}
                      color={COLORS.darkText}
                    >
                      {formatMembershipDuration(user?.consecutivePaidMonths!)}
                    </CustomText>
                    <CustomText
                      fontFamily='GabaritoRegular'
                      fontSize={14}
                      color={COLORS.appText}
                    >
                      Active
                    </CustomText>
                  </View>
                </View>
              </View>
              {/* Progress Bar */}

              <View style={{}}>
                <ProgressBar
                  hideFooter
                  isAccountScreen
                />
              </View>

              {user?.nextGrowthBadge && (
                <CustomText
                  fontFamily='GabaritoRegular'
                  fontSize={14}
                  color={'#1D222B90'}
                  style={{ textAlign: 'center', marginTop: verticalScale(8) }}
                >
                  {user?.nextGrowthBadge?.name} badge unlocked in{' '}
                  {user?.nextGrowthBadge?.monthsRemaining} months
                </CustomText>
              )}
            </View>

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: COLORS.borderColor,
                width: wp(90),
                alignSelf: 'center',
              }}
            >
              <View style={styles.listContainer}>
                {ACCOUNT_OPTIONS.map((item, index) =>
                  renderRow(item, index, ACCOUNT_OPTIONS.length),
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal
          transparent
          visible={isDeleteAccountModalVisible}
          animationType='fade'
          onRequestClose={() => {
            if (!isDeletingAccount) {
              setDeleteConfirmText('');
              setIsDeleteAccountModalVisible(false);
            }
          }}
        >
          <View style={styles.deleteModalOverlay}>
            <KeyboardAvoidingView
              style={styles.deleteModalKeyboardWrap}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={verticalScale(24)}
            >
              <View style={styles.deleteModalContainer}>
                <ScrollView
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps='handled'
                  style={styles.deleteModalScroll}
                  contentContainerStyle={styles.deleteModalScrollContent}
                >
                  <CustomText
                    fontFamily='GabaritoSemiBold'
                    fontSize={22}
                    color={COLORS.darkText}
                  >
                    Delete Account Permanently?
                  </CustomText>

                  <CustomText
                    fontFamily='GabaritoRegular'
                    fontSize={14}
                    color={COLORS.appText}
                    style={{ marginTop: verticalScale(8), lineHeight: 22 }}
                  >
                    This action cannot be undone. If you continue, we will
                    permanently remove or mark as deleted:
                  </CustomText>

                  <View
                    style={{
                      marginTop: verticalScale(10),
                      gap: verticalScale(6),
                    }}
                  >
                    {[
                      'Assigned number (released back to pool)',
                      'All badges, comments, likes and shares will be deleted',
                      'Subscription record (marked deleted)',
                      'Stripe subscription (canceled)',
                    ].map((item) => (
                      <View
                        key={item}
                        style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                      >
                        <CustomText
                          fontFamily='GabaritoMedium'
                          fontSize={14}
                          color={COLORS.darkText}
                          style={{
                            marginRight: horizontalScale(6),
                            lineHeight: 22,
                          }}
                        >
                          •
                        </CustomText>
                        <CustomText
                          fontFamily='GabaritoRegular'
                          fontSize={14}
                          color={COLORS.darkText}
                          style={{ flex: 1, lineHeight: 22 }}
                        >
                          {item}
                        </CustomText>
                      </View>
                    ))}
                  </View>

                  <CustomText
                    fontFamily='GabaritoSemiBold'
                    fontSize={14}
                    color={COLORS.darkRed}
                    style={{ marginTop: verticalScale(12), lineHeight: 22 }}
                  >
                    This is non-recoverable. You will not be able to restore your
                    account or data after deletion.
                  </CustomText>

                  <CustomText
                    fontFamily='GabaritoMedium'
                    fontSize={14}
                    color={COLORS.darkText}
                    style={{ marginTop: verticalScale(12) }}
                  >
                    Type DELETE to confirm
                  </CustomText>

                  <TextInput
                    value={deleteConfirmText}
                    onChangeText={setDeleteConfirmText}
                    editable={!isDeletingAccount}
                    autoCapitalize='characters'
                    autoCorrect={false}
                    placeholder='DELETE'
                    placeholderTextColor={COLORS.appText}
                    style={styles.deleteConfirmInput}
                  />
                </ScrollView>

                <View style={styles.deleteModalActions}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isDeletingAccount}
                  onPress={() => {
                    setDeleteConfirmText('');
                    setIsDeleteAccountModalVisible(false);
                  }}
                  style={styles.cancelButton}
                >
                  <CustomText
                    fontFamily='GabaritoMedium'
                    fontSize={15}
                    color={COLORS.darkText}
                  >
                    Cancel
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={
                    isDeletingAccount || deleteConfirmText.trim() !== 'DELETE'
                  }
                  onPress={handleDeleteAccount}
                  style={[
                    styles.confirmDeleteButton,
                    (isDeletingAccount ||
                      deleteConfirmText.trim() !== 'DELETE') &&
                      styles.confirmDeleteButtonDisabled,
                  ]}
                >
                  {isDeletingAccount ? (
                    <ActivityIndicator
                      color={COLORS.white}
                      size='small'
                    />
                  ) : (
                    <CustomText
                      fontFamily='GabaritoMedium'
                      fontSize={15}
                      color={COLORS.white}
                    >
                      Delete permanently
                    </CustomText>
                  )}
                </TouchableOpacity>
              </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        <View style={styles.inviteButtonContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              try {
                const inviteLink = Platform.select({
                  android:
                    'https://play.google.com/store/apps/details?id=com.onepali',
                  ios: 'https://apps.apple.com/in/app/onepali-%241-for-palestine/id6758080916',
                });

                await ShareLib.open({
                  title: 'OnePali - $1 for Palestine',
                  message: 'OnePali - $1 for Palestine',
                  url: inviteLink,
                });
              } catch (e) {
                console.log('Error sharing invite:', e);
              }
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: COLORS.darkText,
              paddingHorizontal: horizontalScale(16),
              paddingVertical: verticalScale(10),
              borderRadius: 100,
            }}
          >
            <CustomIcon
              Icon={ICONS.users}
              height={20}
              width={20}
            />
            <CustomText
              fontFamily='GabaritoRegular'
              fontSize={16}
              color={COLORS.white}
            >
              Invite Friends
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(15),
  },
  logo: {
    width: horizontalScale(54),
    height: verticalScale(54),
    resizeMode: 'contain',
    marginTop: Platform.OS === 'ios' ? verticalScale(0) : verticalScale(10),
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: horizontalScale(10),
    marginTop: verticalScale(24),
    width: wp(90),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 6,
  },

  listContainer: {
    marginTop: verticalScale(16),
    width: wp(90),
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },

  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },

  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
  },

  inviteButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: verticalScale(16),
    alignItems: 'center',
  },
  AccountDivider: {
    width: horizontalScale(32),
    paddingBottom: verticalScale(6),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
    alignSelf: 'center',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  deleteModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: horizontalScale(18),
    paddingVertical: verticalScale(18),
    overflow: 'hidden',
  },
  deleteModalKeyboardWrap: {
    width: '100%',
  },
  deleteModalScroll: {
    flexShrink: 1,
  },
  deleteModalScrollContent: {
    paddingBottom: verticalScale(8),
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: horizontalScale(10),
    marginTop: verticalScale(10),
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(11),
  },
  confirmDeleteButton: {
    flex: 1.3,
    backgroundColor: COLORS.darkRed,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(11),
  },
  confirmDeleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteConfirmInput: {
    marginTop: verticalScale(8),
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 10,
    paddingHorizontal: horizontalScale(12),
    paddingVertical:
      Platform.OS === 'ios' ? verticalScale(10) : verticalScale(8),
    color: COLORS.darkText,
    fontSize: 15,
  },
});
