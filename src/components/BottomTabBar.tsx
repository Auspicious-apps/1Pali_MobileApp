import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ICONS from "../assets/Icons";
import COLORS from "../utils/Colors";
import { horizontalScale, isAndroid, verticalScale } from "../utils/Metrics";
import CustomIcon from "./CustomIcon";
import { CustomText } from "./CustomText";
import { CommonActions } from "@react-navigation/native";

type Tab = {
  name: string;
  icon: any;
  activIcon: any;
  route: string;
};
const tabs: Tab[] = [
  {
    name: "Home",
    icon: ICONS.homeIcon,
    activIcon: ICONS.homeActive,
    route: "home",
  },
  {
    name: "Updates",
    icon: ICONS.heart,
    activIcon: ICONS.heartActive,
    route: "updates",
  },
  {
    name: "Art",
    icon: ICONS.artIcon,
    activIcon: ICONS.ArtActive,
    route: "art",
  },
  {
    name: "Account",
    icon: ICONS.accountIcon,
    activIcon: ICONS.AccountActive,
    route: "account",
  },
];
const BottomTabBar: FC<BottomTabBarProps> = (props) => {
  const { state, navigation } = props;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Map detail/inner routes to their parent tab for highlighting
  const routeToTab: Record<string, string> = {
    home: "home",
    updates: "updates",
    art: "art",
    account: "account",
    updateDetail: "updates",
    artDetail: "art",
    termsConditions: "account",
    privacyPolicy: "account",
    receipts: "account",
    badges: "account",
    manageDonation: "account",
  };

  const currentRoute = state.routes[state.index].name;
  const activeTab = routeToTab[currentRoute] || currentRoute;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const handleTabPress = useCallback(
    (tab: Tab) => {
      navigation.navigate(tab.route);
    },
    [navigation, currentRoute, activeTab],
  );

  const renderTab = useCallback(
    ({ item, index }: { item: Tab; index: number }) => {
      const isActive = activeTab === item.route;
      return (
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress(item)}
          activeOpacity={0.7}
        >
          <CustomIcon
            Icon={isActive ? item.activIcon : item.icon}
            height={24}
            width={24}
          />
          <CustomText
            fontSize={12}
            fontWeight={isActive ? "500" : "500"}
            fontFamily="GabaritoRegular"
            color={isActive ? "rgba(0, 0, 0, 1)" : "rgba(165, 169, 190, 1)"}
          >
            {item.name}
          </CustomText>
        </TouchableOpacity>
      );
    },
    [handleTabPress, activeTab, scaleValue],
  );
  return (
    <View
      style={[
        styles.mainContainer,
        keyboardVisible && {
          display: Platform.OS === "android" ? "none" : undefined,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.tabWrapper}>
          <FlatList
            data={tabs}
            renderItem={renderTab}
            keyExtractor={(item) => item.route}
            horizontal
            scrollEnabled={false}
            bounces={false}
            alwaysBounceHorizontal={false}
            overScrollMode="never"
            showsHorizontalScrollIndicator={false}
            style={[styles.tabBar, {}]}
            contentContainerStyle={styles.tabContent}
          />
        </View>
      </View>
    </View>
  );
};
export default BottomTabBar;
const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6,
  },
  container: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(15),
    borderTopLeftRadius: verticalScale(20),
    borderTopRightRadius: verticalScale(20),
  },
  tabWrapper: {
    flex: 1,
    marginHorizontal: horizontalScale(10),
  },
  tabBar: {
    paddingTop: verticalScale(5),
    paddingBottom: isAndroid ? verticalScale(0) : verticalScale(5),
  },
  tabContent: {
    flexGrow: 1,
    justifyContent: "space-around",
  },
  tab: {
    alignItems: "center",
    justifyContent: "flex-end",
    alignSelf: "center",
    zIndex: 99,
    gap: verticalScale(5),
    paddingHorizontal: horizontalScale(20),
  },
  middleButton: {
    position: "absolute",
    backgroundColor: COLORS.white,
    borderRadius: 30,
    height: 48,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001, // Ensure it’s above the tab bar
    boxShadow: "0px 4px 12px 0px #FF003B80",
  },
});
