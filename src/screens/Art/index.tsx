import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, { FC } from 'react';
import { ArtScreenProps } from '../../typings/routes';
import { SafeAreaView } from 'react-native-safe-area-context';
import IMAGES from '../../assets/Images';
import { horizontalScale, hp, verticalScale } from '../../utils/Metrics';
import { CustomText } from '../../components/CustomText';
import COLORS from '../../utils/Colors';
import CustomIcon from '../../components/CustomIcon';
import ICONS from '../../assets/Icons';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_PADDING = horizontalScale(20);
const CARD_GAP = horizontalScale(12);
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_PADDING * 2 - CARD_GAP) / 2;

const artData = [
  { id: '1', image: IMAGES.FeedImage, month: 'January 2026' },
  { id: '2', image: IMAGES.FeedImage, month: 'February 2026' },
  { id: '3', image: IMAGES.FeedImage, month: 'March 2026' },
  { id: '4', image: IMAGES.FeedImage, month: 'April 2026' },
  { id: '5', image: IMAGES.FeedImage, month: 'April 2026' },
  { id: '6', image: IMAGES.FeedImage, month: 'April 2026' },
];

const Art: FC<ArtScreenProps> = ({navigation}) => {

 

  const renderItem = ({ item }: { item: (typeof artData)[number] }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={()=>{navigation.navigate('artDetail')}}>
      <ImageBackground
        source={item.image}
        resizeMode="cover"
        style={styles.image}
      >
      </ImageBackground>

      <CustomText
        style={styles.monthText}
        fontFamily="SourceSansRegular"
        fontSize={14}
        color={COLORS.appText}
      >
        {item.month}
      </CustomText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.headerWrapper}>
          <Image source={IMAGES.OnePaliLogo} style={styles.logo} />

          <View style={styles.header}>
            <CustomText
              color={COLORS.darkText}
              fontFamily="GabaritoSemiBold"
              fontSize={36}
            >
              Art
            </CustomText>

            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={15}
              color={COLORS.appText}
              style={{ textAlign: 'center'  }}
            >
              New art uploaded on a daily basis. Share art to your socials to
              unlock new badges.
            </CustomText>
          </View>
        </View>

        {/* List */}
        <FlatList
          data={artData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingBottom: verticalScale(10) }}
        />
      </SafeAreaView>
    </View>
  );
};

export default Art;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  safeArea: {
    flex: 1,
  },

  headerWrapper: {
    paddingHorizontal: SIDE_PADDING,
  },

  logo: {
    width: horizontalScale(100),
    height: verticalScale(59),
    resizeMode: 'contain',
    alignSelf: 'center',
  },

  header: {
    marginVertical: verticalScale(32),
    alignItems: 'center',
  },

  card: {
    width: CARD_WIDTH,
    marginBottom: verticalScale(24),
  },

  monthText: {
    marginTop: verticalScale(8),
  },

  image: {
    width: CARD_WIDTH,
    height: hp(26),
    borderRadius: 14,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  uploadBtn: {
    padding: horizontalScale(16),
  },

  columnWrapper: {
    paddingHorizontal: SIDE_PADDING,
    justifyContent: 'space-between',
  },
});
