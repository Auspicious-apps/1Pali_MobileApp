import React, { FC } from 'react';
import { Alert, FlatList, Image, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IMAGES from '../../assets/Images';
import { horizontalScale, verticalScale, wp } from '../../utils/Metrics';
import CustomIcon from '../../components/CustomIcon';
import ICONS from '../../assets/Icons';
import { ReceiptsScreenProps } from '../../typings/routes';
import { CustomText } from '../../components/CustomText';
import COLORS from '../../utils/Colors';
import FocusResetScrollView from '../../components/FocusResetScrollView';

const receipts = [
  {
    id: '1',
    month: 'December 2024',
    amount: '$1.43',
    receiptId: '#REC-987656',
    pdfUrl: 'https://example.com/receipts/REC-987656.pdf',
  },
  {
    id: '2',
    month: 'November 2024',
    amount: '$1.43',
    receiptId: '#REC-987657',
    pdfUrl: 'https://example.com/receipts/REC-987657.pdf',
  },
  {
    id: '3',
    month: 'October 2024',
    amount: '$1.43',
    receiptId: '#REC-987658',
    pdfUrl: 'https://example.com/receipts/REC-987658.pdf',
  },
  {
    id: '4',
    month: 'September 2024',
    amount: '$1.43',
    receiptId: '#REC-987659',
    pdfUrl: 'https://example.com/receipts/REC-987659.pdf',
  },
  {
    id: '5',
    month: 'August 2024',
    amount: '$1.43',
    receiptId: '#REC-987660',
    pdfUrl: 'https://example.com/receipts/REC-987660.pdf',
  },
  {
    id: '6',
    month: 'July 2024',
    amount: '$1.43',
    receiptId: '#REC-987661',
    pdfUrl: 'https://example.com/receipts/REC-987661.pdf',
  },
  {
    id: '7',
    month: 'June 2024',
    amount: '$1.43',
    receiptId: '#REC-987662',
    pdfUrl: 'https://example.com/receipts/REC-987662.pdf',
  },
  {
    id: '8',
    month: 'May 2024',
    amount: '$1.43',
    receiptId: '#REC-987663',
    pdfUrl: 'https://example.com/receipts/REC-987663.pdf',
  },
  {
    id: '9',
    month: 'April 2024',
    amount: '$1.43',
    receiptId: '#REC-987664',
    pdfUrl: 'https://example.com/receipts/REC-987664.pdf',
  },
  {
    id: '10',
    month: 'March 2024',
    amount: '$1.43',
    receiptId: '#REC-987665',
    pdfUrl: 'https://example.com/receipts/REC-987665.pdf',
  },
  {
    id: '11',
    month: 'February 2024',
    amount: '$1.43',
    receiptId: '#REC-987666',
    pdfUrl: 'https://example.com/receipts/REC-987666.pdf',
  },
  {
    id: '12',
    month: 'January 2024',
    amount: '$1.43',
    receiptId: '#REC-987667',
    pdfUrl: 'https://example.com/receipts/REC-987667.pdf',
  },
];

const ReceiptsScreen : FC<ReceiptsScreenProps> = ({navigation}) => {
  const handleDownloadReceipt = async (pdfUrl?: string) => {
    if (!pdfUrl) {
      Alert.alert('Download unavailable', 'No receipt file is available for this item.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(pdfUrl);

      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Download error', 'Cannot open this receipt link.');
      }
    } catch (error) {
      Alert.alert('Download error', 'Something went wrong while opening the receipt.');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FocusResetScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.side}>
              <TouchableOpacity
                onPress={() => navigation.navigate('account')}
                activeOpacity={0.8}
              >
                <CustomIcon Icon={ICONS.backArrow} height={24} width={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.center}>
              <Image source={IMAGES.OnePaliLogo} style={styles.logo} />
            </View>

            <View style={styles.side} />
          </View>
          <View style={styles.titleContainer}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={32}
              color={COLORS.darkText}
            >
              Receipts
            </CustomText>
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={14}
              color={COLORS.appText}
              style={styles.subtitle}
            >
              Track your donations and export receipts
            </CustomText>
          </View>
          <View style={styles.filterRow}>
            <View style={styles.yearFilter}>
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={16}
                color={COLORS.appText}
              >
                2025
              </CustomText>
              <CustomIcon Icon={ICONS.DropdownIcon} height={24} width={24} />
            </View>
            <View style={styles.downloadButton}>
              <CustomIcon Icon={ICONS.downloadFile} height={24} width={24} />
              <CustomText
                fontFamily="GabaritoRegular"
                fontSize={16}
                color={COLORS.darkText}
              >
                Download
              </CustomText>
            </View>
          </View>

          <View style={styles.card}>
            <FlatList
              data={receipts}
              bounces={false}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.receiptRow}>
                  <View style={styles.receiptRowLeft}>
                    <CustomIcon
                      Icon={ICONS.dollerIcon}
                      height={67}
                      width={67}
                    />
                    <View style={styles.receiptTextContainer}>
                      <View>
                        <CustomText
                          fontFamily="GabaritoRegular"
                          fontSize={18}
                          color={COLORS.darkText}
                        >
                          {item.month}
                        </CustomText>
                        <CustomText
                          fontFamily="GabaritoRegular"
                          fontSize={16}
                          color={COLORS.appText}
                        >
                          {item.amount}
                        </CustomText>
                      </View>
                      <CustomText
                        fontFamily="SourceSansRegular"
                        fontSize={14}
                        color={COLORS.appText}
                      >
                        Receipt ID: {item.receiptId}
                      </CustomText>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleDownloadReceipt(item.pdfUrl)}
                  >
                    <CustomIcon
                      Icon={ICONS.DownloadIcon}
                      height={40}
                      width={40}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </FocusResetScrollView>
      </SafeAreaView>
    </View>
  );
}

export default ReceiptsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  header: {
    width: '100%',
    flexDirection: 'row',
  },
  logo: {
    width: horizontalScale(100),
    height: verticalScale(59),
  },
  side: {
    width: horizontalScale(40),
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 20,
    padding: 16,
    marginTop: verticalScale(16),
    marginHorizontal: horizontalScale(2),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 6,
  },
  titleContainer: {
    marginTop: verticalScale(32),
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },
  yearFilter: {
    backgroundColor: COLORS.greyish,
    padding: horizontalScale(12),
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(24),
    gap: horizontalScale(6),
  },
  downloadButton: {
    borderWidth: 1,
    borderColor: COLORS.greyish,
    padding: horizontalScale(12),
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(24),
    gap: horizontalScale(6),
  },
  listContent: {
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(32),
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.greyish,
    paddingBottom: verticalScale(12),
    marginBottom: verticalScale(12),
  },
  receiptRowLeft: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },
  receiptTextContainer: {
    gap: verticalScale(8),
  },
});