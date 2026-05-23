import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/colors';

export default function ScheduleCard({ item, isLive, onRemind }) {
  return (
    <View style={[styles.card, isLive && styles.cardLive]}>
      <View style={styles.timeBox}>
        <Text style={[styles.time, isLive && { color: '#fff' }]}>{item.time}</Text>
        {isLive && <Text style={styles.liveDot}>LIVE</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, isLive && { color: '#fff' }]}>{item.title}</Text>
        {!!item.host && (
          <Text style={[styles.host, isLive && { color: 'rgba(255,255,255,0.85)' }]}>with {item.host}</Text>
        )}
        {!!item.description && (
          <Text style={[styles.desc, isLive && { color: 'rgba(255,255,255,0.75)' }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={() => onRemind && onRemind(item)} style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="notifications-outline" size={22} color={isLive ? '#fff' : colors.textDim} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md + 2, marginBottom: spacing.sm + 2, alignItems: 'center', gap: spacing.md,
  },
  cardLive: { backgroundColor: colors.primary },
  timeBox: { width: 72 },
  time: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  liveDot: { color: '#fff', fontSize: 10, fontWeight: '700', marginTop: 4 },
  title: { color: colors.text, fontWeight: '700', fontSize: 16 },
  host: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  desc: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  iconBtn: { padding: 4 },
});
