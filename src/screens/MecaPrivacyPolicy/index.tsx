import React, { FC } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  MecaPrivacyPolicyScreenProps,
  PrivacyPolicyScreenProps,
} from '../../typings/routes';
import {
  horizontalScale,
  responsiveFontSize,
  verticalScale,
  wp,
} from '../../utils/Metrics';
import CustomIcon from '../../components/CustomIcon';
import ICONS from '../../assets/Icons';
import IMAGES from '../../assets/Images';
import { CustomText } from '../../components/CustomText';
import COLORS from '../../utils/Colors';
import FONTS from '../../assets/fonts';

const MecaPrivacyPolicy: FC<MecaPrivacyPolicyScreenProps> = ({
  navigation,
}) => {
  const openEmail = () => {
    Linking.openURL('mailto:meca@mecaforpeace.org');
  };

  const openWebsite = () => {
    Linking.openURL('https://www.mecaforpeace.org');
  };

  const Title = ({ children }: any) => (
    <CustomText
      fontFamily='GabaritoMedium'
      fontSize={22}
      color={COLORS.darkText}
      style={{ marginTop: verticalScale(24), marginBottom: verticalScale(8) }}
    >
      {children}
    </CustomText>
  );
  const SubTittle = ({ children }: any) => (
    <CustomText
      fontFamily='GabaritoMedium'
      fontSize={18}
      color={COLORS.darkText}
      style={{ marginTop: verticalScale(24), marginBottom: verticalScale(8) }}
    >
      {children}
    </CustomText>
  );

  const Text = ({ children }: any) => (
    <CustomText
      fontFamily='SourceSansRegular'
      fontSize={15}
      color={COLORS.appText}
      style={{ marginTop: verticalScale(8), lineHeight: 22 }}
    >
      {children}
    </CustomText>
  );

  const Paragraph = ({ children }: any) => (
    <CustomText
      fontFamily='SourceSansRegular'
      fontSize={15}
      color={COLORS.appText}
      style={{ marginTop: verticalScale(8), lineHeight: 22 }}
    >
      {children}
    </CustomText>
  );

  const Bullet = ({ children }: any) => (
    <CustomText
      fontFamily='SourceSansRegular'
      fontSize={15}
      color={COLORS.appText}
      style={{
        marginTop: verticalScale(4),
        lineHeight: 22,
        paddingLeft: horizontalScale(5),
        width: '92%',
      }}
    >
      • {children}
    </CustomText>
  );
  const Section = ({ title, children }: any) => (
    <CustomText
      fontFamily='SourceSansRegular'
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
        {title}:{' '}
      </CustomText>
      {children}
    </CustomText>
  );

  const BulletText = ({ title, children }: any) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: verticalScale(6),
        paddingRight: horizontalScale(10),
      }}
    >
      {/* Bullet */}
      <CustomText
        fontFamily='SourceSansRegular'
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
        <CustomText
          fontFamily='GabaritoRegular'
          color={COLORS.darkText}
        >
          {title}{' '}
        </CustomText>

        {/* Description */}
        <CustomText
          fontFamily='SourceSansRegular'
          fontSize={15}
          color={COLORS.appText}
        >
          {children}
        </CustomText>
      </CustomText>
    </View>
  );

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
            Middle East Children's Alliance Privacy Policy
          </CustomText>
          <Text>Effective Date: April 8, 2026</Text>

          <Text>
            Middle East Children’s Alliance (also referred to as “MECA,” “us” or
            “we”) is a nonprofit humanitarian aid organization based in
            Berkeley, California, that works to protect the rights and improve
            the lives of children in the Middle East through aid, empowerment
            and education. Our work, and the various tools we use to support
            that work are hereinafter referred to collectively as the
            “Service(s).”
          </Text>
          <Text>
            We take your privacy and information very seriously. To that end, we
            have this Privacy Policy to advise you of our rules on handling the
            information we receive connected to the Services. By accessing and
            using the Services of MECA you acknowledge you read and agree to our
            Privacy Policy. If you do not agree to abide by this Privacy Policy,
            please immediately exit the Site and stop using the Services. Please
            also review our Terms of Service as these also dictate how you may
            use our Services. The Services include, but are not necessarily
            limited to, operating the website found at
            https://www.mecaforpeace.org/ (also referred to below as the “Site”
            or “Website”) and our mobile application(s), including but not
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
            MECA is a California nonprofit public benefit corporation that is
            recognized as tax-exempt under federal and state law. We do collect
            a variety of information identifying or identifiable to individuals
            (“Personal Information”) in pursuit of our charitable and
            educational activities.
          </Text>
          <Text>
            However, because MECA is a public charity, the majority of privacy
            laws are not applicable to MECA. In particular, no omnibus privacy
            laws of any U.S. state apply to MECA. If this were ever to change,
            this Privacy Policy would be updated to reflect those new
            obligations.
          </Text>
          <Text>
            Finally, MECA’s App, OnePali, is provided and operated by OnePali,
            LLC. By using the OnePali App, you are interacting directly with
            both MECA and OnePali, LLC. To understand OnePali, LLC’s data
            protection practices and how they impact you, please review their
            privacy policy as well.
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
            This section explains how MECA will use, disclose, exchange, or
            transfer the Personal Information you provide on this website or
            that we collect through other means. MECA collects Personal
            Information through 1) your interactions with MECA, including our
            website and Apps; 2) as shared with us by third parties in support
            of our charitable mission; and 3), as shared with us by our Service
            Providers (also referred to as “processors” under some privacy
            laws).
          </Text>
          <Text>
            For a further summary of how we use information collected through
            this website, please see the detailed list of categories of Personal
            Information and how we use it below.
          </Text>
          <Title>
            What Personal Information is Collected by MECA Through Non-App
            Services and How it Is Used
          </Title>
          <Text>
            To clearly explain how and why your Personal Information is
            collected and used, MECA has created the list of collected Personal
            Information found below. MECA does not sell or disclose any of your
            Personal Information to any third party.
          </Text>
          <Text>
            While not the exclusive source of Personal Information, MECA
            generally receives information directly from you when you interact
            with us by doing things like making a donation, joining online
            actions such as petitions, or signing up for our email lists. For
            more information, please see the Sources of Information section
            below.
          </Text>
          <Text>
            The following section explains the categories of Personal
            Information collected by MECA, the purpose for collection and the
            categories of service providers processing the information on MECA's
            behalf.
          </Text>
          <SubTittle>
            Identifiers and Personal Information Categories.
          </SubTittle>
          <Section title='What We Collect'>
            MECA collects the following identifiers from users of our non-App
            Services: First and last names, email addresses, phone numbers,
            addresses including state, province, ZIP codes, city and address
            numbers, and IP addresses.
          </Section>
          <Section title='What We Do With It'>
            Information collected from you on our Website and Apps is collected
            for purposes of operating those Services. It is also used to allow
            us to accept donations, respond to inquiries, to communicate with
            you (for example when you sign up for our newsletter), for analytics
            and internal marketing purposes, and for fraud prevention. This
            information is used to provide the expected service of the Website
            and Apps and in support of our charitable mission. Information
            collected offline is used in support of our charitable mission.
          </Section>
          <SubTittle>Internet or Similar Network Activity</SubTittle>
          <Section title='What We Collect'>
            MECA collects the following personal information categories from the
            internet or similar network activity from users of our non-App
            services: Analytics related to your use of our website.
          </Section>
          <Section title='What We Do With It'>
            This information is collected to assist in using our Services. It is
            also used with our analytics platforms to help improve the Service
            and for internal marketing purposes. This information is also used
            to respond to inquiries and for fraud prevention.
          </Section>
          <SubTittle>Equipment Information</SubTittle>
          <Section title='What We Collect'>
            MECA collects the following personal information categories related
            to equipment information from users of our non-App Services: the
            type of mobile device you use, the IP address of your device, your
            mobile operating system, the type of mobile Internet browser you
            use, unique device identifiers and other diagnostic data.
          </Section>
          <Section title='What We Do With It'>
            This information is collected for analytics purposes, to improve
            your interaction with the website and for internal marketing
            purposes. This information is also used to respond to your inquiries
            and for fraud prevention.
          </Section>
          <Title>Use of Data Generally, Service Providers of MECA</Title>
          <Text>
            In addition to the foregoing, we use Personal Information collected
            through non-App sources for purposes of conducting our charitable
            activities. For instance, if you sign up to receive our newsletter
            we may use your Personal Information to contact you with newsletters
            or other information that we think may be of interest to you. You
            may opt out of these communications at any time, excluding emails
            directly relating to any ongoing business we have together.
          </Text>
          <Text>
            We will never sell or otherwise provide your information to
            unaffiliated third parties without your prior consent. We may
            disclose information when legally compelled to do so, when we, in
            good faith, believe that the law requires it, or for the protection
            of our legal rights.
          </Text>
          <Text>
            MECA may aggregate information about you and other individuals
            together so that the information does not identify you personally.
            MECA may use information in these forms for any legitimate business
            purpose, including for research and analysis, administration of
            services, advertising and promotional purposes.
          </Text>
          <Text>
            MECA uses Service Providers to assist with payment/donation
            processing, communications, and marketing purposes. MECA may share
            your Personal Information with these Service Providers to assist
            with the purposes outlined in this Privacy Policy.
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
            What Personal Information is Collected by MECA Through the OnePali
            App and How it Is Used
          </Title>
          <Text>
            To clearly explain how and why your Personal Information is
            collected and used through MECA Apps such as One Pali, MECA has
            created the list of collected Personal Information found below. MECA
            does not sell or disclose any of your Personal Information to any
            third party. However, MECA wants to emphasize again that the OnePali
            App is owned and operated by the entity One Pali.
          </Text>
          <Text>
            The following section explains the categories of Personal
            Information collected by MECA Apps such as One Pali, the purpose for
            collection and the categories of service providers processing the
            information on MECA's behalf.
          </Text>

          <SubTittle>
            Identifiers and Personal Information Categories.
          </SubTittle>
          <Section title='What We Collect'>
            MECA collects the following identifiers from users of our Apps:
            First and last names, Google account or Apple ID, email addresses,
            and IP addresses.
          </Section>
          <Section title='What We Do With It'>
            Information collected from you on our Website and Apps is collected
            for purposes of operating those Services. It is also used to allow
            us to accept donations, respond to inquiries, to communicate with
            you (for example when you sign up for our newsletter), for analytics
            and internal marketing purposes, and for fraud prevention. This
            information is used to provide the expected service of the Website
            and Apps and in support of our charitable mission. Information
            collected offline is used in support of our charitable mission.
          </Section>
          <SubTittle>Internet or Similar Network Activity</SubTittle>
          <Section title='What We Collect'>
            MECA collects the following personal information categories from the
            internet or similar network activity from users of our Apps:
            Analytics related to your use of our App including usage data and
            marketing attribution.
          </Section>
          <Section title='What We Do With It'>
            This information is collected to assist in using our Services. It is
            also used with our analytics platforms to help improve the Service
            and for internal marketing purposes. This information is also used
            to respond to inquiries and for fraud prevention.
          </Section>
          <SubTittle>Equipment Information</SubTittle>
          <Section title='What We Collect'>
            MECA collects the following personal information categories related
            to equipment information from users of our Apps: the type of mobile
            device you use, the IP address of your device, your mobile operating
            system, the type of mobile Internet browser you use, unique device
            identifiers and other diagnostic data.
          </Section>
          <Section title='What We Do With It'>
            This information is collected for analytics purposes, to improve
            your interaction with the app and for internal marketing purposes.
            This information is also used to respond to your inquiries and for
            fraud prevention.
          </Section>
          <Title>
            Use of Data From Apps, Service Providers of MECA in Relation to Apps
          </Title>
          <Text>
            In addition to the foregoing, we use Personal Information for
            purposes of conducting our charitable activities. For instance, if
            you sign up to receive our newsletter we may use your Personal
            Information to contact you with newsletters or other information
            that we think may be of interest to you. You may opt out of these
            communications at any time, excluding emails directly relating to
            any ongoing business we have together.
          </Text>
          <Text>
            We will never sell or otherwise provide your information to
            unaffiliated third parties without your prior consent. However, MECA
            wants to emphasize again that the OnePali App is owned and operated
            by the entity OnePali, LLC. By using and providing information to
            the OnePali App, you are providing your information directly to both
            MECA and OnePali. We may disclose information when legally compelled
            to do so, when we, in good faith, believe that the law requires it,
            or for the protection of our legal rights.
          </Text>

          <Text>
            MECA may aggregate information about you and other individuals
            together so that the information does not identify you personally.
            MECA may use information in these forms for any legitimate business
            purpose, including for research and analysis, administration of
            services, advertising and promotional purposes.
          </Text>

          <Text>
            MECA uses Service Providers to assist with online donations, payment
            processing, database hosting, as well as analytics and marketing
            purposes. MECA may share your Personal Information with these
            Services Providers to assist with the purposes outlined in this
            Privacy Policy.
          </Text>

          <Text>
            We will not collect additional categories of personal information or
            use the personal information we collect for materially different,
            unrelated, or incompatible purposes without providing you notice.
          </Text>

          <Title>App Payment Processors</Title>
          <Text>
            We may collect data necessary to process your payment if you make
            donations through our Services, such as your payment instrument
            number, and the security code associated with your payment
            instrument. All payment data is stored by Apple Pay and/or Stripe.
            You may find their privacy notice link(s) here:
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
            and
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
            From third parties in support of our charitable mission.
          </Bullet>
          <Bullet>In person.</Bullet>

          <Title>3. Comments and User Generated Content</Title>
          <Text>
            MECA Apps give users the ability to leave comments and otherwise
            create content which is posted to the App. Please see our{' '}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: 'underline',
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() =>
                Linking.openURL('https://onepali.app/terms-of-use')
              }
            >
              {' '}
              Terms of Service{' '}
            </CustomText>{' '}
            for full details about Community Guidelines and User-Generated
            Content. Further, please understand that any comment you may make is
            being made in a public forum without further expectation of privacy.
          </Text>

          <Title>4. Sensitive Information</Title>
          <Text>
            MECA does not use or disclose any sensitive information on you
            except to perform services reasonably expected by you, for fraud
            detection purposes, and to detect security incidents. For example,
            our Service Providers use payment information when you are making a
            donation to us. However, please be aware that, as stated above, our
            App vendor OnePali processes your Personal Information as a
            controller of that data, not our processor. Please refer to their
            Privacy Policy for their practices regarding sensitive information.
          </Text>
          <Text>
            Sensitive information is defined by GDPR as Personal Information
            that reveals any of the following: (1) personal data revealing
            racial or ethnic origin, (2) political opinions, religious or
            philosophical beliefs; (3) trade-union membership; (4) genetic data,
            biometric data processed solely to identify a human being; (5)
            health-related data; or (6) data concerning a person’s sex life or
            sexual orientation. As a charitable organization focused on work
            that can be interpreted as political, your identity in association
            with your donation may be considered sensitive information under
            some privacy laws.
          </Text>

          <Title>5. If You Live Outside of the United States</Title>
          <Text>
            MECA's Services are hosted in the United States and are governed by
            United States law. If you are using the Services from outside the
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

          <Title>6. Data Retention and Security</Title>
          <Text>
            We will retain your Personal Information only for as long as is
            necessary for the purposes set out in this Privacy Policy. We will
            retain and use your Personal Information to the extent necessary to
            comply with our legal obligations (for example, if we are required
            to retain your data to comply with applicable laws), resolve
            disputes, and enforce our legal agreements and policies.
          </Text>
          <Text>
            If you leave a comment, the comment and its metadata are retained
            indefinitely. This is so we can recognize and approve any follow-up
            comments automatically instead of holding them in a moderation
            queue.
          </Text>
          <Text>
            For users that register on our Services, we also store the personal
            information they provide in their user profile. All users have some
            options to update and remove their personal information in their
            user profile on their own at any time (except they cannot change
            their username). Service administrators can also see and edit that
            information.
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

          <Title>7. MECA Cookies Policy</Title>
          <Text>
            Like most websites, MECA uses cookies for a variety of purposes.
            This Cookies Policy will explain what cookies are, what we use them
            for, and how you can opt out of using cookies through your browser.
          </Text>
          <Text>
            A cookie is a small piece of data sent from a website (like{' '}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: 'underline',
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() => Linking.openURL('https://www.mecaforpeace.org/')}
            >
              https://www.mecaforpeace.org/
            </CustomText>
            {''}) and stored on your computer by your web browser while you are
            browsing. Cookies are how websites ‘remember’ information about you
            in order to properly respond when you access website features.
            Examples include remembering which pages you visited in the past and
            authenticating whether you can access certain secure information.
            Some websites also use cookies for gathering marketing data or other
            marketing purposes.
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
            We also use Analytics Cookies for analytics purposes such as via
            Google Analytics. Analytics Cookies are used internally, to help
            Website operators understand what their users are doing, in order to
            further customize and develop the Website in the future. They are
            used to show patterns of access by many users on a site.
          </Text>
          <Text>
            Our cookies do not store individual information about a user.
            Turning off cookies in your browser settings may impact your use of
            the site.
          </Text>

          <Title>8. Links to Other Sites</Title>
          <Text>
            Our Service may contain links to other sites. If you click on such a
            link, you will be directed to that site. Note that these external
            sites are not operated by us. Therefore, we strongly advise you to
            review the Privacy Policy of these websites. We have no control over
            and assume no responsibility for the content, privacy policies, or
            practices of any external sites or services.
          </Text>
          <Text>
            Once again, the sites those links can take you to have their own
            separate privacy policies. Although we seek to protect the integrity
            of our site, we are not liable for the content and activities of
            those sites. Your visits and access to such websites are at your own
            risk. Please note that those other sites may send their own cookies
            to users, collect data, or solicit personal information.
          </Text>

          <Title>9. Changes to This Privacy Policy</Title>
          <Text>
            We may update our Privacy Policy from time to time. Thus, we advise
            you to review this page periodically for any changes. We will notify
            you of any changes by posting the new Privacy Policy on this page or
            as otherwise required by applicable laws and regulations. These
            changes are effective immediately, after they are posted on this
            page. page.
          </Text>

          <Title>10. Children’s Privacy and Information of Children</Title>
          <Text>
            As a public charity, the requirements of the Children’s Online
            Privacy Protection Act generally do not apply to MECA. However, MECA
            takes the privacy of children extremely seriously and, where
            possible, endeavors to ensure that additional protections for
            children’s data are extended in line with common standards. If
            collected in the course of performing our charitable mission, this
            information is processed under a lawful basis and treated with a
            high degree of confidentiality and care, with a focus on protecting
            the children in question.
          </Text>
          <Text>
            However, aside from the above, MECA does not knowingly collect the
            personal information of individuals under 18 years of age for the
            general use portions of our Services (e.g. the Website, our Apps,
            our fundraising activities, and the like). For those Services, if we
            discover that a child under 18 has provided us with personal
            information, we immediately delete this from our general purpose
            MECA servers. If you are a parent or guardian and you are aware that
            your child has provided us with Personal Information or is using our
            Services without your supervision or consent, please contact us so
            that we can take the necessary actions.
          </Text>

          <Title>11. EU/EEA/UK Privacy Rights</Title>
          <Text>
            Additionally, if you are located in the European Union (“EU”) or
            United Kingdom (“UK”), you have the following rights under the
            General Data Protection Regulation (GDPR) and its UK counterpart
            (UK-GDPR):
          </Text>
          <BulletText title='The right to access.'>
            You have the right to request that MECA correct any information you
            believe is inaccurate, and/or to complete information you believe is
            incomplete.
          </BulletText>
          <BulletText title='The right to rectification.'>
            You have the right to request that MECA correct any information you
            believe is inaccurate, and/or to complete information you believe is
            incomplete.
          </BulletText>
          <BulletText title='The right to erasure.'>
            You have the right to request that MECA erase your Personal
            Information, unless certain conditions or exemptions apply.
          </BulletText>
          <BulletText title='The right to restrict processing.'>
            You have the right to request that MECA restrict the processing of
            your Personal Information, unless certain conditions or exemptions
            apply.
          </BulletText>
          <BulletText title='The right to object to processing.'>
            You have the right to object to MECA's processing of your Personal
            Information, unless certain conditions or exemptions apply.
          </BulletText>
          <BulletText title='The right to data portability.'>
            You have the right to request that MECA transfer the data that we
            have collected to another organization, or directly to you, unless
            certain conditions or exemptions apply.
          </BulletText>
          <Text>
            If you make a request, we have one month to respond to you. If you
            would like to exercise any of these rights, or have any questions,
            please contact us using the form below.
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
            MECA or a third party allow it.
          </Text>
          <Text>
            The vast majority of the processing done by MECA is done for the
            purpose of providing the Services, by the consent of users, and/or
            to fulfill legal obligations. Our App vendor OnePali is also a
            controller of Personal Information submitted through the Apps.
            Please see their Privacy Policy for their legal basis and practices.
          </Text>
          <Text>
            You have the right to complain to your local data protection
            authority if you are unhappy with our privacy practices.
          </Text>

          <Title>12. Contact Us</Title>
          <Text>
            The information provided below will be used exclusively for the
            purpose of processing your request under this Privacy Policy,
            including to confirm your identity. This information will not be
            used or maintained for any other purpose.
          </Text>
          <Paragraph>
            The Middle East Children’s Alliance. You can reach us by telephone
            at 510-548-0542 or by using this contact form:{' '}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: 'underline',
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() =>
                Linking.openURL('https://www.mecaforpeace.org/contact-us/')
              }
            >
              https://www.mecaforpeace.org/contact-us
            </CustomText>
            .
          </Paragraph>

          <View style={{ height: verticalScale(30) }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default MecaPrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  header: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(15),
  },
  logo: {
    width: horizontalScale(80),
    height: verticalScale(70),
    resizeMode: 'contain',
  },
  scrollContent: {},
});
