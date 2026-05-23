import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PlayerProvider } from './src/context/PlayerContext';
import { StationProvider } from './src/context/StationContext';
import RootNavigator from './src/navigation/RootNavigator';
import { navTheme } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <StationProvider>
        <PlayerProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </PlayerProvider>
      </StationProvider>
    </SafeAreaProvider>
  );
}
