import appleAuth from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import React, { FC, useState } from 'react';
import { Alert, Image, Platform, TouchableOpacity, View } from 'react-native';
import { isTablet } from 'react-native-device-info';
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
import {
  setBadges,
  setClaimedNumber,
  setUserData,
} from '../../redux/slices/UserSlice';
import { useAppDispatch } from '../../redux/store';
import ENDPOINTS from '../../service/ApiEndpoints';
import { AppleSigninResponse } from '../../service/ApiResponses/AppleSignin';
import { GoogleSigninResponse } from '../../service/ApiResponses/GoogleSignin';
import { postData } from '../../service/ApiService';
import { SignInProps } from '../../typings/routes';
import COLORS from '../../utils/Colors';
import STORAGE_KEYS from '../../utils/Constants';
import { storeLocalStorageData } from '../../utils/Helpers';
import { hp, verticalScale, wp } from '../../utils/Metrics';
import styles from './styles';

const SignIn: FC<SignInProps> = ({ navigation, route }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const dispatch = useAppDispatch();

  const handleAppleSignIn = async () => {
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
          createUser: false,
        },
      );

      if (signInResponse?.data.success) {
        const { tokens, user, isNewUser } = signInResponse?.data?.data;

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
        if (user.hasSubscription && user.assignedNumber) {
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

        if (!user.assignedNumber) {
          Toast.show({
            type: 'error',
            text1: 'Oops! No Number assigned',
            text2:
              'User does not have an assigned number. Please select a number to continue.',
          });
          navigation.replace('animatedNumber');
          return;
        } else {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('splash');
          }
          Toast.show({
            type: 'error',
            text1: 'Oops! No user found.',
            text2: 'User does not exist. Sign up required.',
          });
        }
      }
    } catch (error: any) {
      console.log('error', error);

      if (error?.code === appleAuth.Error.CANCELED) {
        console.log('User cancelled Apple Sign-In');
        return;
      } else if (
        error.message &&
        error.message === 'User does not exist. Sign up required.'
      ) {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.replace('splash');
        }
        Toast.show({
          type: 'error',
          text1: 'Oops! No user found.',
          text2: 'User does not exist. Sign up required.',
          visibilityTime: 10000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    try {
      // Check for Play Services only on Android
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      const { data } = await GoogleSignin.signIn();

      if (data?.idToken) {
        const signinResponse = await postData<GoogleSigninResponse>(
          ENDPOINTS.GoogleSignin,
          { idToken: data?.idToken, createUser: false },
        );
        if (signinResponse.data.success) {
          const { tokens, user, isNewUser } = signinResponse?.data?.data;

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
            navigation.navigate('animatedNumber');
            Toast.show({
              type: 'error',
              text1: 'Oops! No Number assigned',
              text2:
                'User does not have an assigned number. Please select a number to continue.',
            });
            return;
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
          const errorMessage = signinResponse.data.message || 'Sign-in failed';
          console.error('API Error:', errorMessage);
          Toast.show({
            type: 'error',
            text1: 'Google Sign-In Failed',
            text2: errorMessage,
          });
        }
      } else {
        console.log('error', 'signin data not found');
        Toast.show({
          type: 'error',
          text1: 'Google Sign-In Failed',
          text2: 'No sign-in data received from Google',
        });
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);

      let errorMessage = 'Something went wrong during sign-in';

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign-in is already in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services not available';
      } else if (
        error.message &&
        error.message === 'User does not exist. Sign up required.'
      ) {
        errorMessage = 'User does not exist. Sign up required.';
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('splash');
        }
        GoogleSignin.signOut(); // Clear any partial sign-in state
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
      } else {
        const message = error.message || 'An unexpected error occurred';
        errorMessage = message;
      }

      Toast.show({
        type: 'error',
        text1: 'Google Sign-In Failed',
        text2: errorMessage,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

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
                ? verticalScale(isTablet() ? 10 : 0)
                : verticalScale(15),
              android: insets.bottom ? 0 : verticalScale(15),
            }),
          },
        ]}
        edges={['bottom', 'top']}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            {navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
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
              style={{
                textAlign: 'center',
              }}
            >
              Welcome Back
            </CustomText>
            <CustomText
              fontFamily='GabaritoRegular'
              fontSize={18}
              color={COLORS.appText}
              style={{ textAlign: 'center' }}
            >
              Sign in to continue
            </CustomText>
          </View>

          <Image
            source={IMAGES.MissionImage}
            resizeMode='contain'
            style={{
              width: wp(75),
              height: hp(48),
              alignSelf: 'center',
              marginTop: verticalScale(24),
            }}
          />
        </View>
        <View
          style={{
            alignItems: 'center',
            gap: verticalScale(8),
            marginBottom:
              Platform.OS === 'android' ? verticalScale(20) : verticalScale(0),
          }}
        >
          <PrimaryButton
            title={`Continue with Google`}
            leftIcon={{
              Icon: ICONS.GoogleIcon,
              width: verticalScale(16),
              height: verticalScale(16),
            }}
            onPress={handleGoogleSignIn}
            isLoading={isSigningIn}
            disabled={isSigningIn}
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
                title={`Continue with Apple`}
                leftIcon={{
                  Icon: ICONS.AppleLogo,
                  width: verticalScale(16),
                  height: verticalScale(16),
                }}
                onPress={handleAppleSignIn}
                isLoading={isLoading}
                disabled={isLoading}
                textStyle={{
                  fontFamily: FONTS.GabaritoSemiBold,
                }}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SignIn;
