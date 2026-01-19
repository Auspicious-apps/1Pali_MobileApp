import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { FC, useCallback, useRef } from 'react';
import {
  Animated,
  FlatList,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ICONS from '../assets/Icons';
import CustomIcon from './CustomIcon';
import COLORS from '../utils/Colors';
import { CustomText } from './CustomText';
import { horizontalScale, isAndroid, verticalScale } from '../utils/Metrics';

type Tab = {
  name: string;
  icon: any;
  activIcon: any;
  route: string;
};
const tabs: Tab[] = [
  {
    name: 'Home',
    icon: ICONS.homeIcon,
    activIcon: ICONS.homeActive,
    route: 'home',
  },
  {
    name: 'Updates',
    icon: ICONS.heart,
    activIcon: ICONS.heartActive,
    route: 'updates',
  },
  {
    name: 'Art',
    icon: ICONS.artIcon,
    activIcon: ICONS.ArtActive,
    route: 'art',
  },
  {
    name: 'Account',
    icon: ICONS.accountIcon,
    activIcon: ICONS.AccountActive,
    route: 'account',
  },
];
const BottomTabBar: FC<BottomTabBarProps> = props => {
  const { state, navigation} = props;
  const currentRoute = state.routes[state.index].name;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const homeRoute = state.routes.find(r => r.name === 'home');
  const currentNumber = (homeRoute?.params as any)?.number as string | undefined;
  const handleTabPress = useCallback(
    (tab: Tab) => {
      if (currentRoute !== tab.route) {
        if (currentNumber) {
          navigation.navigate(tab.route, { number: currentNumber });
        } else {
          navigation.navigate(tab.route);
        }
      }
    },
    [navigation, currentRoute, currentNumber],
  );
  const renderTab = useCallback(
    ({ item, index }: { item: Tab; index: number }) => {
      const isActive = currentRoute === item.route;
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
            fontWeight={isActive ? '500' : '400'}
            fontFamily="GabaritoRegular"
            color={isActive ? 'rgba(0, 0, 0, 1)' : 'rgba(165, 169, 190, 1)'}
          >
            {item.name}
          </CustomText>
        </TouchableOpacity>
      );
    },
    [handleTabPress, currentRoute, scaleValue],
  );
  return (
    <View
      style={styles.mainContainer}
    >
      <View style={styles.container}>
        <View style={styles.tabWrapper}>
          <FlatList
            data={tabs}
            renderItem={renderTab}
            keyExtractor={item => item.route}
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
    shadowColor: '#000',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'center',
    zIndex: 99,
    gap: verticalScale(5),
  },
  middleButton: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 30,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001, // Ensure it’s above the tab bar
    boxShadow: '0px 4px 12px 0px #FF003B80',
  },
});
