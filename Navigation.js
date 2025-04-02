import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChange } from './lib/firebase/auth';

// Screens
import Login from './screens/logIn';
import SignIn from './screens/signIn';
import Main from './screens/main';
import ProfileUser from './screens/profileUser';
import ProfileUserLook from './screens/profileUserLook';
import PostPage from './screens/postPage';
import SavedPosts from './screens/savedPosts';
import Settings from './screens/settings';
import FollowersFollowing from './screens/followersFollowing';
import PostCreation from './screens/postCreation';

const Stack = createStackNavigator();

// Create separate navigators for auth and app flows
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="SignIn" component={SignIn} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={Main} />
    <Stack.Screen name="ProfileUser" component={ProfileUser} />
    <Stack.Screen name="ProfileUserLook" component={ProfileUserLook} />
    <Stack.Screen name="PostPage" component={PostPage} />
    <Stack.Screen name="SavedPosts" component={SavedPosts} />
    <Stack.Screen name="Settings" component={Settings} />
    <Stack.Screen name="FollowersFollowing" component={FollowersFollowing} />
    <Stack.Screen name="PostCreation" component={PostCreation} />
  </Stack.Navigator>
);

const Navigation = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChange(onAuthStateChanged);
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // If we're still initializing, don't render anything
  if (initializing) return null;

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  );
};

export default Navigation;
