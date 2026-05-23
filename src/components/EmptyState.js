import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/colors';

export default function EmptyState({ icon = 'sad-outline', title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={64} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.lg },
  sub: { color: colors.textDim, textAlign: 'center', marginTop: spacing.sm },
});
