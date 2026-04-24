import React, { FC } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { PrivacyPolicyScreenProps } from "../../typings/routes";
import {
  horizontalScale,
  responsiveFontSize,
  verticalScale,
  wp,
} from "../../utils/Metrics";
import CustomIcon from "../../components/CustomIcon";
import ICONS from "../../assets/Icons";
import IMAGES from "../../assets/Images";
import { CustomText } from "../../components/CustomText";
import COLORS from "../../utils/Colors";
import FONTS from "../../assets/fonts";

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
const SubTittle = ({ children }: any) => (
  <CustomText
    fontFamily="GabaritoMedium"
    fontSize={18}
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

const Paragraph = ({ children }: any) => (
  <CustomText
    fontFamily="SourceSansRegular"
    fontSize={15}
    color={COLORS.appText}
    style={{ marginTop: verticalScale(8), lineHeight: 22 }}
  >
    {children}
  </CustomText>
);

const Bullet = ({ children }: any) => (
  <CustomText
    fontFamily="SourceSansRegular"
    fontSize={15}
    color={COLORS.appText}
    style={{
      marginTop: verticalScale(4),
      lineHeight: 22,
      paddingLeft: horizontalScale(5),
      width: "92%",
    }}
  >
    • {children}
  </CustomText>
);
const Section = ({ title, children }: any) => (
  <CustomText
    fontFamily="SourceSansRegular"
    fontSize={15}
    color={COLORS.appText}
    style={{
      marginTop: verticalScale(8),
      lineHeight: 22,
    }}
  >
    <CustomText
      style={{
        fontFamily: FONTS.GabaritoRegular,
        fontSize: responsiveFontSize(15),
        color: COLORS.darkText,
      }}
    >
      {title}:{" "}
    </CustomText>
    {children}
  </CustomText>
);

const BulletText = ({ title, children }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: verticalScale(6),
      paddingRight: horizontalScale(10),
    }}
  >
    {/* Bullet */}
    <CustomText
      fontFamily="SourceSansRegular"
      fontSize={15}
      color={COLORS.appText}
      style={{ marginRight: 6, lineHeight: 22 }}
    >
      •
    </CustomText>

    {/* Content */}
    <CustomText
      style={{
        flex: 1,
        lineHeight: 22,
      }}
    >
      {/* Heading */}
      <CustomText fontFamily="GabaritoRegular" color={COLORS.darkText}>
        {title}{" "}
      </CustomText>

      {/* Description */}
      <CustomText
        fontFamily="SourceSansRegular"
        fontSize={15}
        color={COLORS.appText}
      >
        {children}
      </CustomText>
    </CustomText>
  </View>
);


