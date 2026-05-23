import React, { useRef } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PlayerScreen from '../screens/PlayerScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import PodcastsScreen from '../screens/PodcastsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import MoreScreen from '../screens/MoreScreen';

import MiniPlayer from '../components/MiniPlayer';
import { colors } from '../theme/colors';
import { useStation } from '../context/StationContext';

const Tab = createBottomTabNavigator();

const ICONS = {
  Live: 'radio',
  Schedule: 'calendar',
  Podcasts: 'mic',
  Favorites: 'heart',
  More: 'menu',
};

function Tabs({ tabRef }) {
  const { station } = useStation();
  const screens = [
    { name: 'Live', component: PlayerScreen },
    ...(station.enableSchedule ? [{ name: 'Schedule', component: ScheduleScreen }] : []),
    ...(station.enablePodcasts ? [{ name: 'Podcasts', component: PodcastsScreen }] : []),
    ...(station.enablePodcasts ? [{ name: 'Favorites', component: FavoritesScreen }] : []),
    { name: 'More', component: MoreScreen },
  ];

  return (
    <Tab.Navigator
      ref={tabRef}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgElevated,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      {screens.map(s => (
        <Tab.Screen key={s.name} name={s.name} component={s.component} />
      ))}
    </Tab.Navigator>
  );
}

export default function MainTabs() {
  const tabRef = useRef(null);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs tabRef={tabRef} />
      <MiniPlayer onPress={() => tabRef.current?.navigate('Live')} />
    </View>
  );
}
