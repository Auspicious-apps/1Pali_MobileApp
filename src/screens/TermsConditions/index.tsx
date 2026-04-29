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
import { TermsConditionsScreenProps } from "../../typings/routes";
import {
  horizontalScale,
  responsiveFontSize,
  verticalScale,
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
const AlphaText = ({ label, children }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: verticalScale(2),
    }}
  >
    <CustomText
      fontFamily="SourceSansRegular"
      fontSize={15}
      color={COLORS.appText}
      style={{ lineHeight: 22 }}
    >
      {label}.
    </CustomText>
    <CustomText
      fontFamily="SourceSansRegular"
      fontSize={15}
      color={COLORS.appText}
      style={{ lineHeight: 22 }}
    >
      {children}
    </CustomText>
  </View>
);
const SourceText = ({ children }: any) => (
  <CustomText
    fontFamily="SourceSansRegular"
    fontSize={16}
    color={COLORS.darkText}
    style={{ marginTop: verticalScale(8), lineHeight: 22 }}
  >
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
const AlphabeticalText = ({ label, title, children }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "baseline",
      marginTop: verticalScale(6),
      paddingRight: horizontalScale(10),
    }}
  >
    {/* Alphabet Label */}
    <CustomText fontFamily="GabaritoRegular" color={COLORS.darkText}>
      {label}.{" "}
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
const TermsConditions: FC<TermsConditionsScreenProps> = ({ navigation }) => {
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
          <CustomIcon
            Icon={ICONS.backArrow}
            height={verticalScale(26)}
            width={verticalScale(26)}
          />
        </TouchableOpacity>

        {/* SCROLL CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
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
            style={{ textAlign: "center", marginVertical: verticalScale(24) }}
          >
            Terms of Use
          </CustomText>
          <Text>
            Thank you for choosing to use the OnePali App! We value and
            appreciate your commitment to supporting our mission to protect the
            rights and improve the lives of children in the Middle East through
            aid, empowerment and education. The OnePali App is designed to
            facilitate your donations to the causes of the Middle East
            Children’s Alliance (“MECA”), a nonprofit humanitarian aid
            organization. The OnePali App is a platform owned by OnePali LLC, a
            wholly owned subsidiary of PaliRoots, LLC. The OnePali App is
            operated jointly by both OnePali, LLC and MECA. The OnePali App
            platform is irrevocably licensed to MECA by OnePali and all
            donations you make will go directly to MECA. For complete details
            regarding donations and contributions to operating costs please see
            below. However, you should be aware that all interactions with the
            OnePali App are made with both MECA and OnePali, LLC. MECA is not
            owned in any way by OnePali, LLC or PaliRoots, LLC. OnePali, LLC and
            PaliRoots LLC are not owned in any way by MECA. All terms below are
            applicable to your relationship with both MECA and OnePali, LLC
            (collectively “Operators, “we,” “us,” or “our.”
          </Text>
          <Text>
            Any and all use of the OnePali App (the “Service” or "Services",
            further defined in Section 1 below) owned or operated by Operators
            is subject to the rules of our Terms of Use contained herein
            ("Terms" or “Agreement”).
          </Text>
          <BulletText title="The following Terms represent a binding contract.">
            Make sure to carefully review them before using the Services
            provided by us. Your access to our Services is governed by these
            Terms. This is a binding agreement. By using the Services, you agree
            to abide by these Terms of Use, as they may be amended by us from
            time to time in our sole discretion and any posted guidelines or
            rules applicable to the Services . If you are a lawyer, financial
            advisor, or any other party accessing the Services on behalf of a
            user or other entity, you agree you have the authority to agree to
            these Terms on the behalf of that user or other entity.
          </BulletText>
          <Text>
            In addition, when you use any current or future version of this App
            or any other Service, you also will be subject to the terms and
            conditions of this Agreement, as well as any additional terms of
            that Service. Please print a copy of this Agreement for your
            records.
          </Text>
          <SourceText>
            PLEASE REVIEW THE ARBITRATION AGREEMENT SET FORTH BELOW IN SECTION
            16 CAREFULLY. THIS ARBITRATION AGREEMENT WILL REQUIRE YOU TO RESOLVE
            DISPUTES WITH THE OPERATORS ON AN INDIVIDUAL BASIS THROUGH FINAL AND
            BINDING ARBITRATION. BY ENTERING THIS AGREEMENT, YOU EXPRESSLY
            ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND ALL OF THE TERMS OF
            THIS AGREEMENT AND HAVE TAKEN TIME TO CONSIDER THE CONSEQUENCES OF
            THIS IMPORTANT DECISION.
          </SourceText>
          <Title>1. Definitions</Title>
          <AlphabeticalText label="A" title="Services.">
            The Operators’ services consist of the OnePali App.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="Users.">
            Anybody who uses our Services is considered a User for purposes of
            the Services.
          </AlphabeticalText>
          <AlphabeticalText label="C" title="Our Content.">
            All information and data not created by Users, including but not
            limited to visual and/or audio content, written posts and comments,
            software, or scripts generated, provided or otherwise made
            accessible on or through the Services.
          </AlphabeticalText>
          <AlphabeticalText label="D" title="User Content.">
            Information and data generated by Users, like comments.
          </AlphabeticalText>
          <AlphabeticalText label="E" title="Content.">
            Our Content and User Content referred to collectively.
          </AlphabeticalText>
          <Title>2. Eligibility</Title>
          <AlphabeticalText label="A" title="Age Requirement.">
            You agree that by using the Service you represent that you are at
            least 18 years old and that you are legally able to enter into this
            agreement. If you are under 18 or otherwise legally unable to enter
            into this agreement, you may not use the Services. We only solicit
            donations from adults, ages 18 years and older, who can donate in
            compliance with these Terms.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="Eligibility Subject to Change.">
            We may change these eligibility criteria at any time. We may also
            refuse to offer the Services to anyone for any or no reason.
          </AlphabeticalText>
          <AlphabeticalText label="C" title="Compliance with Local Laws.">
            It is your responsibility to ensure that your use of our Services
            under these Terms complies with all applicable laws, rules and
            regulations (collectively “Laws”). If at any time your use of all or
            any part of the Services conflicts with any Laws, your right to use
            the Services is revoked.
          </AlphabeticalText>
          <Title>3. Registering an Account and Account Responsibilities</Title>
          <AlphabeticalText label="A" title="Accounts.">
            We provide resources and include assets which are freely available
            to the public as well as those which require you to sign up for
            Services by registering for an account (“Account”). When you are
            required to open an account to use or access a Service, you must
            complete the registration process by providing the complete and
            accurate information requested on the registration screen. You will
            also be asked to provide information, depending on how you choose to
            sign up. This can include signing in using a Google or Apple
            account, or making a OnePali App account with an email address. You
            are responsible for keeping the email address and other information
            associated with your Account accurate and up to date.
          </AlphabeticalText>
          <AlphabeticalText label="D" title="Improper Use of Accounts.">
            You agree not to (1) intentionally impersonate another person by
            using their name and/or email address or (2) use a name and/or email
            address for which you do not have the proper authorization. If you
            make an account on behalf of another person, you must first have
            proper authorization from that person. You also agree to comply with
            the Permissible Use Policies set forth in these Terms. You are
            responsible for all activity and Content on your account, regardless
            of whether you performed or authorized the activity or not.
          </AlphabeticalText>
          <AlphabeticalText label="E" title="Securing Passwords.">
            You are entirely responsible for maintaining the confidentiality of
            your password. Never publish, distribute or post your Account login
            information. You are responsible for any activity that occurs on
            your Account.
          </AlphabeticalText>
          <AlphabeticalText
            label="F"
            title="Multiple Accounts, Terminated or Suspended Accounts."
          >
            If you previously had an account with us or currently have an
            account with us, you confirm that your old account was not
            terminated or suspended by us because you violated any of our terms
            or policies.
          </AlphabeticalText>
          <AlphabeticalText label="G" title="Decisions Regarding Account Use.">
            You are responsible for any decision to use the Services, either by
            yourself or with another User, so long as you share ownership of or
            have authorization to use the data contained in your Account.
          </AlphabeticalText>
          <AlphabeticalText label="H" title="Other People's Accounts.">
            You may not use another person’s Account or registration information
            for the Services without permission from the owner of that Account.
          </AlphabeticalText>
          <AlphabeticalText
            label="I"
            title="Notifying The Operators of Security Breach."
          >
            You agree to notify us immediately on any unauthorized use of your
            account, username, or password, other security breach, or change in
            your eligibility to use the Services. We shall not be liable for any
            loss that you incur as a result of someone else using your password,
            either with or without your knowledge. You may be held liable for
            any losses incurred by the Operators, our affiliates, officers,
            directors, employees, consultants, agents, and representatives due
            to someone else’s use of your account or password.
          </AlphabeticalText>
          <AlphabeticalText label="J" title="Deleting Your Account.">
            In the current version of the App, you may delete your Account by
            contacting us. However, some or all of the information related to
            the account may still exist. Some of these Terms of Use will still
            apply after deleting your account and/or canceling your relationship
            with the Operators. For more information see the Cancellation and
            Termination section below.
          </AlphabeticalText>
          <Title>4. Changes to Your Information</Title>
          <AlphabeticalText
            label="A"
            title="Agreement to Update Contact Information."
          >
            You agree to keep your profile information up to date, including but
            not limited to, your name, email address and billing information. We
            are not responsible for any Services issues arising from your
            failure to keep your account information current, such as payment
            processing errors or fees.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="Updating Your Account Details.">
            You may change your account details using your Account. You are
            responsible for making changes to ensure any information provided to
            The Operators is up to date and accurate.
          </AlphabeticalText>
          <Title>5. Your Information</Title>
          <Text>
            The Operators respect your privacy and your personal information.
            You may review our respective Privacy Policies{" "}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: "underline",
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() => {
                Linking.openURL("https://onepali.app/meca-privacy-policy");
              }}
            >
              MECA’s Privacy Policy
            </CustomText>{" "}
            and{" "}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: "underline",
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() => {
                Linking.openURL("https://onepali.app/onepali-privacy-policy");
              }}
            >
              OnePali LLC’s Privacy Policy
            </CustomText>{" "}
            which are incorporated herein by reference. We comply with all
            applicable privacy law requirements. By using the Services, you
            agree you have read and understand our Privacy Policies.
          </Text>
          <Title>
            6. The Proprietary Rights of The Operators and User Content
          </Title>
          <AlphabeticalText label="A" title="Proprietary Content.">
            Our Content is either the property of the Operators or our suppliers
            or licensors. We also maintain ownership of any and all anonymized
            data relating to any use of the Services and can use it for any
            legal purpose. The Content is protected by copyrights, patents,
            trademarks, service marks, trade secrets, and/or other rights and
            Laws. You agree to maintain all copyright notices, information and
            restrictions contained in any Content that you access through the
            Services.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="User Content.">
            Users grant the Operators a worldwide, non-exclusive, non-revocable,
            perpetual, royalty-free, payment-free, freely-transferable, freely
            sublicensable license to reproduce, publish, or otherwise use and
            authorize others to use the User Content in any manner the Operators
            wish. We do not grant other Users any rights in relation to User
            Content not already belonging to them. Any such rights may only be
            granted to you by the owner(s) of such User Content.
          </AlphabeticalText>
          <AlphabeticalText
            label="C"
            title="Licensed Exclusively for Use of Services."
          >
            While you follow these Terms, we grant you a worldwide, revocable,
            non-exclusive, non-transferable and non-sublicensable license to use
            (i.e., to download and display on your local device) Content for the
            sole purposes of using the Services. This license does not include
            any resale or commercial use of the Services, App or its contents;
            any collection and use of any product listings, descriptions, or
            prices; any derivative use of this App or its contents; any
            downloading or copying of account information for the benefit of
            another merchant; or any use of data mining, robots, spiders or
            similar data gathering and extraction tools.
          </AlphabeticalText>
          <AlphabeticalText
            label="D"
            title="Prior Written Permission Required."
          >
            You agree not to use, reproduce, modify, distribute or store any
            Content for purposes other than using our Services without our prior
            written permission.
          </AlphabeticalText>
          <AlphabeticalText label="E" title="No Unauthorized Use of Content.">
            You agree not to sell, license, rent, or otherwise use or exploit
            any Content, including but not limited to art assets or User
            Content, for commercial use or in any way that violates our rights
            or any third party right. The Operators neither grant, nor imply,
            nor give consent in any way to make unauthorized use of any
            intellectual property or other property of the Operators, our
            suppliers, or our licensors. You may not frame or use framing
            techniques to enclose any trademark, logo, or other proprietary
            information (including images, text, page layout, or form) of the
            Operators or our affiliates without express written consent. You may
            not use meta tags or any other hidden text using the Operators’ name
            or trademarks without the express written consent of the Operators.
            You may not make any part of the Services available as part of
            another service by "deep linking" or otherwise, or create any links
            to this website, and, in particular, you may not use the Operators’
            logos or any other proprietary graphic or trademark as part of any
            "hot" link or hyperlink to the Services, without the express prior
            written permission of the Operators. Any unauthorized use terminates
            the permission or license granted by the Operators.
          </AlphabeticalText>
          <AlphabeticalText
            label="F"
            title="Moderating, Removing and Modifying Content."
          >
            We may moderate or review any Content to verify compliance with
            these Terms and any applicable Law. However, we are not obligated to
            moderate or review any content. We also retain the right to (1)
            remove, edit or modify any Content in our sole discretion at any
            time, without notice to you and for any reason (for instance, if we
            think you may have violated these Terms) or for no reason at all or
            (2) to remove or block any Content from the Services. Whether or not
            we enforce these Terms and/or moderate, remove, or modify any User
            Content, the views expressed by Users on our Services do not
            represent the views of the Operators. We do not sponsor, endorse,
            authorize, or approve any User Content.
          </AlphabeticalText>
          <Title>7. Permissible Use Policies</Title>
          <AlphabeticalText label="A" title="Lawful and Compliant Use.">
            As a condition of using the Services, you agree to use the Services
            only for lawful purposes and to comply with these Terms and all
            applicable Laws. The Operators intend to cooperate fully with any
            law enforcement officials or agencies in the investigation of any
            violation of these Terms of Use or of any applicable Laws.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="Privacy of Other Users.">
            You also agree to respect the privacy and all personally
            identifiable information not displayed publicly (“Secure
            Information”) of other Users and other users of the Services. This
            includes, but is not limited to, uploading, downloading, displaying,
            posting, performing, transmitting, or otherwise making available
            through the Services any content which contains or refers to anyone
            else's personal data or private or confidential information (for
            example, telephone numbers, location information (including street
            addresses and GPS coordinates), names, identity documents, email
            addresses, log-in credentials for the Operators including passwords
            and security questions, financial information including bank account
            and credit card details, biometric data, and medical records)
            without that person's express written consent.
          </AlphabeticalText>
          <AlphabeticalText
            label="C"
            title="Compliance With Intellectual Property Laws."
          >
            When accessing the Services, you agree to obey the Law and to
            respect the intellectual property rights of others. Your use of the
            Services is at all times governed by and subject to Laws regarding
            copyright, trademark, patent, and trade secret ownership and use of
            intellectual property. You agree not to upload, download, display,
            perform, transmit, or otherwise distribute any Content in violation
            of any User or third party’s copyrights, trademarks, or other
            intellectual property or proprietary rights. You agree to abide by
            Laws regarding copyright, trademark, patent, and trade secret
            ownership and use of intellectual property, and you shall be solely
            responsible for any violations of any relevant Laws and for any
            infringements of third party rights caused by any Content you
            provide or transmit, or that is provided or transmitted using your
            Account.
          </AlphabeticalText>
          <AlphabeticalText label="D" title="Content Restrictions.">
            You agree not to, and shall not allow anyone else to distribute any
            Content through any of our Services by uploading, downloading,
            displaying, posting, performing, transmitting, and/or submitting
            said Content, or otherwise take any action to distribute said
            Content through any of our Services which:
          </AlphabeticalText>
          <AlphaText label="a">
            includes anyone else’s identification documents, sensitive financial
            information, or other Secure Information;
          </AlphaText>
          <AlphaText label="b">
            you know to be false, misleading, or inaccurate, including any
            misrepresentation regarding the Operators, yourself, and/or other
            Users;
          </AlphaText>
          <AlphaText label="c">
            intimidates, bullies, stalks, abuses or harasses any person or
            entity, including any of our representatives, employees, and Users;
          </AlphaText>
          <AlphaText label="d">
            is likely to upset, embarrass, inconvenience, or cause anxiety or
            serious offense to anyone else;
          </AlphaText>
          <AlphaText label="e">
            impersonates or falsely states or suggests any affiliation,
            endorsement, sponsorship between you and any person or entity,
            including any of our representatives, employees, and Users which
            have not factually approved, licensed, or endorsed the Content;
          </AlphaText>
          <AlphaText label="f">
            constitutes unauthorized or unsolicited advertising, or otherwise
            solicits funds or is a solicitation for goods or services, or is
            junk or bulk e-mail, regardless of whether similar communications
            are prohibited by local Law or not;
          </AlphaText>
          <AlphaText label="g">
            is unlawful, threatening, defamatory, abusive, harassing, libelous,
            deceptive, fraudulent, hateful, discriminatory, invasive of
            another's privacy, tortious, promotes violence, or is otherwise
            inappropriate as determined by the Operators in their sole
            discretion;
          </AlphaText>
          <AlphaText label="h">
            advocates or encourages conduct that could constitute a criminal
            offense, give rise to civil liability, or otherwise violate any
            applicable local, state, national, or foreign Law or regulation;
          </AlphaText>
          <AlphaText label="i">
            regardless of local legality, any sexually explicit content;
          </AlphaText>
          <AlphaText label="j">
            contains, promotes, advertises or refers to acts of violence or hate
            speech (being Content intended to vilify, humiliate, dehumanize,
            exclude, attack, threaten, or incite hatred, fear of, or violence
            against, a group or individual based on race, ethnicity, national
            origin, immigration status, caste, religion, sex, gender identity or
            expression, sexual orientation, age, disability, serious disease,
            veteran status, or any other protected characteristic);
          </AlphaText>
          <AlphaText label="k">
            without the express written consent of the Operators, involves or
            promotes third party commercial activities or sales, including but
            not limited to: contests, sweepstakes and other sales promotions,
            product placements, advertising, or job posting or employment ads;
          </AlphaText>
          <AlphaText label="l">
            in a manner that is otherwise determined by Operators, in their sole
            discretion, to be inconsistent with the community the Operators wish
            to foster in the Services; or
          </AlphaText>
          <AlphaText label="m">
            use other media or methods (for example the use of codewords or
            signals) to communicate anything which violates this Policy.
          </AlphaText>
          <AlphabeticalText
            label="E"
            title="Restrictions on Use of The Operators' Services."
          >
            You agree to only use any of our Services for your own personal use
            and not to sell, rent, transfer, or share your account or any
            Content obtained from your use of our Services to or with anyone
            else.
          </AlphabeticalText>
          <AlphabeticalText
            label="F"
            title="Violating The Operators's Security."
          >
            You are prohibited from violating or attempting to violate any
            security features of the Services, including, without limitation,
          </AlphabeticalText>
          <AlphaText label="a">
            accessing content or data not intended for you, or logging onto a
            server or account that you are not authorized to access;
          </AlphaText>
          <AlphaText label="b">
            attempting to probe, scan, or test the vulnerability of the
            Services, the App, or any associated system or network, or to breach
            security or authentication measures without proper authorization;
          </AlphaText>
          <AlphaText label="c">
            interfering or attempting to interfere with service to any User,
            user, host, or network, including, without limitation, by means of
            submitting a virus to the Services, overloading, “flooding,”
            “spamming,” “mail bombing,” or “crashing;”
          </AlphaText>
          <AlphaText label="d">
            using the Services to send unsolicited email, including, without
            limitation, promotions, or advertisements for products or services;
          </AlphaText>
          <AlphaText label="e">
            forging any TCP/IP packet header or any part of the header
            information in any e-mail or in any posting using the Services;
          </AlphaText>
          <AlphaText label="f">
            attempting to modify, reverse-engineer, decompile, disassemble, or
            otherwise reduce or attempt to reduce to a human-perceivable form
            any of the source code used by us in providing the Services;
          </AlphaText>
          <AlphaText label="g">
            using any automated program, tool or process to access our Services,
            including without limitation “web crawlers,” “robots,” “bots,”
            “spiders,” and automated scripts for any reason, including to
            “extract” or “scrape” Content; or
          </AlphaText>
          <AlphaText label="h">
            acting in contravention to any Laws regarding the violation of
            security of computer systems.
          </AlphaText>
          <AlphaText label="i">
            Any violation of system or network security may subject you to civil
            and/or criminal liability.
          </AlphaText>
          <Title>8. Your Safety</Title>
          <Text>
            The Operators seek to foster a community of respect and safety
            amongst its Users. However, you are ultimately responsible for
            ensuring your safety in your interaction with other Users. You agree
            to use caution in all interactions with other Users. You understand
            you aren’t required to follow any instructions, suggestions,
            reviews, or even comments, by another User. If you do so anyway, you
            do so according to your own best judgment and wholly at your own
            risk.
          </Text>
          <Text>
            You also acknowledge and agree that the Operators do not control and
            are not responsible for what Users or third parties do with your
            User Content after it is uploaded, published, or otherwise displayed
            on the Services. Once content gets on the internet, it can be very
            hard to remove. While you can delete your account, you acknowledge
            this will not independently prevent the use or spread of any User
            Content uploaded, published, or otherwise displayed on the Services.
            In other words, if you post a comment (or anything on the internet),
            you should be prepared, however unlikely, for it to ‘go viral.’
          </Text>
          <Title>9. You Consent to Receive Electronic Communications</Title>
          <AlphabeticalText label="A" title="Notifications.">
            The Operators may send you notifications, notices, or links, via
            your email, phone, text messages, messages to your account, or via
            your mobile device. By using the Services, you agree to receive
            these notifications. The types of notifications you may receive
            include changes to these Terms, invoices or records of payment,
            marketing communications, and any number of other communications
            related to our Services. Any notification is considered "in
            writing," regardless of whether it is in a paper format, a digital
            format, or some other format.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="Notification Procedures.">
            Anything sent to you is considered received immediately if sent to
            you by electronic notification without any indication of failed
            communication. An electronic notification is sent at the time it is
            directed by the Operators to your email address or other means of
            receiving electronic notifications. You agree these are reasonable
            procedures for sending and receiving electronic notifications.
          </AlphabeticalText>
          <AlphabeticalText label="C" title="Paper Notifications.">
            We reserve the right, but are under no obligation, to send
            notifications in a paper format.
          </AlphabeticalText>
          <AlphabeticalText
            label="D"
            title="Withdrawing Consent to Notifications."
          >
            If you have opened an Account but you wish to withdraw your consent
            to have notifications sent electronically, you must delete your
            account as described in this Agreement, and contact the relevant
            Operator through our contact information below. However, if you are
            in a jurisdiction covered by certain privacy laws, you may have
            other options. Please see{" "}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: "underline",
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() => {
                Linking.openURL("https://onepali.app/meca-privacy-policy");
              }}
            >
              MECA’s Privacy Policy
            </CustomText>{" "}
            and{" "}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: "underline",
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() => {
                Linking.openURL("https://onepali.app/onepali-privacy-policy");
              }}
            >
              OnePali LLC’s Privacy Policy
            </CustomText>{" "}
            for more details.
          </AlphabeticalText>
          <Title>10. Links to Third Party Sites</Title>
          <AlphabeticalText label="A" title="Links to Outside Sites.">
            You will find links to third party websites, services or resources,
            including co-branded websites operated by a third party, as you use
            our Services. The Operators have no control over, and no liability
            for any third-party websites or materials. The Operators work with a
            number of partners and affiliates whose websites may be linked with
            the Services. Additionally, Users may link to third-party websites
            in User Content. Because the Operators do not have control over the
            content and performance of these partner and affiliate sites, or
            sites linked to by Users, the Operators make no guarantees about the
            accuracy, currency, content, or quality of the information provided
            by such sites, and the Operators assumes no responsibility for
            unintended, objectionable, inaccurate, misleading, or unlawful
            content that may reside on those sites. Similarly, from time to time
            in connection with your use of the Services, you may have access to
            content items (including, but not limited to, websites) that are
            owned by third parties. You acknowledge and agree that the Operators
            make no guarantees about, and assumes no responsibility for, the
            accuracy, currency, content, or quality of this third-party content,
            and that, unless expressly provided otherwise, such as with another
            site’s own Terms of Use, these Terms of Use shall govern your use of
            any and all third-party content. TO THE MAXIMUM EXTENT PERMITTED BY
            APPLICABLE LAW, THE OPERATORS ARE NOT RESPONSIBLE OR LIABLE FOR ANY
            LOSS OR DAMAGES INCURRED AS A RESULT OF ANY DEALINGS WITH ANY
            THIRD-PARTY WEBSITE, APP, OR CO-BRANDED WEB SITE, ANY MERCHANT OR
            OPERATOR OF A THIRD-PARTY WEBSITE, APP OR CO-BRANDED WEB SITE, OR
            ANY OTHER PERSON WITH WHOM YOU ENGAGE IN ANY TRANSACTION.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="No Endorsement.">
            The inclusion of a link to any other website or app on any Service
            does not mean or imply that we endorse or are associated with that
            website or app or their operator.
          </AlphabeticalText>
          <Title>11. Payments and Billing, Donations</Title>
          <AlphabeticalText label="A" title="OnePali App Payments.">
            All payments between the Operators and Users are conducted in United
            States Dollars (“USD” or “$”).
          </AlphabeticalText>
          <AlphabeticalText label="B" title="Payment Methods.">
            When you add a payment card, bank account, or other means to make or
            receive payments to your account, you authorize us to supply your
            payment information to our service provider(s) for the purpose of
            processing your payments. We are not responsible for any additional
            charges by your bank or other third parties. You agree to keep your
            payment methods current and up to date and will notify us promptly
            if any payment method is canceled or rendered inactive. If you
            provide multiple forms of payment and one is rejected for any
            reason, the other forms of payment may be used to collect said
            payment.
          </AlphabeticalText>
          <AlphabeticalText label="C" title="Recurring Donation Payments.">
            The OnePali App involves users making recurring donations by
            default. The amount of the recurring donation is selected by the
            user. At our discretion, we may offer one-time donation options, now
            or in the future. After your initial signup, you will be charged for
            additional donations in the same amount as your initial donation
            once per month, on the same date as your initial donation, using the
            payment information you have provided. If you wish to cancel your
            recurring donation you may do so in the OnePali App by following the
            instructions regarding Cancellation in these terms or by contacting
            us using the contact information below.
          </AlphabeticalText>
          <AlphabeticalText label="D" title="Payment Failures.">
            If a payment fails for any reason, we may, at our sole discretion,
            deactivate the associated account. Please see the section regarding
            Cancellation in these terms.
          </AlphabeticalText>
          <AlphabeticalText label="E" title="Refunds.">
            The OnePali App generally does not offer refunds except where
            required by Law. Otherwise, any refunds granted shall be done so at
            the Operators’ sole discretion.
          </AlphabeticalText>
          <AlphabeticalText label="F" title="Chargebacks.">
            You understand and agree you will not make requests for a refund or
            a chargeback request from your payment card(s) without
            justification. A chargeback occurs where a User disputes a charge
            that appears on their bill with their bank or credit card provider,
            requesting the charges be reversed. You agree, whenever possible, to
            use our support systems to request a refund first. If you do not use
            our support systems to request a refund first, and we determine in
            our sole discretion any chargeback or refund request was made
            without justification and/or in bad faith, we may suspend or
            terminate your account. You acknowledge that transactions subject to
            a chargeback will be suspended until the chargeback is resolved and
            the Services are paid for. Further, where you initiate a chargeback,
            and do not use our support systems to request a refund first, we
            will be unable to assist with any request for a refund. The
            Operators reserve the right to contest chargebacks, but are not
            obligated to do so.
          </AlphabeticalText>
          <AlphabeticalText label="G" title="Payment Processor.">
            The Operators use the third-party services Stripe and Apple Pay to
            charge any costs or fees associated with your payments, plus
            applicable fees to the credit card or other payment method you have
            provided. Our third-party payment processor’s Terms of Use also
            apply, and we encourage you to read them on their App at
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: "underline",
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() => Linking.openURL("https://stripe.com/legal/ssa")}
            >
              {" "}
              https://stripe.com/legal/ssa{" "}
            </CustomText>
            and
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: "underline",
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
              onPress={() =>
                Linking.openURL(
                  "https://www.apple.com/legal/internet-services/apple-pay-wallet/us/",
                )
              }
            >
              {" "}
              https://www.apple.com/legal/internet-services/apple-pay-wallet/us/{" "}
            </CustomText>
            . The Operators reserve the right to change the third-party payment
            providers that we use and if we do so, we will notify you of the
            change and any additional information required from you and store
            applicable details on your Account. It is your responsibility to
            provide any such additional information in a timely manner and
            ensure that information is accurate. BY USING ANY OF THE OPERATORS’
            SERVICES YOU HEREBY AGREE TO BEING CHARGED FOR THOSE SERVICES, AND
            ANY FEES ASSOCIATED WITH ANY DONATIONS YOU MAKE, OR PRODUCTS OR
            SERVICES YOU PURCHASE, VIA THE PAYMENT METHOD YOU HAVE PROVIDED. YOU
            WILL BE CHARGED AUTOMATICALLY BY US WITHOUT FURTHER AUTHORIZATION
            FROM YOU. YOU WILL NOT RECEIVE ANY PRODUCTS OR SERVICES THAT ARE NOT
            PAID FOR.
          </AlphabeticalText>
          <AlphabeticalText label="H" title="Not Responsible for Lost Funds.">
            The Operators are not responsible for any unauthorized activities,
            payments, or withdrawal of funds resulting from any lost, stolen, or
            compromised User accounts, passwords, or email accounts.
          </AlphabeticalText>
          <AlphabeticalText label="I" title="Donations.">
            When you elect an amount to contribute (monthly or otherwise), that
            full amount will go to MECA. However, a portion of the contributed
            amounts is paid to OnePali, LLC for their services in operating and
            growing the OnePali App. Processing fees by the payment provider may
            be added on top of the amount you elect to contribute, and go to the
            payment provider. MECA is a 501(c)3 non-profit and the portion that
            goes to MECA in this way is a tax-deductible donation. The Operators
            will provide you with a receipt of tax-deductible donations as
            reasonably necessary, but at the Operators’ sole discretion except
            where required by Law. To obtain such a receipt, you may generate
            that receipt through the app.
          </AlphabeticalText>
          <AlphabeticalText
            label="J"
            title="OnePali Operation Costs Contributions."
          >
            A portion of the amount you select through the App goes to support
            the operations of OnePali.{" "}
            <CustomText
              fontFamily="GabaritoRegular"
              fontSize={14}
              color={COLORS.darkText}
            >
              This amount goes to supporting the operations of the OnePali App
              and related causes and goes to OnePali, LLC. OnePali, LLC is a
              for-profit entity and this amount is not tax-deductible as a
              donation.
            </CustomText>{" "}
            Supporting the operations includes funding the following activities
            of OnePali, LLC and its parent company, PaliRoots, LLC: (1) platform
            operations, maintenance, and infrastructure, (2) developing new
            features, (3) scholarships, grants, and community programs, (4) at
            their discretion, future initiatives, and (5) marketing and building
            awareness of the OnePali App. Such uses will be disclosed to Users
            as the OnePali App develops.
          </AlphabeticalText>
          <AlphabeticalText label="K" title="Payment Terms Subject to Change.">
            The OnePali App is currently in development, and these payment
            structures may change over time, at the Operators’ sole discretion.
            Changes will not be retroactive to previous subscribers. Payment
            structures will be disclosed in the OnePali App.
          </AlphabeticalText>
          <Title>12. Warranty Disclaimer</Title>
          <AlphabeticalText
            label="A"
            title="No Special Relationship or Fiduciary Duty."
          >
            The Operators have absolutely no special relationship or fiduciary
            duty to you. By using the Services, you release us from any and all
            liability for any release of your information pursuant to our terms.
            This includes, but is not limited to, releasing information,
            pursuant to our (1) receipt from you, or what appears to be you, of
            any instructions or permissions authorizing such release to any
            other person, including without limitation any party you have
            granted access to or (2) compliance with any Laws.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="Security Measures.">
            The Operators make use of security measures which are reasonable in
            light of the details of the Services provided. These include, but
            not are limited to, administrative, and technical safeguards
            encryption in transit and at rest, IP whitelisting etc.) to protect
            the security and confidentiality of your Account as well as your
            personal and financial information.
          </AlphabeticalText>
          <AlphabeticalText
            label="C"
            title="Network/Internet Access and Devices."
          >
            You are solely responsible for obtaining the data network access
            necessary to use the Services, whether via a mobile device or other
            means. Your mobile network's data and messaging rates and fees may
            apply if you access or use the Services from your device. You are
            responsible for acquiring and updating compatible hardware or
            devices necessary to access and use the Services, related software,
            and any updates thereto. The Operators do not guarantee that the
            Services, or any portion thereof, will function on any particular
            hardware or devices. In addition, the Services may be subject to
            malfunctions and delays inherent in the use of the Internet and
            electronic communications. These include, but are not limited to,
            loss of service due to lack of network access or non-compatible
            hardware.
          </AlphabeticalText>
          <AlphabeticalText
            label="D"
            title="Services Provided As Is - NO WARRANTY."
          >
            Even with strong security measures, there can be no absolute
            guarantee of security. THE OPERATORS HEREBY DISCLAIM ALL WARRANTIES.
            THE SERVICES IS PROVIDED BY THE OPERATORS ON AN "AS IS" AND "AS
            AVAILABLE" BASIS. TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE
            OPERATORS MAKE NO REPRESENTATIONS AND WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED, AS TO THE OPERATION OF THE SERVICES OR THE
            INFORMATION, CONTENT, THIRD-PARTY CONTENT, MATERIALS, PRODUCTS,
            SERVICES OR LINKED SERVICES PROVIDED ON OR THROUGH THIS SITE. FOR
            INSTANCE, WE DO NOT WARRANT THAT: (1) THAT THE INFORMATION PROVIDED
            THROUGH THE SERVICES WILL BE FREE FROM ERROR, OMISSION,
            INTERRUPTION, DEFECT, OR DELAY IN OPERATION, OR FROM TECHNICAL
            INACCURACIES OR TYPOGRAPHICAL ERRORS; (2) THAT THE SERVICES WILL BE
            AVAILABLE AT ANY PARTICULAR TIME OR LOCATION; (3) THAT DEFECTS OR
            ERRORS IN THE SERVICE WILL BE CORRECTED; (4) THAT THE CONTENT ON THE
            SERVICES IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS; OR (5) THE
            RESULTS OF USING THE SERVICES WILL MEET YOUR REQUIREMENTS OR
            EXPECTATIONS. ANY INFORMATION ON THE SERVICES IS SUBJECT TO CHANGE
            WITHOUT NOTICE, AND WE DISCLAIM ALL RESPONSIBILITY TO THE MAXIMUM
            EXTENT PERMITTED BY APPLICABLE LAW FOR THESE CHANGES. TO THE MAXIMUM
            EXTENT PERMITTED BY APPLICABLE LAW, YOU EXPRESSLY AGREE THAT YOUR
            USE OF THE SERVICES IS AT YOUR SOLE RISK. IF YOU ARE DISSATISFIED
            WITH THE SERVICES, YOUR SOLE REMEDY IS TO DISCONTINUE USING THE
            SERVICES. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE
            OPERATORS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING,
            BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY AND
            FITNESS FOR A PARTICULAR PURPOSE REGARDING ANY PRODUCTS OR SERVICES
            OBTAINED THROUGH THE SERVICES. FOR INSTANCE, THERE IS NO GUARANTEE
            OF PERMANENCE OR FITNESS FOR A PARTICULAR PURPOSE FOR SUPPORTER
            NUMBERS, BADGES, ARTWORK, OR ANY OTHER ACCOUNT CONTENT. THE SPECIFIC
            PROGRAMS YOUR DONATIONS SUPPORT MAY VARY, TO THE MAXIMUM EXTENT
            PERMITTED BY APPLICABLE LAW, AND ANY LISTS OF SPECIFIC PROGRAMS OR
            OTHER USES OF FUNDS ARE ILLUSTRATIVE OF NON-PROFIT USE, NOT BINDING.
          </AlphabeticalText>
          <Title>13. Indemnification</Title>
          <AlphabeticalText label="A" title="Indemnification.">
            You agree to indemnify the Operators for certain acts and omissions
            of yours. You agree to indemnify, defend, and hold harmless the
            Operators, their affiliates, officers, directors, employees,
            consultants, agents, and representatives from any and all third
            party claims, losses, liability, damages, and/or costs (including
            reasonable attorney fees and costs) arising from your access to or
            use of the Site, your violation of these Terms of Use, or your
            infringement, or infringement by any other user of your account, of
            any intellectual property or other right of any person or entity.
            The Operators will notify you promptly of any such claim, loss,
            liability, or demand, and will provide you with reasonable
            assistance, at your expense, in defending any such claim, loss,
            liability, damage, or cost.
          </AlphabeticalText>
          <AlphabeticalText
            label="B"
            title="Right to Assume Exclusive Defense."
          >
            Operators reserve the right for one or more Operators named as a
            Defendant to assume the exclusive defense and control of any matter
            involving that Operator otherwise subject to indemnification by you,
            in which event you agree to assist and cooperate with us in
            asserting any available defenses.
          </AlphabeticalText>
          <Title>14. Limitation of Liability</Title>
          <Text>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE
            OPERATORS, OUR AFFILIATES, NOR ANY OF OUR OR THEIR RESPECTIVE
            DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, SUPPLIERS OR CONTENT
            PROVIDERS, BE LIABLE TO YOU OR TO THOSE YOU PROVIDE ACCESS TO YOUR
            ACCOUNT, HEIRS, SUCCESSORS OR YOUR ESTATE FOR DAMAGES OF ANY KIND
            (INCLUDING, BUT NOT LIMITED TO, SPECIAL, INCIDENTAL, OR
            CONSEQUENTIAL DAMAGES, LOST PROFITS, OR LOST DATA, REGARDLESS OF THE
            FORESEEABILITY OF THOSE DAMAGES) ARISING OUT OF OR IN CONNECTION
            WITH YOUR ACCESS, USE, MISUSE, OR INABILITY TO USE THE SERVICES OR
            ANY LINKED SITES OR SERVICES IN ANY MANNER NOT EXPRESSLY PERMITTED
            HEREIN, YOUR DONATION TO US, YOUR PURCHASE OR USE OF ANY PRODUCTS OR
            SERVICES FROM US, OR IN CONNECTION WITH ANY FAILURE OF PERFORMANCE,
            ERROR, OMISSION, INTERRUPTION, DEFECT, DELAY IN OPERATION OR
            TRANSMISSION, COMPUTER VIRUS, OR LINE OR SYSTEM FAILURE, WHETHER IN
            AN ACTION UNDER CONTRACT, NEGLIGENCE, TORT, STRICT LIABILITY, BY
            YOUR RELIANCE ON ANY PRODUCT, MATERIALS OR SERVICE OBTAINED THROUGH
            US OR A THIRD-PARTY OR ANY OTHER THEORY, EVEN IF WE HAVE BEEN
            PREVIOUSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. YOU ARE
            SOLELY RESPONSIBLE FOR EVALUATING THE COMPLETENESS, ACCURACY OR
            USEFULNESS OF CONTENT AVAILABLE THROUGH THE SERVICES OR OBTAINED
            THROUGH A THIRD-PARTY SITE. PLEASE SEEK THE ADVICE OF PROFESSIONALS,
            AS APPROPRIATE, REGARDING THE EVALUATION OF ANY SPECIFIC CONTENT, OR
            ANY OF YOUR LEGAL OBLIGATIONS WHICH MIGHT ARISE IN CONNECTION TO THE
            SERVICES. THIS LIMITATION SHALL APPLY REGARDLESS OF THE FORM OF
            ACTION OR LEGAL THEORY FROM WHICH THE DAMAGES ARISE.
          </Text>
          <AlphabeticalText
            label="A"
            title="Specific Situations Where Liability Limited."
          >
            Below is an illustrative list of situations where our liability is
            limited. PLEASE REVIEW THIS LIST. WE ARE NOT LIABLE FOR ANY
            INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, COMPENSATORY,
            EXEMPLARY OR PUNITIVE DAMAGES ARISING FROM OR DIRECTLY OR INDIRECTLY
            RELATED TO, BUT NOT LIMITED TO:
          </AlphabeticalText>
          <AlphaText label="a">
            THE USE OR THE INABILITY TO USE THE SERVICES, CONTENT, MATERIALS AND
            FUNCTIONS PROVIDED BY THE OPERATORS,
          </AlphaText>
          <AlphaText label="b">
            UNAUTHORIZED ACCESS TO YOUR INFORMATION, DATA, TRANSMISSIONS,
            CONTENT OR OTHER INFORMATION,
          </AlphaText>
          <AlphaText label="c">
            LOSS, CORRUPTION OR ALTERATION OF YOUR INFORMATION, DATA,
            TRANSMISSIONS, CONTENT OR OTHER INFORMATION,
          </AlphaText>
          <AlphaText label="d">
            ANY BUGS, VIRUSES, TROJAN HORSES, OR SIMILAR SOFTWARE, REGARDLESS OF
            THE SOURCE OF ORIGINATION
          </AlphaText>
          <AlphaText label="e">
            STATEMENTS OR CONDUCT OF ANY THIRD PARTY ON OR USING OUR SERVICES,
          </AlphaText>
          <AlphaText label="f">
            THE OPERATORS’ ACTIONS OR OMISSIONS IN RELIANCE UPON YOUR ACCOUNT OR
            CREDIT CARD INFORMATION AND ANY RELATED CHANGES OR NOTICES,
          </AlphaText>
          <AlphaText label="g">
            YOUR FAILURE TO MAINTAIN CONFIDENTIALITY OF YOUR INFORMATION OR ANY
            PASSWORDS OR ACCESS RIGHTS TO YOUR ACCOUNT,
          </AlphaText>
          <AlphaText label="h">
            THE ACTS OR OMISSIONS OF ANY THIRD PARTY USING OR INTEGRATING THE
            SERVICES OR
          </AlphaText>
          <AlphaText label="i">
            ANY OTHER MATTER RELATING TO THE SERVICES, INCLUDING TANGIBLE AND
            INTANGIBLE LOSSES, EVEN IF THE OPERATORS OR OUR REPRESENTATIVE HAS
            BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </AlphaText>
          <AlphabeticalText label="B" title="Liability Limited in Amount.">
            IF ANY LIABILITY DOES EXIST UNDER LOCAL LAW, THE OPERATORS’
            LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM
            OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO (1) US$500.00 (FIVE
            HUNDRED UNITED STATES DOLLARS)
          </AlphabeticalText>
          <AlphabeticalText label="C" title="State Law.">
            CERTAIN STATES OR JURISDICTIONS DO NOT ALLOW LIMITATIONS ON IMPLIED
            WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, IN
            WHICH CASE SOME OR ALL OF THE ABOVE DISCLAIMERS, EXCLUSIONS, OR
            LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL
            RIGHTS.
          </AlphabeticalText>
          <Title>15. Remedies of Users</Title>
          <AlphabeticalText label="A" title="Remedy Available.">
            The sole and exclusive remedy for any failure or non-performance of
            any Service of the Operators, and/or anything supplied in connection
            with a Service, shall be for the Operators to use commercially
            reasonable efforts to effectuate an adjustment or repair of the
            applicable Service.
          </AlphabeticalText>
          <AlphabeticalText
            label="B"
            title="Time Limit on Actions Against The Operators."
          >
            BY USING THESE SERVICES, YOU AGREE THAT REGARDLESS OF ANY STATUTE OR
            LAW TO THE CONTRARY, ANY CLAIM OR CAUSE OF ACTION ARISING OUT OF OR
            RELATED TO (1) USE OF THE SITES OR SERVICES OR (2) THESE TERMS OF
            USE MUST BE FILED WITHIN ONE YEAR AFTER SUCH CLAIM OR CAUSE OF
            ACTION AROSE OR BE FOREVER BARRED.
          </AlphabeticalText>
          <Title>
            16. Arbitration, Applicable Law, Choice of Venue, Jurisdiction, and
            Fee-Shifting
          </Title>
          <AlphabeticalText
            label="A"
            title="Arbitration, Individual Arbitration and Acknowledgments."
          >
            Any controversy or claim arising under, out of, or in relation to
            these Terms or the use of the Operators’ Services, or any breach or
            asserted breach thereof, shall be settled by binding arbitration in
            Alameda, County, California, subject to the conditions and
            exclusions of this section. Where possible, the arbitration shall be
            conducted by remote proceedings. You hereby acknowledge and agree
            that you and the Operators are each waiving the right to a trial by
            jury or to participate as a plaintiff or class member in any
            purported class action or representative proceeding. Unless both you
            and the Operators otherwise agree in writing, any arbitration will
            be conducted in English in accordance with the expedited JAMS rules
            and procedures as modified by this section. Disputes will be
            arbitrated only on an individual basis and will not be consolidated
            with any other arbitrations or other proceedings that involve any
            claim or controversy of any other party. Unless otherwise agreed by
            the parties, the arbitration panel shall consist of one arbitrator
            chosen in accordance with the rules of JAMS. Any such arbitrator
            shall be knowledgeable in the subject area in which the dispute
            arises. The award of the arbitrator shall be final and binding on
            the parties hereto and may be enforced in any court of competent
            jurisdiction. The parties waive any right they may have to an appeal
            of the arbitrator’s decision and/or award. In no event shall the
            arbitrator award punitive or exemplary damages. The parties waive
            any right they may have to an appeal of the arbitrator’s decision
            and/or award. Each party retains the right to seek judicial
            assistance: (i) to compel arbitration, (ii) to obtain interim
            measures of protection prior to or pending arbitration, (iii) to
            seek injunctive relief in the courts of any jurisdiction as may be
            necessary and appropriate to protect the unauthorized disclosure of
            its proprietary or confidential information; (iv) for any claims of
            infringement or misappropriation of patent, copyright, trademark, or
            trade secrets; and (v) to enforce any decision of the arbitrator,
            including the final award.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="Applicable Law.">
            These Terms of Use shall be construed in accordance with and
            governed by the laws of the United States and the State of
            California, without reference to rules regarding conflicts of law.
            This Agreement will not be governed by the United Nations Convention
            on Contracts for the International Sale of Goods.
          </AlphabeticalText>
          <AlphabeticalText label="C" title="Exclusions.">
            You hereby acknowledge the following exclusions to these terms
            regarding arbitration. You and the Operators both retain the right
            to bring an individual action in small claims court. You and the
            Operators both retain the right to seek equitable relief in a court,
            chosen in compliance with these Terms, solely to prevent the actual
            or threatened infringement, misappropriation or violation of a
            party's intellectual property rights, including but not limited to
            copyrights, trademarks, trade secrets, and patents.
          </AlphabeticalText>
          <AlphabeticalText label="D" title="Admissibility.">
            A printed version of this Agreement and of any notice given in
            electronic form will be admissible in judicial or administrative
            proceedings based upon or relating to this Agreement to the same
            extent and subject to the same conditions as other business
            documents and records originally generated and maintained in printed
            form.
          </AlphabeticalText>
          <AlphabeticalText label="E" title="Jurisdiction and Choice of Venue.">
            You acknowledge that all claims or controversy shall be settled by
            arbitration according to this Section. However, you additionally
            hereby irrevocably consent to the exclusive jurisdiction of the
            state or federal courts located in the Northern District of
            California, in all disputes arising out of or related to the use of
            the Services, that, for any reason, are not arbitrated.
          </AlphabeticalText>
          <Title>17. Modifying the Terms and the Service</Title>
          <AlphabeticalText label="A" title="Modifying Terms.">
            The Operators reserve the right to - at any time and for any reason
            or without reason - revise these Terms of Use. It is your
            responsibility to review the Terms of Use for changes with some
            regularity. Your continued use of the Services following
            notification of any changes to these Terms constitutes acceptance of
            those changes.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="Modifying the Service.">
            The Operators reserve the right to - at any time and for any reason
            or without reason - change, suspend or discontinue the Services.
            Before we do this we will notify you by replacing these Terms on the
            Services and may additionally notify you by sending you a notice
            through email you provide to us through your Account. It is your
            responsibility to check these Terms periodically for changes, and to
            keep your email address current.
          </AlphabeticalText>
          <AlphabeticalText label="C" title="Limiting the Service.">
            The Operators reserve the right to - at any time and for any reason
            or without reason - impose limits on some Services or restrict your
            access to the Services without notice or liability.
          </AlphabeticalText>
          <AlphabeticalText
            label="D"
            title="If You Don't Agree to Terms Changes, You Must Terminate Use of the Services."
          >
            You agree that, by continuing to use or access the Services
            following notice of any revision, you shall abide by any such
            revision. If at any point, you disagree with a change to the Terms
            or Services on the part of the Operators, please cease use of the
            Services by deleting your Account. You may not continue to use the
            Services without agreeing to these Terms.
          </AlphabeticalText>
          <Title>18. Entire Agreement</Title>
          <Text>
            These Terms, and the terms of policies and agreements incorporated
            by reference (through names of documents and web links) are the
            whole and complete agreement between you and the Operators. No other
            agreements shall govern use of the Services. These Terms supersede
            any prior or conflicting agreements or policies.
          </Text>
          <Title>19. Headings Not Binding</Title>
          <Text>
            The headings to each section of these terms are not legally binding,
            nor do they have any effect on the proper interpretation of these
            Terms. They are exclusively to aid in ease of use. THEY SHOULD NOT
            BE READ IN LIEU OF READING THE FULL TERMS.
          </Text>
          <Title>20. Force Majeure</Title>
          <Text>
            Where the Operators fail to perform our obligations under these
            Terms, we are not liable where such failure results from any cause
            beyond our reasonable control. Such situations include but are not
            limited to: acts of god, global pandemics, or mechanical, electronic
            or communications failure or degradation.
          </Text>
          <Title>21. Waiver</Title>
          <AlphabeticalText
            label="A"
            title="Failure to Exercise a Right Not a Waiver."
          >
            Even if the Operators, or any of our employees, representatives, or
            other affiliates fail to exercise any right or provision of these
            Terms, this failure does not waive our right to later enforce any
            part of these Terms.
          </AlphabeticalText>
          <AlphabeticalText
            label="B"
            title="Waiver Does Not Imply Future Waiver."
          >
            No waiver of any breach of any provision of these Terms of Use shall
            constitute a waiver of any prior, concurrent, or subsequent breach
            of the same or any other provisions hereof.
          </AlphabeticalText>
          <AlphabeticalText label="C" title="Requirements of a Waiver.">
            In order for any waiver of compliance with these Terms to be
            effective, it must be made in writing and signed by an authorized
            representative of the waiving party.
          </AlphabeticalText>
          <Title>22. Severability</Title>
          <Text>
            If any provision of these Terms is found to be unenforceable or
            invalid, that provision will be limited or eliminated, in that
            jurisdiction, to the minimum extent necessary so that these Terms
            will otherwise remain in full force and effect and fully
            enforceable.
          </Text>
          <Title>23. Assignment</Title>
          <AlphabeticalText
            label="A"
            title="Assignability of Terms Rights by You."
          >
            These Terms are exclusive and personal to you. You may not assign,
            transfer or sublicense any of your rights or obligations under these
            Terms without the express, signed prior written consent of an
            authorized representative of the respective Operator(s).
          </AlphabeticalText>
          <AlphabeticalText label="B" title="The Operators Rights Assignable.">
            We may assign, transfer or delegate any of our rights and
            obligations under these Terms without consent.
          </AlphabeticalText>
          <Title>24. No Relationship</Title>
          <Text>
            No agency, partnership, joint venture or employment relationship is
            created as a result of these Terms and neither party has any
            authority of any kind to bind the other in any respect.
          </Text>
          <Title>
            25. Cancellation, Changing Payment Details, and Termination
          </Title>
          <AlphabeticalText label="A" title="Cancellation.">
            You may cancel your relationship with the Operators by (1) deleting
            your Account by contacting the Operators, and (2) ceasing use of the
            Services. At our discretion, future versions of the App may include
            self-service cancellation options.
          </AlphabeticalText>
          <AlphabeticalText label="B" title="Changing Payment Details.">
            You may update your payment details and donation and/or operating
            contribution amounts through Account in the App at any time. Any
            changes will take effect for the next recurring payment.
          </AlphabeticalText>
          <AlphabeticalText label="C" title="Termination of Use.">
            The Operators reserve the right to terminate your use of the Service
            and/or the App with or without cause, with or without notice to you,
            and without liability to you. To ensure that the Operators provide a
            high-quality experience for you and for other Users using the
            Services, you agree that the Operators or their representatives may,
            in accordance with our Terms, access your account and records on a
            case-by-case basis to investigate complaints or allegations of
            abuse, infringement of third party rights, or other unauthorized
            uses of the Services. The Operators do not intend to disclose the
            existence or occurrence of such an investigation unless required by
            law, but the Operators reserve the right to terminate your account
            or your access to the Services immediately, with or without cause,
            with or without notice to you, and without liability to you. Causes
            for termination include but are not limited to if we believe that
            you have violated any of the Terms of Use, furnished us with false
            or misleading information, interfered with use of the Services by
            others, or in response to failed payments.
          </AlphabeticalText>
          <AlphabeticalText label="D" title="Account Deactivation.">
            We may deactivate Accounts as an interim step before Account
            termination, at our discretion. The period of time an Account will
            remain deactivated is at our discretion, but typically up to 90
            days. For instance, when a recurring donation fails to process, we
            may deactivate your Account. Once an Account is deactivated, the
            supporter number associated with that account is released into the
            pool. If the issue is resolved before the deactivation period
            lapses, your Account may be reactivated, but a new supporter number
            will need to be selected, and there is no guarantee you will be able
            to secure your previous number. If the deactivation period lapses,
            the Account will be permanently deleted, along with all Account
            data.
          </AlphabeticalText>
          <AlphabeticalText
            label="E"
            title="Termination, Suspension, and Pending Payments."
          >
            Where your Account is terminated or suspended the Operators will let
            you know via electronic notification to the contact information
            provided to us through your Account. Where a User’s Account is
            terminated or suspended, all recurring payments (such as
            subscriptions) shall be terminated or suspended as well.
          </AlphabeticalText>
          <AlphabeticalText label="F" title="Content After Termination.">
            Once your Account is terminated, we may deal with Content in any
            manner consistent with these Terms and our Privacy Policy, such as
            by deleting it entirely, and you will not be entitled to access any
            Content. We are not obligated to keep any copies or backup of any
            Content. Typically, we will manually and completely remove all of
            your data from our systems, but this is at our sole discretion
            unless otherwise required by applicable law. This applies whether
            the account is terminated at your request, or by us.
          </AlphabeticalText>
          <AlphabeticalText label="G" title="Terms Surviving Cancellation.">
            There are many provisions within these Terms which by their nature
            should extend past your cancellation or our termination of Services.
            All such terms shall survive cancellation or termination. These
            terms include but are not limited to: (1) ownership provisions, (2)
            warranty disclaimers, (3) indemnity and (4) limitation of liability.
          </AlphabeticalText>
          <Title>26. Notices</Title>
          <AlphabeticalText label="A" title="In Writing.">
            Unless otherwise specified in another section of these Terms, all
            notices under these Terms will be in writing as defined in these
            Terms.
          </AlphabeticalText>
          <AlphabeticalText
            label="B"
            title="Notice Duly Given by The Operators."
          >
            Notice by us to you will be considered to have been duly given at
            the time when (1) transmitted by email with no indication of failed
            transmission; (2) received, if personally delivered or sent by
            certified or registered mail, return receipt requested; (3) the day
            after it is sent, if sent for next day delivery or recognized
            overnight delivery service; or (4) transmitted electronically
            through the Services to your Account, such as through a messaging or
            alert feature.
          </AlphabeticalText>
          <AlphabeticalText
            label="C"
            title="Notice Duly Given to The Operators."
          >
            Notice by you to us will be considered to have been duly given at
            the time when it is received, if personally delivered or sent by
            certified or registered mail, return receipt requested.
          </AlphabeticalText>
          <Title>27. ACKNOWLEDGEMENT</Title>
          <Text>
            BY USING THE SERVICE OR ACCESSING THE SITE, YOU ACKNOWLEDGE THAT YOU
            HAVE READ THESE TERMS OF USE AND AGREE TO BE BOUND BY THEM.
          </Text>
          <Title>28. Rights Reserved</Title>
          <Text>
            All rights not expressly granted herein are hereby reserved
          </Text>
          <Title>Contact Address</Title>
          <Text>You may contact us at the following address:</Text>
          <Text>
            Middle East Children’s Alliance
            {"\n"}1101 Eighth Street, Suite 100
            {"\n"}Berkeley, CA 94710 US
            {"\n"}Phone: (510) 548-0542
            {"\n"}Fax: (510) 548-0543
          </Text>
          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={15}
            color={COLORS.appText}
          >
            Email:{" "}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: "underline",
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
            >
              meca@mecaforpeace.org
            </CustomText>
          </CustomText>
          <Text>
            OnePali, LLC
            {"\n"}3562 Mount Acadia Blvd, San Diego, California 92111
          </Text>
          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={15}
            color={COLORS.appText}
          >
            Email:{" "}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: "underline",
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
            >
              support@onepali.app
            </CustomText>
          </CustomText>
          <Text>For OnePali App support</Text>
          <CustomText
            fontFamily="SourceSansRegular"
            fontSize={15}
            color={COLORS.appText}
          >
            Email:{" "}
            <CustomText
              style={{
                color: COLORS.textGrey,
                textDecorationLine: "underline",
                fontFamily: FONTS.SourceSansRegular,
                fontSize: responsiveFontSize(15),
              }}
            >
              support@onepali.app
            </CustomText>
          </CustomText>
          {/* Bottom spacing - can be adjusted or removed */}
          <View style={{ height: verticalScale(40) }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default TermsConditions;

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
