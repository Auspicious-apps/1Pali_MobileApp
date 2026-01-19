import { View, Image } from 'react-native';
import React, { FC } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../../utils/Colors';
import IMAGES from '../../assets/Images';
import { CustomText } from '../../components/CustomText';
import { horizontalScale, verticalScale } from '../../utils/Metrics';
import { onePaliWorksProps } from '../../typings/routes';
import { ScrollView } from 'react-native-gesture-handler';
import styles from './styles';
import CustomIcon from '../../components/CustomIcon';
import ICONS from '../../assets/Icons';
import PrimaryButton from '../../components/PrimaryButton';
import FocusResetScrollView from '../../components/FocusResetScrollView';

const fundImages = [IMAGES.KidsImage, IMAGES.kidsImageOne];

const fundCards = [
  {
    id: '1',
    title: 'Claim your number',
    description: 'Starts a $1 monthly subscription to hold your number.',
    image: IMAGES.ClaimCard,
  },
  {
    id: '2',
    title: 'Support & Share',
    description:
      'Small monthly support fuels real impact—and sharing amplifies it.',
    image: IMAGES.SupportImage,
  },
  {
    id: '3',
    title: 'Stay in the Loop',
    description: 'See where funds go and hear from the ground.',
    image: IMAGES.LoopImage,
  },
];

const OnePaliWorks: FC<onePaliWorksProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <FocusResetScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.contentContainer}
        >
          <Image source={IMAGES.OnePaliLogo} style={styles.appIcon} />

          {/* HEADER */}
          <View style={styles.header}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={36}
              color={COLORS.darkText}
              style={styles.headerTitle}
            >
              One cause, one million supporters
            </CustomText>
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={15}
              color={COLORS.appText}
            >
              OnePali is built on people showing up together. Each member
              donates $1 per month. Small amounts add up when shared by many.
            </CustomText>
          </View>

          {/* FUNDS LIST */}
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fundsListContent}
          >
            {fundCards.map(item => (
              <View key={item.id} style={styles.fundCard}>
                {item.image ? (
                  <Image source={item.image} style={styles.fundCardImage} />
                ) : (
                  <View style={styles.fundCardImage} />
                )}
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={18}
                  color={COLORS.darkText}
                  style={styles.fundCardTitle}
                >
                  {item.title}
                </CustomText>
                <CustomText
                  fontFamily="SourceSansRegular"
                  fontSize={15}
                  color={COLORS.appText}
                >
                  {item.description}
                </CustomText>
              </View>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          <View style={styles.sectionContainer}>
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={22}
              style={styles.centerText}
            >
              Where funds are directed?
            </CustomText>

            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={15}
              color={COLORS.appText}
              style={styles.sectionDescription}
            >
              100% of funds raised through OnePali are directed to Gaza through
              the Middle East Children’s Alliance (MECA), who work directly on
              the ground.
            </CustomText>

            <View style={styles.imageRow}>
              {fundImages.map((img, index) => (
                <Image
                  key={index}
                  source={img}
                  resizeMode="contain"
                  style={[styles.image, { width: '48%' }]}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionWrapper}>
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={22}
              style={styles.centerText}
            >
              Who’s working on what?
            </CustomText>
            <View style={styles.whoCard}>
              <View style={styles.rowContainer}>
                <CustomIcon Icon={ICONS.calenderIcon} width={24} height={24} />
                <View style={{ gap: verticalScale(4) }}>
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={18}
                    color={COLORS.darkText}
                  >
                    OnePali
                  </CustomText>
                  <CustomText
                    fontFamily="SourceSansRegular"
                    fontSize={15}
                    color={COLORS.appText}
                  >
                    Organizes the collective and facilitates monthly
                    contributions.
                  </CustomText>
                </View>
              </View>

              <View style={styles.innerDivider} />
              <View style={styles.rowContainer}>
                <CustomIcon Icon={ICONS.truckIcon} width={24} height={24} />
                <View style={{ gap: verticalScale(4) }}>
                  <CustomText
                    fontFamily="GabaritoMedium"
                    fontSize={18}
                    color={COLORS.darkText}
                  >
                    MECA
                  </CustomText>
                  <CustomText
                    fontFamily="SourceSansRegular"
                    fontSize={15}
                    color={COLORS.appText}
                  >
                    Distributes aid on the ground and shares updates directly in
                    OnePali.
                  </CustomText>
                </View>
              </View>
            </View>
            <Image
              source={IMAGES.Image}
              resizeMode="contain"
              style={styles.bottomImage}
            />
            <View style={styles.sectionWrapper}>
              <CustomText
                fontFamily="GabaritoMedium"
                fontSize={22}
                style={styles.centerText}
              >
                How will I stay in the loop?
              </CustomText>

              <CustomText
                fontFamily="SourceSansRegular"
                fontSize={15}
                color={COLORS.appText}
                style={styles.sectionDescription}
              >
                Updates from MECA on how funds are being used are shared
                directly in the app, so you can clearly see where contributions
                are going.
              </CustomText>
            </View>
            <PrimaryButton
              title="Continue"
              onPress={() => {
                navigation.navigate('claimSpot');
              }}
              style={styles.primaryButton}
            />
          </View>
        </FocusResetScrollView>
      </SafeAreaView>
    </View>
  );
};

export default OnePaliWorks;
