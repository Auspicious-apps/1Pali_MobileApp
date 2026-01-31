import React, { FC } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FaqScreenProps, TermsConditionsScreenProps } from "../../typings/routes";
import { horizontalScale, verticalScale } from "../../utils/Metrics";
import CustomIcon from "../../components/CustomIcon";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import { CustomText } from "../../components/CustomText";
import COLORS from "../../utils/Colors";

const Title = ({ children }: any) => (
  <CustomText
    fontFamily="GabaritoMedium"
    fontSize={22}
    color={COLORS.darkText}
    style={{ marginTop: verticalScale(24), marginBottom: verticalScale(8) }}
  >
    {children}
  </CustomText>
);

const Text = ({ children }: any) => (
  <CustomText
    fontFamily="SourceSansRegular"
    fontSize={15}
    color={COLORS.appText}
    style={{ marginTop: verticalScale(8), lineHeight: 22 }}
  >
    {children}
  </CustomText>
);

const FAQ: FC<FaqScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      {/* IMPORTANT: remove bottom edge */}
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <CustomIcon Icon={ICONS.backArrow} height={24} width={24} />
          </TouchableOpacity>

          <Image source={IMAGES.LogoText} style={styles.logo} />

          <View style={{ width: 24 }} />
        </View>

        <CustomText
          fontFamily="GabaritoSemiBold"
          fontSize={32}
          color={COLORS.darkText}
          style={{ textAlign: "center", marginVertical: verticalScale(24) }}
        >
          Frequently Asked Questions
        </CustomText>
        
      </SafeAreaView>
    </View>
  );
};

export default FAQ;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
  },
  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
});
