import React, { FC } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
      "OnePali is a community-driven initiative and digital platform created to serve as a portal for individuals to provide sustained humanitarian support to Palestine through small, collective monthly donations. Our goal is to unite 1 million people in a global movement of micro-philanthropy. By contributing as little as $1 a month, we aim to create a consistent and powerful stream of community-funded aid for children and families.",
  },
  {
    title: "Where funds are directed?",
    description:
      "100% of funds raised through OnePali are directed to Gaza through the Middle East Children’s Alliance (MECA), who work directly on the ground.",
  },
  {
    title: "Who’s involved?",
    description:
      "OnePali organizes the collective and facilitates monthly contributions. The Middle East Children’s Alliance distributes aid on the group and shares updates directly in OnePali.",
  },
  {
    title: "Who is PaliRoots?",
    description:
      "PaliRoots is a mission-driven brand dedicated to promoting Palestinian culture and identity while giving back to the community. Through creative design and global partnerships, PaliRoots raises awareness and funding for essential humanitarian projects across Palestine.",
  },
  {
    title: "Who is MECA?",
    description:
      "The Middle East Children’s Alliance (MECA) is a US-based 501(c)(3) nonprofit humanitarian aid organization that has been protecting the rights and improving the lives of children in the Middle East since 1988. Based in Berkeley, California, MECA is a top-rated charity (holding a 4-star rating from Charity Navigator) and is the primary partner for OnePali.",
  },
  {
    title: "How much do I contribute?",
    description:
      "OnePali organizes the collective and facilitates monthly contributions. The Middle East Children’s Alliance distributes aid on the group and shares updates directly in OnePali.",
  },
  {
    title: "Is my donation tax-deductible?",
    description:
      "Yes. Because your donations are processed directly by MECA, a 501(c)(3) organization, they are tax-deductible to the fullest extent of the law. You will receive a donation receipt via email for your records.",
  },
  {
    title: "What is my number?",
    description:
      "Your Supporter Number is a symbolic identifier that represents your unique place within the 1-million-person movement. It serves as your public username within the community registry. This number is a non-transferable social identifier and does not unlock any digital goods, services, or premium app features.",
  },
  {
    title: "Is my contribution recurring?",
    description:
      "Yes. To ensure MECA has a predictable budget for long-term relief projects, contributions are set as recurring monthly donations. You have full control and can pause or cancel your support at any time through the app.",
  },
  {
    title: "Is my payment secure?",
    description:
      "Yes. All donations are processed via Stripe, a global leader in payment security. OnePali does not see or store your credit card information. Your data is protected by PCI-standard encryption, ensuring your transaction with MECA is handled with the highest level of security.",
  },
  {
    title: "Who can join OnePali?",
    description:
      "Anyone with a supported payment method who wishes to support humanitarian efforts in Palestine can join the movement.",
  },
  {
    title: "Who can join OnePali?",
    description:
      "For support regarding your donations, tax receipts, or the work on the ground, please contact MECA directly at meca@mecaforpeace.org.",
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
  return (
    <View style={styles.container}>
      {/* IMPORTANT: remove bottom edge */}
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <CustomIcon Icon={ICONS.backArrow} height={26} width={26} />
          </TouchableOpacity>

          <Image source={IMAGES.LogoText} style={styles.logo} />

          <View style={{ width: 24 }} />
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
        {/* FAQ CONTENT */}
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
    marginTop: verticalScale(10),
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
