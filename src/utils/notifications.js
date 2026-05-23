import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    if (__DEV__) console.log('[notifications]', e.message);
    return false;
  }
}

export async function scheduleShowReminder(show, minutesBefore = 10) {
  try {
    const mins = Math.max(0, Math.min(60, Number(minutesBefore) || 0));
    const trigger = new Date();
    if (typeof show?.startAt === 'number' && !Number.isNaN(show.startAt)) {
      const target = new Date(show.startAt - mins * 60 * 1000);
      if (target.getTime() < Date.now()) return false;
      trigger.setTime(target.getTime());
    } else {
      if (!show || typeof show.time !== 'string') return false;
      const [h, m] = show.time.split(':').map(Number);
      if ([h, m].some(n => Number.isNaN(n))) return false;
      trigger.setHours(h, m - mins, 0, 0);
      if (trigger.getTime() < Date.now()) trigger.setDate(trigger.getDate() + 1);
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: show.title + ' starts soon',
        body: show.host + ' - in ' + mins + ' minutes. Do not miss it!',
      },
      trigger,
    });
    return true;
  } catch { return false; }
}
