import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStation } from '../context/StationContext';
import { colors } from '../theme/colors';

export default function SplashScreen({ navigation }) {
  const { station, logoSource, splashSource } = useStation();
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    const t = setTimeout(() => {
      navigation.replace('Main');
    }, 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient colors={['#FFFFFF', colors.bg, '#FFFFFF']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fade, transform: [{ scale }] }]}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Image source={splashSource || logoSource} style={styles.logo} />
        </Animated.View>
        <Text style={styles.name}>{station.name}</Text>
        <Text style={styles.tagline}>{station.tagline}</Text>
      </Animated.View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>TUNING IN...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  logo: { width: 150, height: 150, borderRadius: 24, marginBottom: 24 },
  name: { color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: 1 },
  tagline: { color: colors.textDim, fontSize: 14, marginTop: 8 },
  footer: { position: 'absolute', bottom: 40 },
  footerText: { color: colors.textMuted, fontSize: 12, letterSpacing: 2 },
});
