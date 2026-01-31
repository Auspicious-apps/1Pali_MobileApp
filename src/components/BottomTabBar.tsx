import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { FC, useCallback, useRef } from "react";
import {
  Animated,
  FlatList,
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
    route: "updatesStack",
  },
  {
    name: "Art",
    icon: ICONS.artIcon,
    activIcon: ICONS.ArtActive,
    route: "artStack",
  },
  {
    name: "Account",
    icon: ICONS.accountIcon,
    activIcon: ICONS.AccountActive,
    route: "accountStack",
  },
];
const BottomTabBar: FC<BottomTabBarProps> = (props) => {
  const { state, navigation } = props;

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

  const handleTabPress = useCallback(
    (tab: Tab) => {
      const isActive = activeTab === tab.route;
      if (isActive) {
        // If we are already on this tab, reset its internal stack to the first screen
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: tab.route }],
          }),
        );
      } else {
        // If we are switching tabs, navigate normally
        navigation.navigate(tab.route);
      }
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
            height={20}
            width={20}
          />
          <CustomText
            fontSize={12}
            fontWeight={isActive ? "500" : "400"}
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
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <View style={styles.tabWrapper}>
          <FlatList
            data={tabs}
            renderItem={renderTab}
            keyExtractor={(item) => item.route}
            horizontal
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
