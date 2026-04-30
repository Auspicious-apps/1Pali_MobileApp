import appleAuth from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import React, { FC, useEffect, useState } from 'react';
import { Alert, Image, Platform, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import FONTS from '../../assets/fonts';
import ICONS from '../../assets/Icons';
import IMAGES from '../../assets/Images';
import CustomIcon from '../../components/CustomIcon';
import { CustomText } from '../../components/CustomText';
import PrimaryButton from '../../components/PrimaryButton';
import WebViewBottomSheet from '../../components/WebViewBottomSheet';
import { logEvent } from '../../Context/analyticsService';
import { trackOnboardingStepCompleted } from '../../Context/klaviyoClientService';
import {
  selectReservationSeconds,
  selectReservationStatus,
  setBadges,
  setClaimedNumber,
  setUserData,
  startReservationTimer,
} from '../../redux/slices/UserSlice';
import { store, useAppDispatch, useAppSelector } from '../../redux/store';
import ENDPOINTS from '../../service/ApiEndpoints';
import { AppleSigninResponse } from '../../service/ApiResponses/AppleSignin';
import { GoogleSigninResponse } from '../../service/ApiResponses/GoogleSignin';
import { postData } from '../../service/ApiService';
import { MissionIntroProps } from '../../typings/routes';
import COLORS from '../../utils/Colors';
import STORAGE_KEYS from '../../utils/Constants';
import {
  deleteLocalStorageData,
  getRandomEvenOrOdd,
  storeLocalStorageData,
} from '../../utils/Helpers';
import {
  horizontalScale,
  hp,
  isTablet,
  verticalScale,
  wp,
} from '../../utils/Metrics';
import styles from './styles';

const initialTimer = 30;

const MissionIntro: FC<MissionIntroProps> = ({ navigation, route }) => {
  const { showNumber } = route.params || {};
  const insets = useSafeAreaInsets();
  const reservationStatus = useAppSelector(selectReservationStatus);
  const reservationSeconds = useAppSelector(selectReservationSeconds);
  const { claimedNumber } = useAppSelector((state) => state.user);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);
  const [legalWebUrl, setLegalWebUrl] = useState('https://onepali.app');
  const [legalWebTitle, setLegalWebTitle] = useState('Legal');
  const isReservationExpired = reservationStatus === 'EXPIRED';
  const [showCheckboxError, setShowCheckboxError] = useState(false);

  const dispatch = useAppDispatch();

  // Start timer only on mount if not already started
  useEffect(() => {
    if (reservationSeconds === null) {
      // Fallback: calculate expiresAt timestamp (initialTimer seconds from now)
      const expiresAt = new Date(
        Date.now() + initialTimer * 1000,
      ).toISOString();
      dispatch(
        startReservationTimer({
          seconds: initialTimer,
          expiresAt: expiresAt,
        }),
      );
    }

    // Track paywall/sign-in step
    trackOnboardingStepCompleted(4, 'Paywall', 4);
  }, []);

  const handleAppleSignIn = async () => {
    if (!isChecked) {
      setShowCheckboxError(true);
      return;
    }
    try {
      setIsLoading(true);
      if (Platform.OS !== 'ios') {
        return;
      }

      if (!appleAuth.isSupported) {
        Alert.alert('Not Supported', 'Apple Sign-In not supported');
        return;
      }

      const rawNonce = 'Wfghrwrthhfjhreghfjyerwghliueghterui';

      const appleResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        nonce: rawNonce,
      });
      const { identityToken, authorizationCode, nonce } = appleResponse;

      if (!identityToken || !authorizationCode) {
        Toast.show({
          type: 'error',
          text1: 'Apple Sign-In Failed',
          text2: 'No sign-in data received from Apple',
        });
        return;
      }

      const signInResponse = await postData<AppleSigninResponse>(
        ENDPOINTS.AppleSignin,
        {
          identityToken,
          nonce: nonce,
        },
      );

      if (signInResponse?.data.success) {
        const { tokens, user, isNewUser } = signInResponse?.data?.data;

        // Get current state from Redux to avoid stale closure values
        const currentState = store.getState();
        const currentReservationSeconds = currentState.user.reservationSeconds;
        const currentReservationStatus = currentState.user.reservationStatus;
        const isCurrentReservationExpired =
          currentReservationStatus === 'EXPIRED';

        // Check if reservation has expired during sign-in process
        if (
          isCurrentReservationExpired ||
          (currentReservationSeconds && currentReservationSeconds <= 0)
        ) {
          Toast.show({
            type: 'error',
            text1: 'Reservation Expired',
            text2:
              'Your reservation has expired. Please go back and reserve a number again.',
          });
          setIsLoading(false);
          return;
        }

        // Store all tokens in local storage
        await storeLocalStorageData(
          STORAGE_KEYS?.accessToken,
          tokens?.accessToken,
        );
        await storeLocalStorageData(
          STORAGE_KEYS?.refreshToken,
          tokens.refreshToken,
        );
        await storeLocalStorageData(STORAGE_KEYS?.expiresIn, tokens?.expiresIn);
        await storeLocalStorageData('userData', user);

        // Navigate based on user state
        if (user.hasSubscription && user.hasSubscription) {
          dispatch(setUserData(signInResponse.data?.data?.user?.user as any));
          dispatch(
            setBadges(signInResponse.data?.data?.user?.user?.badges as any),
          );
          dispatch(
            setClaimedNumber(signInResponse.data?.data?.user?.assignedNumber),
          );

          navigation.replace('MainStack', {
            screen: 'tabs',
            params: {
              screen: 'home',
            },
          });
          return;
        }
        dispatch(setUserData(signInResponse.data?.data?.user?.user as any));

        navigation.navigate('OnBoardingStack', {
          screen: 'quickDonate',
          params: {
            joinedPosition: user.joinedPosition || getRandomEvenOrOdd(),
          },
        });
      }
    } catch (error: any) {
      console.log('error', error);

      if (error?.code === appleAuth.Error.CANCELED) {
        console.log('User cancelled Apple Sign-In');
        return;
      } else if (
        error.status === 410 &&
        error.message ===
          'Your account has been deleted. Please contact support at meca@mecaforpeace.org to restore it.'
      ) {
        Alert.alert('Note', error.message, [
          {
            text: 'Ok',
            style: 'default',
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: any) => {
    if (!error) return;

    // Silent cases (no UI)
    if (error.message === 'Sign-in cancelled by user') {
      return;
    }

    // Known Google errors
    if (error.code === statusCodes.IN_PROGRESS) {
      Toast.show({
        type: 'info',
        text1: 'Please wait',
        text2: 'Sign-in is already in progress',
      });
      return;
    }

    if (
      error.status === 410 &&
      error.message ===
        'Your account has been deleted. Please contact support at meca@mecaforpeace.org to restore it.'
    ) {
      Alert.alert('Note', error.message, [
        {
          text: 'Ok',
          style: 'default',
        },
      ]);
      return;
    }

    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Toast.show({
        type: 'error',
        text1: 'Google Services Required',
        text2: 'Please update Google Play Services to continue',
      });
      return;
    }

    // API / custom errors
    if (error.message) {
      Toast.show({
        type: 'error',
        text1: 'Sign-In Failed',
        text2: error.message,
      });
      return;
    }

    // Fallback
    Toast.show({
      type: 'error',
      text1: 'Something went wrong',
      text2: 'Please try again later',
    });
  };

  const handleGoogleSignIn = async () => {
    if (!isChecked) {
      setShowCheckboxError(true);
      return;
    }
    if (isSigningIn) return;

    setIsSigningIn(true);
    try {
      // Check for Play Services only on Android
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      const { data, type } = await GoogleSignin.signIn();

      if (data?.idToken) {
        const signinResponse = await postData<GoogleSigninResponse>(
          ENDPOINTS.GoogleSignin,
          { idToken: data?.idToken },
        );
        if (signinResponse.data.success) {
          const { tokens, user, isNewUser } = signinResponse?.data?.data;

          // Get current state from Redux to avoid stale closure values
          const currentState = store.getState();
          const currentReservationSeconds =
            currentState.user.reservationSeconds;
          const currentReservationStatus = currentState.user.reservationStatus;
          const isCurrentReservationExpired =
            currentReservationStatus === 'EXPIRED';

          // Check if reservation has expired during sign-in process
          if (
            isCurrentReservationExpired ||
            (currentReservationSeconds && currentReservationSeconds <= 0)
          ) {
            Toast.show({
              type: 'error',
              text1: 'Reservation Expired',
              text2:
                'Your reservation has expired. Please go back and reserve a number again.',
            });
            setIsSigningIn(false);
            return;
          }

          // Store all tokens in local storage
          await storeLocalStorageData(
            STORAGE_KEYS?.accessToken,
            tokens?.accessToken,
          );
          await storeLocalStorageData(
            STORAGE_KEYS?.refreshToken,
            tokens.refreshToken,
          );
          await storeLocalStorageData(
            STORAGE_KEYS?.expiresIn,
            tokens?.expiresIn,
          );
          await storeLocalStorageData('userData', user);

          // Navigate based on user state
          if (isNewUser || !user.assignedNumber) {
            navigation.navigate('quickDonate', {
              joinedPosition: user.joinedPosition || getRandomEvenOrOdd(),
            });
            dispatch(setUserData(signinResponse.data.data.user.user as any));
          } else {
            dispatch(setUserData(signinResponse.data.data.user.user as any));
            dispatch(
              setBadges(signinResponse.data.data.user.user.badges as any),
            );
            dispatch(
              setClaimedNumber(signinResponse.data.data.user.assignedNumber),
            );

            navigation.replace('MainStack', {
              screen: 'tabs',
              params: {
                screen: 'home',
              },
            });
          }
        } else {
          throw {
            type: 'API_ERROR',
            message: signinResponse.data.message || 'Sign-in failed',
          };
        }
      } else {
        console.log(data, type, 'ZZZZ');
        if (type === 'cancelled') {
          throw {
            type: statusCodes.SIGN_IN_CANCELLED,
            message: 'Sign-in cancelled by user',
          };
        } else {
          throw {
            type: 'TOKEN_ERROR',
            message: 'Unable to retrieve Google credentials. Please try again.',
          };
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      handleGoogleError(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const openLegalSheet = (title: string, url: string) => {
    setLegalWebTitle(title);
    setLegalWebUrl(url);
    setIsWebViewVisible(true);
  };

  useEffect(() => {
    logEvent('Ob_Sign_In');
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            marginTop: Platform.select({
              ios: verticalScale(15),
              android: insets.top ? insets.top : verticalScale(30),
            }),
            marginBottom: Platform.select({
              ios: insets.bottom
                ? verticalScale(isTablet ? 10 : 0)
                : verticalScale(15),
              android: insets.bottom ? verticalScale(10) : verticalScale(15),
            }),
          },
        ]}
        edges={['bottom', 'top']}
      >
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#E5E7EF',
                borderRadius: 100,
                position: 'absolute',
                top: 0,
                left: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CustomIcon
                Icon={ICONS.BackArrowBg}
                height={verticalScale(32)}
                width={verticalScale(32)}
              />
            </TouchableOpacity>
          )}
          <Image
            source={IMAGES.OnePaliLogo}
            style={styles.logo}
          />
        </View>

        <View style={styles.headingContainer}>
          <CustomText
            fontFamily='GabaritoSemiBold'
            fontSize={42}
            color={COLORS.darkText}
            style={{ textAlign: 'center' }}
          >
            Join OnePali
          </CustomText>

          {showNumber &&
            (reservationSeconds && reservationSeconds > 0 ? (
              <CustomText
                fontFamily='GabaritoRegular'
                fontSize={18}
                color={COLORS.appText}
                style={{ textAlign: 'center', marginTop: 8 }}
              >
                {`#${claimedNumber} reserved for ${reservationSeconds}s`}
              </CustomText>
            ) : (
              <CustomText
                color={COLORS.redColor}
                fontFamily='GabaritoRegular'
                fontSize={16}
              >
                {`#${claimedNumber} Expired`}
              </CustomText>
            ))}
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            paddingHorizontal: horizontalScale(20),
            paddingTop: verticalScale(20),
          }}
        >
          <Image
            source={IMAGES.MissionImage}
            resizeMode='contain'
            style={{
              width: wp(72),
              height: hp(42),
              alignSelf: 'center',
            }}
          />
          {reservationSeconds && reservationSeconds > 0 ? (
            <View style={{ alignItems: 'center', gap: verticalScale(12) }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  gap: horizontalScale(isTablet ? 5 : 12),
                  alignSelf: 'flex-start',
                  width: '100%',
                }}
                activeOpacity={0.8}
                onPress={() => {
                  setIsChecked((prev) => !prev);
                  setShowCheckboxError(false);
                }}
              >
                {isChecked ? (
                  <CustomIcon
                    Icon={ICONS.CheckedIcon}
                    height={verticalScale(24)}
                    width={horizontalScale(24)}
                  />
                ) : (
                  <CustomIcon
                    Icon={ICONS.CheckboxInput}
                    height={verticalScale(24)}
                    width={horizontalScale(24)}
                  />
                )}
                <CustomText
                  fontFamily='SourceSansRegular'
                  fontSize={13}
                  color={COLORS.appText}
                  style={{
                    flexShrink: 1,
                  }}
                >
                  I agree to MECA’s{' '}
                  <CustomText
                    fontFamily='SourceSansRegular'
                    fontSize={13}
                    color={COLORS.appText}
                    onPress={() => {
                      openLegalSheet(
                        'MECA Privacy Policy',
                        'https://onepali.app/terms-of-use',
                      );
                    }}
                    style={{ textDecorationLine: 'underline' }}
                  >
                    Terms of Use
                  </CustomText>
                  <CustomText
                    fontFamily='SourceSansRegular'
                    fontSize={13}
                    color={COLORS.appText}
                  >
                    ,{' '}
                  </CustomText>
                  <CustomText
                    fontFamily='SourceSansRegular'
                    fontSize={13}
                    color={COLORS.appText}
                    onPress={() => {
                      openLegalSheet(
                        'OnePali Terms of Use',
                        // "https://onepali.app/privacy-policy",
                        'https://onepali.app/meca-privacy-policy',
                      );
                    }}
                    style={{ textDecorationLine: 'underline' }}
                  >
                    Privacy Policy
                  </CustomText>
                  <CustomText
                    fontFamily='SourceSansRegular'
                    fontSize={13}
                    color={COLORS.appText}
                  >
                    , and OnePali's{' '}
                  </CustomText>
                  <CustomText
                    fontFamily='SourceSansRegular'
                    fontSize={13}
                    color={COLORS.appText}
                    onPress={() => {
                      openLegalSheet(
                        'OnePali Privacy Policy',
                        'https://onepali.app/onepali-privacy-policy',
                      );
                    }}
                    style={{ textDecorationLine: 'underline' }}
                  >
                    Privacy Policy.
                  </CustomText>
                </CustomText>
              </TouchableOpacity>
              {showCheckboxError && (
                <CustomText
                  fontFamily='SourceSansRegular'
                  fontSize={10}
                  color={COLORS.redColor}
                >
                  Please accept Terms & Privacy Policy to continue
                </CustomText>
              )}
              <View
                style={{
                  alignItems: 'center',
                  marginTop: verticalScale(12),
                  gap: verticalScale(8),
                }}
              >
                <PrimaryButton
                  title='Continue with Google'
                  leftIcon={{ Icon: ICONS.GoogleIcon, width: 16, height: 16 }}
                  onPress={handleGoogleSignIn}
                  isLoading={isSigningIn}
                  disabled={isSigningIn || isReservationExpired}
                  hapticFeedback
                  hapticType='impactLight'
                  style={Platform.select({
                    ios: {
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: '#C8CBD7',
                    },
                    android: {
                      backgroundColor: '#1D222B',
                    },
                  })}
                  textColor={Platform.select({
                    ios: COLORS.darkText,
                    default: COLORS.white,
                  })}
                  textStyle={Platform.select({
                    ios: {
                      fontFamily: FONTS.GabaritoSemiBold,
                    },
                  })}
                  loaderColor={Platform.select({
                    ios: COLORS.darkText,
                    default: COLORS.white,
                  })}
                />
                {Platform.OS === 'ios' && (
                  <>
                    <PrimaryButton
                      title='Continue with Apple'
                      leftIcon={{
                        Icon: ICONS.AppleLogo,
                        width: 16,
                        height: 22,
                      }}
                      onPress={handleAppleSignIn}
                      isLoading={isLoading}
                      disabled={isLoading || isReservationExpired}
                      hapticFeedback
                      hapticType='impactLight'
                      textStyle={{
                        fontFamily: FONTS.GabaritoSemiBold,
                      }}
                    />
                  </>
                )}
              </View>
            </View>
          ) : (
            <View
              style={{
                alignItems: 'center',
              }}
            >
              <PrimaryButton
                title='Claim New Number'
                onPress={() => {
                  if (Platform.OS === 'android') {
                    GoogleSignin.signOut().then(() => {
                      navigation.goBack();
                      deleteLocalStorageData(STORAGE_KEYS.accessToken);
                      deleteLocalStorageData(STORAGE_KEYS.refreshToken);
                      deleteLocalStorageData(STORAGE_KEYS.expiresIn);
                    });
                  } else {
                    navigation.goBack();
                  }
                }}
                disabled={isSigningIn}
                hapticFeedback
                hapticType='impactLight'
              />
            </View>
          )}
        </View>
      </SafeAreaView>
      <WebViewBottomSheet
        isVisible={isWebViewVisible}
        title={legalWebTitle}
        url={legalWebUrl}
        onClose={() => setIsWebViewVisible(false)}
      />
    </View>
  );
};

export default MissionIntro;
