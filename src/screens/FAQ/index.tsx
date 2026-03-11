import React, { FC } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import CustomIcon from "../../components/CustomIcon";
import { CustomText } from "../../components/CustomText";
import { FaqScreenProps } from "../../typings/routes";
import COLORS from "../../utils/Colors";
import { horizontalScale, verticalScale } from "../../utils/Metrics";

const FAQ_DATA = [
  {
    title: "What is OnePali?",
    description:
      "OnePali is a $1 monthly donation app supporting families in Palestine through the Middle East Children’s Alliance (MECA).",
  },
  {
    title: "Where funds are directed?",
    description:
      "All donations made through OnePali are deposited directly into MECA’s accounts and used to provide humanitarian aid and programs for children on the ground in Palestine.",
  },
  {
    title: "What does my contribution support?",
    description:
      "Your contribution supports hot meals and food parcels, clean water for drinking and hygiene, arts and creative activities, and psychological support for children and families in Palestine.",
  },
  {
    title: "Who is MECA?",
    description:
      "The Middle East Children’s Alliance (MECA) is a nonprofit organization founded in 1988 that works to protect the rights and improve the lives of children and families in Palestine and the Middle East. MECA holds a 4-star rating from Charity Navigator.",
  },
  {
    title: "Who is PaliRoots?",
    description:
      "PaliRoots is a mission-driven heritage brand dedicated to promoting Palestinian culture and supporting humanitarian initiatives. OnePali is developed in collaboration with PaliRoots.",
  },
  {
    title: "What is my Supporter Number?",
    description:
      "Your Supporter Number represents your place within the 1-million-person collective. It remains active as long as your monthly contribution continues. One supporter number per account! Your Supporter Number cannot be changed.",
  },
  {
    title: "How much do I contribute?",
    description:
      "The standard contribution is $1 per month. You may choose to give $3 or $5 per month if you’d like to increase your support.",
  },
  {
    title: "How do processing fees work?",
    description:
      "Payment processing fees are applied by Stripe. These fees are added on top of your selected donation so that the full $1, $3, or $5 goes directly to MECA.",
  },
  {
    title: "What is the optional $0.25 support for OnePali?",
    description:
      "You have the option to add $0.25 per month to support the OnePali platform. \nThis optional contribution helps cover technology, infrastructure, and operational costs required to maintain and grow the app. This amount can be toggled on or off before confirming your donation or in the settings.",
  },
  {
    title: "Is my contribution recurring?",
    description:
      "Yes. Donations are set as recurring monthly contributions to provide consistent support. You may pause or cancel at any time through the app.",
  },
  {
    title: "What happens if I cancel or miss a payment?",
    description:
      "You can cancel your monthly donation at any time. \nIf a payment fails or your contribution is canceled, your Supporter Number will remain reserved for 7 days. After 7 days without an active contribution, the account and number are released.",
  },
  {
    title: "How do I delete my account?",
    description:
      "If your monthly contribution payment fails or is not renewed, your account will be automatically deleted 7 days after your next payment date. You may also request account deletion at any time through the app settings in accordance with our privacy policy.",
  },
  {
    title: "Is my payment secure?",
    description:
      "All donations are processed securely through Stripe, a global leader in payment security. Your information is protected with industry-standard encryption.",
  },
  {
    title: "Is my donation tax-deductible?",
    description:
      "Yes. Donations are processed directly by MECA, a registered 501(c)(3) nonprofit organization. You will receive a donation receipt for your records.",
  },
  {
    title: "Is this eligible for Zakat?",
    description:
      "Yes. Donations are processed directly by MECA, a registered nonprofit providing humanitarian assistance to eligible recipients. If you are giving with the intention of Zakat, your contribution qualifies under charitable distribution to those in need. For personal religious guidance, donors should consult a qualified scholar.",
  },
  {
    title: "Is OnePali a nonprofit organization?",
    description:
      "OnePali is a platform that facilitates monthly donations. Funds are deposited directly to MECA, a registered 501(c)(3) nonprofit organization.",
  },
  {
    title: "Who can join OnePali?",
    description:
      "Anyone who wishes to provide sustained humanitarian support to families in Palestine can join.",
  },
  {
    title: "How is my data used?",
    description:
      "We collect only the information necessary to process your donation and provide updates. We do not sell or share your personal data. See our Privacy Policy here. ",
  },
];

const Title = ({ children }: any) => (
  <CustomText
    fontFamily="GabaritoSemiBold"
    fontSize={24}
    color={COLORS.darkText}
    style={{ textAlign: "center" }}
  >
    {children}
  </CustomText>
);

const Text = ({ children }: any) => (
  <CustomText
    fontFamily="GabaritoRegular"
    fontSize={14}
    color={COLORS.appText}
    style={{ lineHeight: 20, textAlign: "center" }}
  >
    {children}
  </CustomText>
);

const FAQ: FC<FaqScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* IMPORTANT: remove bottom edge */}
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top,
          },
        ]}
        edges={["bottom"]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            left: 0,
            top: insets.top + 5,
            zIndex: 10,
            padding: horizontalScale(20),
            paddingVertical: verticalScale(10),
          }}
        >
          <CustomIcon Icon={ICONS.backArrow} height={26} width={26} />
        </TouchableOpacity>
        {/* FAQ CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Image source={IMAGES.LogoText} style={styles.logo} />
          </View>

          <CustomText
            fontFamily="GabaritoSemiBold"
            fontSize={32}
            color={COLORS.darkText}
            style={{
              textAlign: "center",
              marginTop: verticalScale(32),
              marginBottom: verticalScale(24),
            }}
          >
            FAQS
          </CustomText>
          {FAQ_DATA.map((item, index) => (
            <View
              key={index}
              style={{
                gap: verticalScale(12),
                marginBottom: verticalScale(24),
              }}
            >
              <Title>{item.title}</Title>
              <Text>{item.description}</Text>
            </View>
          ))}
        </ScrollView>
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
    marginBottom: verticalScale(16),
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(15),
  },
  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: "contain",
  },
  scrollContent: {},
});
