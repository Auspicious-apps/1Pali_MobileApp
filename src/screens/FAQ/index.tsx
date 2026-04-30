import React, { FC } from "react";
import {
  Image,
  Linking,
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
      "OnePali is a micro-donation app built to mobilize one million monthly supporters for families in Palestine through the Middle East Children's Alliance (MECA), a registered 501(c)(3) nonprofit organization. We handle the technology, marketing, and operations — connecting donors directly to the ground. Behind OnePali is a dedicated team pushing this mission forward.",
  },
  {
    title: "Who is PaliRoots?",
    description:
      "PaliRoots is a Palestinian heritage clothing brand. OnePali is built by the team behind it. Learn more at https://paliroots.com",
  },
  {
    title: "Who is MECA?",
    description:
      "The Middle East Children’s Alliance (MECA) is a nonprofit organization founded in 1988 that works to protect the rights and improve the lives of children and families in Palestine and the Middle East. MECA holds a 4-star rating from Charity Navigator.",
  },
  {
    title: "Where are funds directed?",
    description:
      "Every donation is directly deposited to MECA. After processing fees, 90% goes to MECA to fund humanitarian aid and operations, and 10% keeps the OnePali platform growing.",
  },
  {
    title: "What does my contribution support?",
    description:
      "Your contribution supports hot meals and food parcels, clean water for drinking and hygiene, arts and creative programs, and psychological support for children and families in Palestine.",
  },
  {
    title: "What is my supporter number?",
    description:
      "Your supporter number is your unique identifier within the OnePali collective. It remains active as long as your monthly contribution continues. One supporter number per account. Your Supporter Number cannot be changed.",
  },
  {
    title: "Is my contribution recurring?",
    description:
      "Yes. Donations are set as recurring monthly contributions to provide consistent support. You may pause or cancel at any time through the app.",
  },
  {
    title: "What happens if I cancel or miss a payment?",
    description:
      "You can cancel at any time. If you cancel, your supporter number is released immediately. If a payment fails, your number is held for 7 days before being released.",
  },
  {
    title: "How do I delete my account?",
    description:
      "To permanently delete your account, contact us at support@onepali.app",
  },
  {
    title: "Is my payment secure?",
    description:
      "All donations are processed securely through Stripe, a global leader in payment security. Your information is protected with industry-standard encryption.",
  },
  {
    title: "Is my donation tax-deductible?",
    description:
      "Yes. Donations are processed directly by MECA, a registered 501(c)(3) nonprofit organization. Your donation receipt is available in the app under account settings. For additional help, contact MECA at MECA@mecaforpeace.org",
  },
  {
    title: "Is this eligible for Zakat?",
    description:
      "Yes. Donations are processed directly by MECA, a registered nonprofit providing humanitarian assistance to eligible recipients. If you are giving with the intention of Zakat, your contribution qualifies under charitable distribution to those in need. For personal religious guidance, donors should consult a qualified scholar.",
  },
  {
    title: "Where can I get help or ask questions?",
    description:
      "For donation-related questions, tax receipts, or updates on the work on the ground, contact MECA at meca@mecaforpeace.org. For app support or technical issues, contact support@onepali.app",
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

const renderTextWithLinks = (text: string) => {
  const parts = text.split(/(https?:\/\/[^\s]+|[\w.-]+@[\w.-]+\.\w+)/g);

  return (
    <CustomText
      fontFamily="GabaritoRegular"
      fontSize={14}
      color={COLORS.appText}
      style={{ lineHeight: 20, textAlign: "center" }}
    >
      {parts.map((part, index) => {
        const isLink = part.startsWith("http") || part.includes("@");

        if (isLink) {
          return (
            <CustomText
              key={index}
              fontFamily="GabaritoRegular"
              fontSize={14}
              color="#007AFF"
              onPress={() =>
                Linking.openURL(
                  part.startsWith("http") ? part : `mailto:${part}`,
                )
              }
            >
              {part}
            </CustomText>
          );
        }

        return part; // 👈 plain text (NOT clickable)
      })}
    </CustomText>
  );
};

const FAQ: FC<FaqScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            paddingTop: insets.top,
          },
        ]}
        edges={['bottom']}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            left: 0,
            top: insets.top + 5,
            zIndex: 10,
            padding: horizontalScale(20),
            paddingVertical: verticalScale(10),
          }}
        >
          <CustomIcon
            Icon={ICONS.backArrow}
            height={verticalScale(26)}
            width={verticalScale(26)}
          />
        </TouchableOpacity>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={IMAGES.LogoText}
              style={styles.logo}
            />
          </View>

          <CustomText
            fontFamily='GabaritoSemiBold'
            fontSize={32}
            color={COLORS.darkText}
            style={{
              textAlign: 'center',
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

              <View style={{ alignItems: 'center' }}>
                {renderTextWithLinks(item.description)}
              </View>
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
