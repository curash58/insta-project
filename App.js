import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './Navigation';
import React from 'react';
import './config/firebase';

const App = () => {
  return (
    <SafeAreaProvider style={styles.container}>
      <Navigation />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFFE4',
  },
});
