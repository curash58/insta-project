import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const TabForAllPages = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentScreen = route.name;

  const handleNavigation = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => handleNavigation('Main')}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={currentScreen === 'Main' ? 'home' : 'home-outline'} 
          size={26} 
          color={currentScreen === 'Main' ? '#3D8D7A' : '#A3D1C6'} 
        />
        <Text style={[
          styles.tabText,
          currentScreen === 'Main' && styles.activeTabText
        ]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.createPostButton} 
        onPress={() => handleNavigation('PostCreation')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#FBFFE4" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => handleNavigation('ProfileUser')}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={currentScreen === 'ProfileUser' ? 'person' : 'person-outline'} 
          size={26} 
          color={currentScreen === 'ProfileUser' ? '#3D8D7A' : '#A3D1C6'} 
        />
        <Text style={[
          styles.tabText,
          currentScreen === 'ProfileUser' && styles.activeTabText
        ]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FBFFE4',
    borderTopWidth: 1,
    borderTopColor: '#B3D8A8',
    paddingVertical: 8,
    paddingHorizontal: 20,
    height: 65,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    marginTop: 3,
    color: '#A3D1C6',
  },
  activeTabText: {
    color: '#3D8D7A',
    fontWeight: '600',
  },
  createPostButton: {
    backgroundColor: '#3D8D7A',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    elevation: 4,
    shadowColor: '#3D8D7A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default TabForAllPages;