const PrivacyPolicy: FC<PrivacyPolicyScreenProps> = ({ navigation }) => {
  const openEmail = () => {
    Linking.openURL("mailto:meca@mecaforpeace.org");
  };

  const openWebsite = () => {
    Linking.openURL("https://www.mecaforpeace.org");
  };

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
        {/* SCROLL CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior='never'
          automaticallyAdjustContentInsets={false}
        >
          {/* HEADER */}

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
            style={{ textAlign: 'center', marginVertical: verticalScale(24) }}
          >
            Privacy Policy
          </CustomText>
          <Text>
            OnePali, LLC (also referred to as “OnePali,” “us” or “we”) is a
            wholly owned subsidiary of PaliRoots, LLC. We largely work with
            non-profits to develop platforms allowing those non-profits to
            solicit donations for their charitable causes (the “Platforms”). Our
            work, and the various tools we use to support that work are
            hereinafter referred to collectively as the “Service(s).”
          </Text>
          <Text>
            We take your privacy and information very seriously. To that end, we
            have this Privacy Policy to advise you of our rules on handling the
            information we receive connected to the Services. By accessing and
            using the Services of OnePali you acknowledge you read and agree to
            our Privacy Policy. If you do not agree to abide by this Privacy
            Policy, please immediately exit the Site and stop using the
            Services. Please also review our Terms of Service as these also
            dictate how you may use our Services. The Services include, but are
            not necessarily limited to, operating the website found at
            https://onepali.app/ (also referred to below as the “Site” or
            “Website”) and our mobile application(s), including but not
            necessarily limited to the One Pali App (the “App(s)”).
          </Text>
          <Text>
            This Privacy Policy is effective as of the effective date noted
            above and will remain in effect until we change it. We reserve the
            right to change this Privacy Policy at any time and will post
            changes to this policy on our Site. You should check this policy
            periodically as its terms may change from time to time. If you
            continue to use the Services, that means you acknowledge and agree
            to the modified policy.
          </Text>
          <Text>
            If you are located in the European Union, you may have rights under
            GDPR, which will be outlined in this policy. In addition, this
            policy will outline what Personal Information is collected by
            OnePali, as well as how that data is used.
          </Text>
          <Text>
            Finally, OnePali’s app-based Services, including but not limited to
            the OnePali app, are provided as a platform by OnePali, LLC for the
            benefit of non-profit entities. However, OnePali LLC has equal
            access and control of information submitted to those Platforms. By
            using OnePali’s app-based services, you are interacting directly
            with both OnePali, LLC and the relevant non-profit using the
            Platform(s) provided by OnePali, LLC. To understand the data
            protection practices of non-profit organizations using the OnePali
            app platform and how they impact you, please review their respective
            privacy policies as well. These privacy policies will generally be
            available through the relevant app Platform(s) for that non-profit
            organization. OnePali, LLC is not responsible for the privacy
            practices of entities OnePali provides Services to.
          </Text>
          <Text>You will find the following information in this policy:</Text>
          <Bullet>
            What Personal Information is Collected by OnePali Through
            Non-Platform Services and How it Is Used
          </Bullet>
          <Bullet>
            What Personal Information is Collected by OnePali Through the
            OnePali Platforms and How it Is Used
          </Bullet>
          <Bullet>Sources of Personal Information</Bullet>
          <Bullet>Sensitive Information Collection and Use Practices</Bullet>
          <Bullet>Data Retention and Security Practices</Bullet>
          <Bullet>How Policy Changes Will be Communicated</Bullet>
          <Bullet>Children’s Privacy Practices</Bullet>
          <Bullet>Your Rights Under GDPR</Bullet>
          <Bullet>
            Legal Basis for Processing Personal Information under GDPR
          </Bullet>
          <Bullet>How to Contact Us</Bullet>

          <Title>
            1. Information We Collect, How We Use It, Where We Share or Sell
          </Title>
          <Text>
            This section explains how OnePali will use, disclose, exchange, or
            transfer the Personal Information you provide on this website or
            that we collect through other means. OnePali collects Personal
            Information through 1) your interactions with OnePali, including our
            website and Apps; 2) as shared with us by third parties; and 3), as
            shared with us by our Service Providers (also referred to as
            “processors” under some privacy laws).
          </Text>
          <Text>
            For a further summary of how we use information collected through
            this website, please see the detailed list of categories of Personal
            Information and how we use it below.
          </Text>
          <Title>
            What Personal Information is Collected by OnePali Through
            Non-Platform Services and How it Is Used
          </Title>
          <Text>
            To clearly explain how and why your Personal Information is
            collected and used, OnePali has created the list of collected
            Personal Information found below. OnePali does not sell or disclose
            any of your Personal Information to any third party.
          </Text>
          <Text>
            While not the exclusive source of Personal Information, OnePali
            generally receives information directly from you when you interact
            with us by doing things like using our websites, the websites of our
            parent company PaliRoots, through mobile and desktop applications
            (other than the Platform(s)) which provide non-browser-based
            interaction between you and our websites, when you interact with our
            advertising and applications on third-party websites and services
            where those advertisements or applications include links to our
            Services, or signing up for our email lists. For more information,
            please see the Sources of Information section below.
          </Text>
          <Text>
            The following section explains the categories of Personal
            Information collected by OnePali, the purpose for collection and the
            categories of service providers processing the information on
            OnePali's behalf.
          </Text>
          <SubTittle>
            Identifiers and Personal Information Categories.
          </SubTittle>
          <Section title='What We Collect'>
            OnePali collects the following identifiers from users of our non-App
            Services: First and last names, email addresses, phone numbers,
            addresses including state, province, ZIP codes, city and address
            numbers, and IP addresses.
          </Section>
          <Section title='What We Do With It'>
            Information collected from you in this manner is collected for
            purposes of operating and providing our Services. It is also used to
            allow us to provide you with products or services your request from
            us, notify you about changes to our services, help us learn more
            about your shopping preferences, allow you to participate in
            interactive features of our Services, respond to inquiries, to
            communicate with you, for analytics and internal marketing purposes,
            for fraud prevention, to provide you with information, products or
            services you request from us, or to fulfill any other purpose for
            which you provide that information. This information is used to
            provide any expected Services.
          </Section>
          <SubTittle>Internet or Similar Network Activity</SubTittle>
          <Section title='What We Collect'>
            OnePali collects the following personal information categories from
            the internet or similar network activity from users of our non-App
            services: Analytics related to your use of our website such as
            traffic data, location data, logs and other communication data, and
            what resources you access and use on the Services.
          </Section>
          <Section title='What We Do With It'>
            This information is collected to assist in using our Services. It is
            also used with our analytics platforms to help improve the Service,
            store information about your preferences, speed up your searches,
            recognize when you return to the website, and for internal marketing
            purposes. This information is also used to respond to inquiries and
            for fraud prevention.
          </Section>
          <SubTittle>Communications Directly to OnePali</SubTittle>
          <Section title='What We Collect'>
            OnePali collects the following personal information categories when
            users of our non-App Services communicate directly with us:
            responses to surveys you choose to interact with and records and
            copies of your correspondence if you contact us.
          </Section>
          <Section title='What We Do With It'>
            This information is collected to provide any Services you may
            request, for analytics purposes, to improve your interaction with
            the website and for internal marketing purposes. This information is
            also used to respond to your inquiries and for fraud prevention.
          </Section>
          <SubTittle>Commercial Information</SubTittle>
          <Section title='What We Collect'>
            OnePali collects the following personal information categories
            related to commercial information from users of our non-App
            Services: information regarding purchase histories and purchase
            tendencies regarding our non-App Services.
          </Section>
          <Section title='What We Do With It'>
            This information is collected for analytics purposes, to improve
            your interaction with the website and for internal marketing
            purposes. This information is also used to respond to your inquiries
            and for fraud prevention.
          </Section>
          <SubTittle>Equipment Information</SubTittle>
          <Section title='What We Collect'>
            OnePali collects the following personal information categories
            related to equipment information from users of our non-App Services:
            the type of mobile device you use, the IP address of your device,
            your mobile operating system, the type of mobile Internet browser
            you use, unique device identifiers and other diagnostic data..
          </Section>
          <Section title='What We Do With It'>
            This information is collected for analytics purposes, to improve
            your interaction with the website and for internal marketing
            purposes. This information is also used to respond to your inquiries
            and for fraud prevention.
          </Section>
          <Title>Use of Data Generally, Service Providers of OnePali</Title>
          <Text>
            We will never sell or otherwise provide your information to
            unaffiliated third parties without your prior consent. We may
            disclose information when legally compelled to do so, when we, in
            good faith, believe that the law requires it, or for the protection
            of our legal rights.
          </Text>
          <Text>
            OnePali may aggregate information about you and other individuals
            together so that the information does not identify you personally.
            OnePali may use information in these forms for any legitimate
            business purpose, including for research and analysis,
            administration of services, advertising and promotional purposes.
          </Text>
          <Text>
            OnePali uses Service Providers to assist with analytics, search
            engine optimization, managing logistics, accessibility,
            communications, and marketing purposes. OnePali may share your
            Personal Information with these Service Providers to assist with the
            purposes outlined in this Privacy Policy.
          </Text>
          <Text>
            We may further disclose your personal information to a buyer or
            other successor in the event of a merger, divestiture,
            restructuring, reorganization, dissolution or other sale or transfer
            of some or all of the OnePali’s assets, whether as a going concern
            or as part of bankruptcy, liquidation or similar proceeding, in
            which personal information held by the OnePali about our users is
            among the assets transferred.
          </Text>
          <Text>
            We will not collect additional categories of personal information or
            use the personal information we collect for materially different,
            unrelated, or incompatible purposes without providing you notice.
          </Text>
          <Title>General Payment Processors</Title>
          <Paragraph>
            We may collect data necessary to process your payment if you make
            donations through our Services, such as your payment instrument
            number, and the security code associated with your payment
            instrument. All payment data is stored by our payment provider, e.g.
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: 'underline',
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() => Linking.openURL('https://stripe.com/privacy')}
            >
              {' '}
              https://stripe.com/privacy{' '}
            </CustomText>
            ,{' '}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: 'underline',
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() =>
                Linking.openURL(
                  'https://www.apple.com/legal/privacy/data/en/apple-pay/',
                )
              }
            >
              {' '}
              https://www.apple.com/legal/privacy/data/en/apple-pay/
            </CustomText>
            .
          </Paragraph>
          <Title>
            What Personal Information is Collected by OnePali Through the
            Platforms and How it Is Used
          </Title>
          <Text>
            To clearly explain how and why your Personal Information is
            collected and used through OnePali Platforms such as the One Pali
            App, OnePali has created the list of collected Personal Information
            found below. OnePali does not sell or disclose any of your Personal
            Information to any third party. The following section explains the
            categories of Personal Information collected by OnePali Apps such as
            One Pali, the purpose for collection and the categories of service
            providers processing the information on OnePali's behalf.
          </Text>

          <SubTittle>
            Identifiers and Personal Information Categories.
          </SubTittle>
          <Section title='What We Collect'>
            OnePali collects the following identifiers from users of our
            Platforms: First and last names, Google account or Apple ID, email
            addresses, and IP addresses.
          </Section>
          <Section title='What We Do With It'>
            Information collected from you on our Platforms ares collected for
            purposes of operating those Services. It is also used to allow us to
            provide Services, respond to inquiries, to communicate with you (for
            example when you sign up for our newsletter), for analytics and
            internal marketing purposes, and for fraud prevention.
          </Section>
          <SubTittle>Internet or Similar Network Activity</SubTittle>
          <Section title='What We Collect'>
            OnePali collects the following personal information categories from
            the internet or similar network activity from users of our
            Platforms: Analytics related to your use of our App including usage
            data and marketing attribution.
          </Section>
          <Section title='What We Do With It'>
            This information is collected to assist in using our Services. It is
            also used with our analytics platforms to help improve the Service
            and for internal marketing purposes. This information is also used
            to respond to inquiries and for fraud prevention.
          </Section>
          <SubTittle>Equipment Information</SubTittle>
          <Section title='What We Collect'>
            OnePali collects the following personal information categories
            related to equipment information from users of our Platforms: the
            type of mobile device you use, the IP address of your device, your
            mobile operating system, the type of mobile Internet browser you
            use, unique device identifiers and other diagnostic data.
          </Section>
          <Section title='What We Do With It'>
            This information is collected for analytics purposes, to improve
            your interaction with the app and for internal marketing purposes.
            This information is also used to respond to your inquiries and for
            fraud prevention.
          </Section>
          <Title>
            This information is collected for analytics purposes, to improve
            your interaction with the app and for internal marketing purposes.
            This information is also used to respond to your inquiries and for
            fraud prevention.
          </Title>
          <Text>
            We will never sell or otherwise provide your information collected
            through the Platforms to unaffiliated third parties without your
            prior consent. By using and providing information to the Platforms,
            you are providing your information directly to both the non-profit
            licensing the Platform in question and to OnePali. We may disclose
            information when legally compelled to do so, when we, in good faith,
            believe that the law requires it, or for the protection of our legal
            rights.
          </Text>
          <Text>
            OnePali may aggregate information about you and other individuals
            together so that the information does not identify you personally.
            OnePali may use information in these forms for any legitimate
            business purpose, including for research and analysis,
            administration of services, advertising and promotional purposes.
          </Text>
          <Text>
            OnePali uses Service Providers to assist with analytics, search
            engine optimization, managing logistics, accessibility,
            communications, and marketing purposes. OnePali may share your
            Personal Information with these Service Providers to assist with the
            purposes outlined in this Privacy Policy.
          </Text>
          <Text>
            We may further disclose your personal information to a buyer or
            other successor in the event of a merger, divestiture,
            restructuring, reorganization, dissolution or other sale or transfer
            of some or all of the OnePali’s assets, whether as a going concern
            or as part of bankruptcy, liquidation or similar proceeding, in
            which personal information held by the OnePali about our users is
            among the assets transferred.
          </Text>
          <Text>
            We will not collect additional categories of personal information or
            use the personal information we collect for materially different,
            unrelated, or incompatible purposes without providing you notice.
          </Text>
          <Title>2. Sources of Information</Title>
          <Text>
            We obtain the personal information listed above from the following
            categories of sources:
          </Text>
          <Bullet>
            Directly from users of our Services and other consumers. For
            example, from signing up for a newsletter, forms you complete,
            donations you make, or in relation to services you receive from us.
          </Bullet>
          <Bullet>
            Indirectly from users of our Services through usage details we
            collect. For example, from observing your actions on our Website and
            Apps through analytics tools.
          </Bullet>
          <Bullet>
            From third parties such as our business partners and non-profits
            licensing the Platforms.
          </Bullet>
          <Bullet>In person.</Bullet>
          <Title>3. Sensitive Information</Title>
          <Text>
            OnePali does not use or disclose any sensitive information on you
            except to perform services reasonably expected by you, for fraud
            detection purposes, and to detect security incidents. However,
            please be aware that, as stated above, both OnePali and non-profits
            licensing our Platforms process your Personal Information as a
            controller of that data. Please refer to the Privacy Policies of any
            non-profit licensing the One Pali Platforms for their practices
            regarding sensitive information.
          </Text>
          <Text>
            Sensitive information is defined by GDPR as Personal Information
            that reveals any of the following: (1) personal data revealing
            racial or ethnic origin, (2) political opinions, religious or
            philosophical beliefs; (3) trade-union membership; (4) genetic data,
            biometric data processed solely to identify a human being; (5)
            health-related data; or (6) data concerning a person’s sex life or
            sexual orientation. As some non-profits licensing the OnePali
            Platforms may be focused on work that can be interpreted as
            political, your identity in association with your donation may be
            considered sensitive information under some privacy laws.
          </Text>
          <Title>4. If You Live Outside of the United States</Title>
          <Text>
            OnePali's Services are hosted in the United States and are governed
            by United States law. If you are using the Services from outside the
            United States, please be aware that your information may be
            transferred to, stored and processed in the United States. The data
            protection and other laws of the United States might not be as
            comprehensive or protective of certain rights as those in your
            country. Under United States law, your information may be subject to
            access requests from governments, courts, or law enforcement in the
            United States. By using the Services, you consent to your
            information being transferred to our facilities and to the
            facilities of those service providers with whom we share it as
            described in this Privacy Policy and processed in those facilities.
          </Text>
          <Title>5. Data Retention and Security</Title>
          <Text>
            We will retain your Personal Information only for as long as is
            necessary for the purposes set out in this Privacy Policy. We will
            retain and use your Personal Information to the extent necessary to
            comply with our legal obligations (for example, if we are required
            to retain your data to comply with applicable laws), resolve
            disputes, and enforce our legal agreements and policies.
          </Text>
          <Text>
            We have implemented measures designed to secure your Personal
            Information from accidental loss and from unauthorized access, use,
            alteration, and disclosure. The safety and security of your
            information also depends on you. Where we have given you (or where
            you have chosen) a password for access to certain parts of our
            Services, you are responsible for keeping this password
            confidential. We ask you not to share your password with anyone.
          </Text>
          <Text>
            Please be aware that, although we endeavor to provide reasonable
            security for user personal information we process and maintain, no
            security measures can guarantee absolute safety and prevent all
            potential security breaches.
          </Text>
          <Title>6. OnePali Cookies Policy</Title>
          <Text>
            Like most websites, OnePali uses cookies for a variety of purposes.
            This Cookies Policy will explain what cookies are, what we use them
            for, and how you can opt out of using cookies through your browser.
          </Text>
          <Text>
            A cookie is a small piece of data sent from a website (like
            https://onepali.app/) and stored on your computer by your web
            browser while you are browsing. Cookies are how websites ‘remember’
            information about you in order to properly respond when you access
            website features. Examples include remembering which pages you
            visited in the past and authenticating whether you can access
            certain secure information. Some websites also use cookies for
            gathering marketing data or other marketing purposes.
          </Text>
          <Text>
            By continuing to use the Site, you expressly consent to the use of
            cookies as described in this Privacy Policy.
          </Text>
          <Text>
            We use some Required and Functional Cookies in order to allow our
            site to operate. These cookies are used for things such as
            remembering that you’re logged in and are necessary to provide the
            Services. These cookies can include both permanent and session
            cookies, and are in general used to improve your experience when
            interacting with the Site.
          </Text>
          <Text>
            We also use Analytics Cookies for analytics purposes. Analytics
            Cookies are used internally, to help Website operators understand
            what their users are doing, in order to further customize and
            develop the Website in the future. They are used to show patterns of
            access by many users on a site.
          </Text>
          <Text>
            Certain features of our Website may use local stored objects (or
            Flash cookies) to collect and store information about your
            preferences and navigation to, from and on our Website. Flash
            cookies are not managed by the same browser settings as are used for
            browser cookies.
          </Text>
          <Text>
            Pages of our the Website and our e-mails may contain small
            electronic files known as web beacons that permit the Company, for
            example, to count users who have visited those pages or opened an
            e-mail and for other related website statistics (for example,
            recording the popularity of certain website content and verifying
            system and server integrity). Pixels used: Facebook, TikTok,
            Pinterest, Snap, Google Ads / Remarketing pixel, GA4
          </Text>
          <Text>
            Some content or applications, including advertisements, on the
            Website are served by third-parties, including advertisers, ad
            networks and servers, content providers and application providers.
            These third parties may use cookies alone or in conjunction with web
            beacons or other tracking technologies to collect information about
            you when you use our website. The information they collect may be
            associated with your personal information or they may collect
            information, including personal information, about your online
            activities over time and across different websites and other online
            services. They may use this information to provide you with
            interest-based (behavioral) advertising or other targeted content.
          </Text>
          <Text>
            We do not control these third parties' tracking technologies or how
            they may be used. If you have any questions about an advertisement
            or other targeted content, you should contact the responsible
            provider directly.
          </Text>
          <Title>7. Links to Other Sites</Title>
          <Text>
            Our Service may contain links to other sites. If you click on such a
            link, you will be directed to that site. Note that these external
            sites are not operated by us. Therefore, we strongly advise you to
            review the privacy policies of these websites. We have no control
            over and assume no responsibility for the content, privacy policies,
            or practices of any external sites or services.
          </Text>
          <Text>
            Once again, the sites those links can take you to have their own
            separate privacy policies. Although we seek to protect the integrity
            of our site, we are not liable for the content and activities of
            those sites. Your visits and access to such websites are at your own
            risk. Please note that those other sites may send their own cookies
            to users, collect data, or solicit personal information.
          </Text>
          <Title>8. Changes to This Privacy Policy</Title>
          <Text>
            We may update our Privacy Policy from time to time. Thus, we advise
            you to review this page periodically for any changes. We will notify
            you of any changes by posting the new Privacy Policy on this page or
            as otherwise required by applicable laws and regulations. These
            changes are effective immediately, after they are posted on this
            page.
          </Text>
          <Title>9. Children’s Privacy and Information of Children</Title>
          <Text>
            OnePali Services are not intended for children under 13 years of
            age. No one under the age of 13 is permitted to provide any personal
            information to OnePali in any manner. OnePali does not knowingly
            collect the personal information of individuals under 13 years of
            age for the general use portions of our Services . If we discover
            that a child under 13 has provided us with personal information, we
            immediately delete this from our general purpose OnePali servers. If
            you are a parent or guardian and you are aware that your child has
            provided us with Personal Information or is using our Services
            without your supervision or consent, please contact us so that we
            can take the necessary actions.
          </Text>
          <Title>10. EU/EEA/UK Privacy Rights</Title>
          <Text>
            Additionally, if you are located in the European Union (“EU”) or
            United Kingdom (“UK”), you have the following rights under the
            General Data Protection Regulation (GDPR) and its UK counterpart
            (UK-GDPR):
          </Text>
          <BulletText title='The right to access.'>
            You have the right to request copies of your Personal Information.
            We may charge you a small fee for this service, although we will
            avoid that if we can.
          </BulletText>
          <BulletText title='The right to rectification.'>
            You have the right to request that OnePali correct any information
            you believe is inaccurate, and/or to complete information you
            believe is incomplete.
          </BulletText>
          <BulletText title='The right to erasure.'>
            You have the right to request that OnePali erase your Personal
            Information, unless certain conditions or exemptions apply.
          </BulletText>
          <BulletText title='The right to restrict processing.'>
            You have the right to request that OnePali restrict the processing
            of your Personal Information, unless certain conditions or
            exemptions apply.
          </BulletText>
          <BulletText title='The right to object to processing.'>
            You have the right to object to OnePali's processing of your
            Personal Information, unless certain conditions or exemptions apply.
          </BulletText>
          <BulletText title='The right to data portability.'>
            You have the right to request that OnePali transfer the data that we
            have collected to another organization, or directly to you, unless
            certain conditions or exemptions apply.
          </BulletText>
          <Text>
            If you make a request, we will respond within the time legally
            permitted to us. If you would like to exercise any of these rights,
            or have any questions, please contact us using the form below.
          </Text>
          <Title>EU/UK Legal Basis</Title>
          <Text>
            Where we process the data of an individual subject to GDPR or
            UK-GDPR, we do so on a number of legal basis. Depending on the type
            of information processed, our basis for processing can include: (1)
            your consent; (2) where necessary to perform a contract with you (3)
            where necessary for legal compliance purposes; (4) where such
            processing is necessary to protect the vital interests of you or
            another person; (5) where the processing is necessary to carry out a
            task of public interest; and (6) where the legitimate interests of
            OnePali or a third party allow it.
          </Text>
          <Text>
            The vast majority of the processing done by OnePali is done for the
            purpose of providing the Services, by the consent of users, and/or
            to fulfill legal obligations. The non-profits licensing the One Pali
            Platforms are also controllers of Personal Information submitted
            through the Platforms. Please see their privacy policies for their
            legal basis and practices.
          </Text>
          <Text>
            You have the right to complain to your local data protection
            authority if you are unhappy with our privacy practices.
          </Text>

          <Title>11. Contact Us</Title>
          <Paragraph>
            To ask questions or comment about this privacy policy and our
            privacy practices, contact us at{' '}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: 'underline',
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() => Linking.openURL('support@onepali.app')}
            >
              support@onepali.app
            </CustomText>
            .
          </Paragraph>

          <View style={{ height: verticalScale(30) }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default PrivacyPolicy;

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
