import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, Alert, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { createApi } from '../api/mediacp';
import { colors } from '../theme/colors';
import { isCurrentShow } from '../utils/time';
import ScheduleCard from '../components/ScheduleCard';
import SectionHeader from '../components/SectionHeader';
import { requestNotificationPermission, scheduleShowReminder } from '../utils/notifications';
import { storage } from '../utils/storage';
import { useStation } from '../context/StationContext';
import EmptyState from '../components/EmptyState';

export default function ScheduleScreen() {
  const { station } = useStation();
  const [schedule, setSchedule] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notif, setNotif] = useState({ shows: true, announcements: true, newPodcasts: true });
  const [mode, setMode] = useState('auto');

  const load = useCallback(async (mode = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await createApi(station).getSchedule();
      if (!res?.ok) {
        setSchedule([]);
        setError(res?.error || 'Could not load schedule.');
        return;
      }
      const list = Array.isArray(res.data) ? res.data : [];
      setSchedule(list);
      if (!list.length && !res.mocked) setError('No schedule available.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [station]);

  useEffect(() => {
    storage.getNotifSettings().then(setNotif).catch(() => {});
    load('initial');
  }, [load]);

  useEffect(() => {
    if (mode !== 'auto') return;
    if (loading || refreshing) return;
    if (error && station.scheduleWeekUrl) setMode('web');
  }, [mode, loading, refreshing, error, station.scheduleWeekUrl]);

  const handleRemind = async (show) => {
    if (!station.enableNotifications) {
      Alert.alert('Unavailable', 'Notifications are disabled for this station.');
      return;
    }
    if (!notif.shows) {
      Alert.alert('Show reminders off', 'Enable Show Reminders in Notifications to set reminders.');
      return;
    }
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert('Notifications disabled', 'Please enable notifications in settings.');
      return;
    }
    const ok = await scheduleShowReminder(show, 10);
    Alert.alert(ok ? 'Reminder set' : 'Oops', ok
      ? 'We will remind you 10 minutes before ' + show.title + '.'
      : 'Could not schedule a reminder.');
  };

  const isLiveItem = (item) => {
    if (typeof item?.startAt === 'number' && typeof item?.endAt === 'number') {
      const now = Date.now();
      return now >= item.startAt && now < item.endAt;
    }
    return isCurrentShow(item?.time, item?.endTime);
  };

  const showWeb = mode === 'web' || (mode === 'auto' && !loading && !refreshing && !!station.scheduleWeekUrl && !!error);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <SectionHeader
        title="Schedule"
        subtitle={showWeb ? 'Calendar view' : 'Weekly program guide'}
        right={station.scheduleWeekUrl ? (
          <TouchableOpacity
            onPress={() => setMode((m) => (m === 'web' ? 'list' : 'web'))}
            style={{ padding: 10 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={showWeb ? 'list' : 'grid-outline'} size={22} color={colors.textDim} />
          </TouchableOpacity>
        ) : null}
      />

      {!station.scheduleWeekUrl ? (
        <EmptyState
          icon="calendar-outline"
          title="Schedule unavailable"
          subtitle="Schedule is not configured for this station."
        />
      ) : showWeb ? (
        <WebView
          source={{ uri: station.scheduleWeekUrl }}
          style={{ flex: 1, backgroundColor: colors.bg }}
        />
      ) : (
        <FlatList
          data={schedule}
          keyExtractor={(i, idx) => String(i.id || (i.time + '-' + i.title) || idx)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, flexGrow: 1 }}
          renderItem={({ item }) => (
            <ScheduleCard
              item={item}
              isLive={isLiveItem(item)}
              onRemind={handleRemind}
            />
          )}
          ListEmptyComponent={
            loading || refreshing ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <EmptyState
                icon="calendar-outline"
                title={error ? 'Schedule unavailable' : 'No schedule'}
                subtitle={error || 'Pull to refresh.'}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
