import { FlatList, Image, KeyboardAvoidingView, Platform, Share, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { FC, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import IMAGES from '../../assets/Images'
import { horizontalScale, hp, verticalScale, wp } from '../../utils/Metrics'
import CustomIcon from '../../components/CustomIcon'
import ICONS from '../../assets/Icons'
import { CustomText } from '../../components/CustomText'
import COLORS from '../../utils/Colors'
import { UpdateDetailScreenProps } from '../../typings/routes'
import FocusResetScrollView from '../../components/FocusResetScrollView'
import FONTS from '../../assets/fonts'

type Comment = {
  id: string;
  text: string;
  time: string;
};

const commentsData: Comment[] = [
  {
    id: '1951',
    text: "Wow! This piece really captivates the viewer's attention!",
    time: '15m ago',
  },
  {
    id: '1950',
    text: 'Incredible composition! The colors blend beautifully together!',
    time: '30m ago',
  },
  {
    id: '124',
    text: 'Amazing work! The details are breathtaking, truly immersive!',
    time: '1h ago',
  },
  {
    id: '342',
    text: 'Absolutely stunning! The scene feels so real and full of life <3',
    time: '2h ago',
  },
];

const UpdateDetail :FC<UpdateDetailScreenProps> = ({navigation}) => {
  const [isLiked, setIsLiked] = useState(false);

   const handleShare = async () => {
     try {
       const artImage = Image.resolveAssetSource(IMAGES.FeedImage);
       await Share.share({
         title: 'Share Art',
         message: 'OnePali supporter #1948. 1 of 1M supporters strong.',
         url: artImage?.uri,
       });
     } catch (error) {
       // ignore
     }
   };


  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={{ width: '100%', gap: verticalScale(2) }}>
        <CustomText
          fontFamily="GabaritoMedium"
          fontSize={15}
          color={COLORS.darkText}
        >
          #{item.id}
        </CustomText>
        <CustomText
          fontFamily="SourceSansRegular"
          fontSize={14}
          color={COLORS.darkText}
          style={{ width: '100%' }}
        >
          {item.text}
        </CustomText>
        <View style={styles.commentMetaRow}>
          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={12}
            color={COLORS.appText}
          >
            {item.time}
          </CustomText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FocusResetScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              position: "absolute",
              top: verticalScale(70),
              left: horizontalScale(20),
              zIndex: 10,
              borderWidth: 2,
              borderColor: COLORS.white,
              borderRadius: 10,
            }}
          >
            <CustomIcon
              Icon={ICONS.WhiteBackArrow}
              height={24}
              width={24}
              onPress={() => navigation.navigate("updates")}
            />
          </TouchableOpacity>
          <Image
            source={IMAGES.FeedImage}
            style={styles.updateImage}
            resizeMode="cover"
          />
          <View
            style={{
              marginTop: verticalScale(27),
              paddingHorizontal: horizontalScale(20),
              gap: verticalScale(8),
            }}
          >
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={14}
              color={COLORS.appText}
            >
              January 2026
            </CustomText>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={32}
              color={COLORS.darkText}
            >
              Food baskets distributed to families in Khan Younis
            </CustomText>
          </View>
          <View
            style={{
              marginTop: verticalScale(16),
              paddingHorizontal: horizontalScale(20),
              gap: verticalScale(12),
            }}
          >
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={15}
              color={COLORS.darkText}
            >
              With your support, the Middle East Children's Alliance was able to
              distribute food baskets to families in Khan Younis this January.
              These baskets contained essential items that helped families
              prepare nutritious meals.
            </CustomText>
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={15}
              color={COLORS.darkText}
            >
              MECA is committed to continuing our support for families in need.
              With your help, we can provide ongoing assistance and resources to
              those who need it most.
            </CustomText>
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={15}
              color={COLORS.darkText}
            >
              With your support, the Middle East Children's Alliance was able to
              distribute food baskets to families in Khan Younis this January.
              These baskets contained essential items that helped families
              prepare nutritious meals.
            </CustomText>
            <CustomText
              fontFamily="SourceSansRegular"
              fontSize={15}
              color={COLORS.darkText}
            >
              MECA is committed to continuing our support for families in need.
              With your help, we can provide ongoing assistance and resources to
              those who need it most.
            </CustomText>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: horizontalScale(12),
                borderBottomWidth: 1,
                borderBottomColor: COLORS.greyish,
                paddingVertical: verticalScale(16),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: horizontalScale(2),
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsLiked((prev) => !prev)}
                >
                  <CustomIcon
                    Icon={isLiked ? ICONS.LikedIcon : ICONS.likeIcon}
                    height={24}
                    width={24}
                  />
                </TouchableOpacity>
                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={16}
                  color={COLORS.appText}
                >
                  0
                </CustomText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: horizontalScale(2),
                }}
              >
                <TouchableOpacity activeOpacity={0.8}>
                  <CustomIcon Icon={ICONS.chatIcon} height={24} width={24} />
                </TouchableOpacity>

                <CustomText
                  fontFamily="GabaritoMedium"
                  fontSize={16}
                  color={COLORS.appText}
                >
                  4
                </CustomText>
              </View>
              <TouchableOpacity activeOpacity={0.8} onPress={handleShare}>
                <CustomIcon Icon={ICONS.shareIcon} height={24} width={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.commentInputRow}>
              <View style={styles.commentInputWrapper}>
                <TextInput
                  placeholder="Add a comment..."
                  placeholderTextColor={COLORS.appText}
                  style={styles.commentInput}
                />
                <TouchableOpacity activeOpacity={0.8}>
                  <CustomText
                    fontFamily="GabaritoSemiBold"
                    fontSize={16}
                    color="#4c80f2"
                  >
                    Send
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={commentsData}
              keyExtractor={(item) => item.id}
              renderItem={renderCommentItem}
              scrollEnabled={false}
              contentContainerStyle={styles.commentsList}
            />
          </View>
        </FocusResetScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default UpdateDetail


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  safeArea: {
    flex: 1,
    paddingTop: verticalScale(20),
  },
  keyboardView: {
    flex: 1,
  },
  updateImage: {
    width: "100%",
    height: hp(42.9),
  },
  scrollContent: {
    paddingBottom: verticalScale(16),
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyish,
    paddingBottom: verticalScale(16),
    width: "100%",
  },
  commentInputWrapper: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.greyish,
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: verticalScale(8),
  },
  commentInput: {
    fontFamily: FONTS.SourceSansRegular,
    fontSize: 14,
    color: COLORS.darkText,
    paddingVertical: verticalScale(5),
    width: "80%",
  },
  commentsList: {
    paddingBottom: verticalScale(8),
  },
  commentItem: {
    paddingVertical: verticalScale(12),
    flexDirection: "row",
    alignItems: "flex-start",
    gap: horizontalScale(12),
  },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(4),
  },
});