import { Image, StyleSheet, View, FlatList, Touchable, TouchableOpacity } from 'react-native';
import React, { FC } from 'react';
import { UpdatesScreenProps } from '../../typings/routes';
import { SafeAreaView } from 'react-native-safe-area-context';
import IMAGES from '../../assets/Images';
import { horizontalScale, hp, verticalScale } from '../../utils/Metrics';
import { CustomText } from '../../components/CustomText';
import CustomIcon from '../../components/CustomIcon';
import ICONS from '../../assets/Icons';
import COLORS from '../../utils/Colors';

const updatesData = [
  {
    id: '1',
    title: 'Food baskets distributed to families in Khan Younis',
    date: 'January 2026',
    image: IMAGES.FeedImage,
  },
  {
    id: '2',
    title: 'Food baskets distributed to families in Khan Younis',
    date: 'December 2025',
    image: IMAGES.FeedImage,
  },
  {
    id: '3',
    title: 'Food baskets distributed to families in Khan Younis',
    date: 'November 2025',
    image: IMAGES.FeedImage,
  },
  {
    id: '4',
    title: 'Food baskets distributed to families in Khan Younis',
    date: 'October 2025',
    image: IMAGES.FeedImage,
  },
];

const Updates: FC<UpdatesScreenProps> = ({navigation}) => {

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate('updateDetail');
      }}
    >
      <Image
        source={item.image}
        resizeMode="cover"
        style={{
          width: '100%',
          height: hp(36.5),
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />

      <View
        style={{
          padding: horizontalScale(12),
          paddingBottom: verticalScale(16),
        }}
      >
        <View
          style={{
            paddingVertical: verticalScale(4),
            paddingHorizontal: horizontalScale(8),
            backgroundColor: COLORS.greyBackground,
            alignSelf: 'flex-start',
            borderRadius: 16,
            marginTop: verticalScale(8),
          }}
        >
          <CustomText
            fontFamily="SourceSansMedium"
            fontSize={15}
            color={COLORS.appText}
          >
            {item.date}
          </CustomText>
        </View>
        <View style={styles.cardFooter}>
          <CustomText
            fontFamily="GabaritoRegular"
            fontSize={18}
            color={COLORS.darkText}
            style={{ width: '100%' }}
          >
            {item.title}
          </CustomText>
          {/* <TouchableOpacity activeOpacity={0.8}>
            <CustomIcon Icon={ICONS.UpwardIcon} height={40} width={40} />
          </TouchableOpacity> */}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Image source={IMAGES.OnePaliLogo} style={styles.logo} />

        <View style={styles.header}>
          <CustomText
            fontFamily="GabaritoSemiBold"
            fontSize={36}
            color="rgba(29, 34, 43, 1)"
          >
            Updates
          </CustomText>

          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={15}
            color={COLORS.appText}
          >
            Updates from MECA on the ground, shared monthly.
          </CustomText>
        </View>

        <FlatList
          data={updatesData}
          bounces={false}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </View>
  );
};

export default Updates;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  logo: {
    width: horizontalScale(100),
    height: verticalScale(59),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  header: {
    marginTop: verticalScale(32),
    marginBottom: verticalScale(24),
  },
  listContent: {
    paddingBottom: verticalScale(20),
    gap: verticalScale(12),
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.LightGrey,
    borderRadius: 12,
  },
  imagePlaceholder: {
    backgroundColor: COLORS.greyish,
    height: hp(36.5),
    width: '100%',
    borderRadius: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
});

