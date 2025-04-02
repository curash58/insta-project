import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './Navigation';
import React, { useEffect } from 'react';

// Initialize Firebase before app renders
import './config/firebase';
import { checkRequiredIndexes } from './lib/firebase/firestore-init';

// Ignore specific Firebase-related warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted from react-native',
  'Warning: Async Storage has been extracted from react-native',
  '@firebase/firestore:',
]);

const App = () => {
  useEffect(() => {
    // Check for required Firestore indexes when app starts
    // This just logs recommendations, doesn't actually create indexes
    checkRequiredIndexes();
  }, []);
  
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
