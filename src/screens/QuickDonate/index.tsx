import React, { FC, useState } from "react";
import { Animated, Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IMAGES from "../../assets/Images";
import COLORS from "../../utils/Colors";
import { horizontalScale, hp, verticalScale, wp } from "../../utils/Metrics";
import { CustomText } from "../../components/CustomText";
import { useAppSelector } from "../../redux/store";
import { selectReservationSeconds } from "../../redux/slices/UserSlice";
import { QuickDonateProps } from "../../typings/routes";
import FONTS from "../../assets/fonts";
import HapticFeedback from 'react-native-haptic-feedback';
import CustomIcon from "../../components/CustomIcon";
import ICONS from "../../assets/Icons";
import { PlatformPay, PlatformPayButton } from "@stripe/stripe-react-native";
import PrimaryButton from "../../components/PrimaryButton";
import CustomAmount from "../../components/Modal/CustomAmount";

const visiblePlans = [
  {
    id: "plan_1",
    type: "amount",
    amount: 1,
  },
  {
    id: "plan_2",
    type: "amount",
    amount: 3,
  },
  {
    id: "plan_3",
    type: "amount",
    amount: 5,
  },
  {
    id: "custom",
    type: "custom",
  },
];


const QuickDonate:FC<QuickDonateProps> = ({navigation}) => {
  const {claimedNumber  } = useAppSelector((state) => state.user);
  const reservationSeconds = useAppSelector(selectReservationSeconds);
  const [toggleWidth, setToggleWidth] = useState(0);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const [selectedPlan, setSelectedPlan] = useState(visiblePlans[0].id);
  const [customAmount, setCustomAmount] = useState('1');
  const [isCustomModalVisible, setIsCustomModalVisible] = useState(false);
  const ITEM_WIDTH = toggleWidth > 0 ? toggleWidth / visiblePlans.length : 0;

  const hapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={{ flex: 1, paddingHorizontal: horizontalScale(16) }}>
          <View style={styles.header}>
            <Image source={IMAGES.OnePaliLogo} style={styles.logo} />
          </View>
          <View style={styles.headingContainer}>
            {/* Heading letters */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <CustomText
                fontFamily="GabaritoSemiBold"
                fontSize={42}
                color={COLORS.darkText}
              >
                Start giving
              </CustomText>
            </View>
            {/* Subheading letters */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {reservationSeconds && reservationSeconds > 0 ? (
                <CustomText
                  fontFamily="GabaritoRegular"
                  fontSize={18}
                  color={COLORS.appText}
                  style={{ textAlign: "center", marginTop: 8 }}
                >
                  {`#${claimedNumber} reserved for ${reservationSeconds}s`}
                </CustomText>
              ) : (
                <CustomText
                  color={COLORS.redColor}
                  fontFamily="GabaritoRegular"
                  fontSize={18}
                >
                  {`#${claimedNumber} Expired`}
                </CustomText>
              )}
            </View>
          </View>
          <View>
            <Image source={IMAGES.PeoplesDonating} style={styles.image} />
          </View>
          <View style={styles.donationText}>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={72}
              color={COLORS.darkText}
            >
              {selectedPlan === 'custom' ? `$${customAmount}` : `$${visiblePlans.find(p => p.id === selectedPlan)?.amount || 1}`}
            </CustomText>
            <CustomText
              fontFamily="GabaritoSemiBold"
              fontSize={42}
              color={COLORS.appText}
            >
              /mo
            </CustomText>
          </View>
          <View
            style={{
              marginTop: verticalScale(12),
              width: wp(100) - horizontalScale(16 * 2),
            }}
          >
            <View style={styles.toggleWrapper}>
              {visiblePlans.map((plan, idx) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.toggleItem,
                      {
                        backgroundColor: isSelected
                          ? COLORS.darkGreen
                          : COLORS.greyish,
                      },
                    ]}
                    activeOpacity={0.9}
                    onPress={() => {
                      HapticFeedback.trigger("impactLight", hapticOptions);
                      if (plan.type === 'custom') {
                        setIsCustomModalVisible(true);
                        setSelectedPlan(plan.id);
                      } else {
                        setSelectedPlan(plan.id);
                      }
                    }}
                  >
                    {plan.type === "custom" ? (
                      <CustomIcon
                        Icon={isSelected ? ICONS.WhitePencil : ICONS.PencilIcon}
                        width={18}
                        height={18}
                      />
                    ) : (
                      <CustomText
                        fontSize={18}
                        style={{
                          color: isSelected ? COLORS.white : COLORS.darkText,
                          fontFamily: FONTS.GabaritoSemiBold,
                        }}
                      >
                        ${plan.amount}
                      </CustomText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
                {/* Custom Amount Modal */}
                <CustomAmount
                  isVisible={isCustomModalVisible}
                  setIsVisible={setIsCustomModalVisible}
                  onConfirm={(amount) => {
                    setCustomAmount(amount);
                    setSelectedPlan('custom');
                  }}
                  initialAmount={customAmount}
                />
          </View>
          <View
            style={{
              backgroundColor: COLORS.liteGreen,
              borderRadius: 50,
              marginTop: verticalScale(16),
              flexDirection: "row",
              alignItems: "center",
              padding: horizontalScale(12),
              gap: horizontalScale(8),
            }}
          >
            <CustomIcon
              Icon={ICONS.WinterClothes}
              height={verticalScale(36)}
              width={verticalScale(36)}
            />
            <CustomText
              fontFamily="GabaritoMedium"
              fontSize={15}
              color={COLORS.darkGreen}
            >
              {`8,339 children received warm winter \nclothes in 2025`}
            </CustomText>
          </View>
        </View>
        <PrimaryButton
          title="Donate with Apple Pay"
          leftIcon={{
            Icon: ICONS.AppleLogo,
            width: 16,
            height: 22,
          }}
          onPress={() => {}}
          hapticFeedback
          hapticType="impactLight"
          textStyle={{
            fontFamily: FONTS.GabaritoSemiBold,
          }}
          style={{ marginBottom: verticalScale(24) }}
        />
      </SafeAreaView>
    </View>
  );
};

export default QuickDonate; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.appBackground,
  },
  safeArea: {
    flex: 1,
    marginTop: verticalScale(15),
  },
  logo: {
    width: horizontalScale(54),
    height: verticalScale(54),
    resizeMode: "contain",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  headingContainer: {
    marginTop: verticalScale(24),
    alignItems: "center",
  },
  image: {
    width: wp(85.2),
    height: hp(19.6),
    resizeMode: "cover",
    alignSelf: "center",
    marginTop: verticalScale(24),
  },
  donationText: {
    marginTop: verticalScale(24),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  toggleWrapper: {
    flexDirection: "row",
    borderRadius: 100,
    gap: horizontalScale(8),
  },
  toggleItem: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: verticalScale(12),
  },

  toggleItemActive: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 30,
  },
  toggleText: {
    fontFamily: FONTS.GabaritoSemiBold,
    color: COLORS.darkText,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  slidingBg: {
    position: "absolute",
    left: 4,
    top: 4,
    bottom: 4,
    backgroundColor: COLORS.darkGreen,
    borderRadius: 999,
  },
});
