import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChange } from './lib/firebase/auth';
import { Platform } from 'react-native';

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

// Custom transition configuration to disable all animations
const noAnimationConfig = {
  animation: 'none',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

// Default animation config for normal transitions
const defaultAnimationConfig = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

// Create separate navigators for auth and app flows
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="SignIn" component={SignIn} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
    }}
  >
    {/* Main Tab Screens - No Animation */}
    <Stack.Screen 
      name="Main" 
      component={Main} 
      options={{
        animationEnabled: false,
        cardStyleInterpolator: () => ({
          cardStyle: {
            opacity: 1,
          },
        }),
        transitionSpec: {
          open: noAnimationConfig,
          close: noAnimationConfig,
        },
      }}
    />
    <Stack.Screen 
      name="ProfileUser" 
      component={ProfileUser}
      options={{
        animationEnabled: false,
        cardStyleInterpolator: () => ({
          cardStyle: {
            opacity: 1,
          },
        }),
        transitionSpec: {
          open: noAnimationConfig,
          close: noAnimationConfig,
        },
      }} 
    />
    <Stack.Screen 
      name="PostCreation" 
      component={PostCreation}
      options={{
        animationEnabled: false,
        cardStyleInterpolator: () => ({
          cardStyle: {
            opacity: 1,
          },
        }),
        transitionSpec: {
          open: noAnimationConfig,
          close: noAnimationConfig,
        },
      }}
    />
    
    {/* Other Screens - With Animation */}
    <Stack.Screen 
      name="ProfileUserLook" 
      component={ProfileUserLook}
      options={{ animationEnabled: true }}
    />
    <Stack.Screen 
      name="PostPage" 
      component={PostPage}
      options={{ animationEnabled: true }}
    />
    <Stack.Screen 
      name="SavedPosts" 
      component={SavedPosts}
      options={{ animationEnabled: true }}
    />
    <Stack.Screen 
      name="Settings" 
      component={Settings}
      options={{ animationEnabled: true }}
    />
    <Stack.Screen 
      name="FollowersFollowing" 
      component={FollowersFollowing}
      options={{ animationEnabled: true }}
    />
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
    <NavigationContainer
      theme={{
        colors: {
          // Default theme colors
          primary: '#3D8D7A',
          background: '#FBFFE4',
          card: '#FBFFE4',
          text: '#3D8D7A',
          border: '#B3D8A8',
          notification: '#FF4D67',
        },
        // This custom timing ensures no animation happens during navigation
        animation: {
          // Set very fast animation timing (nearly instantaneous)
          config: {
            duration: 0, 
            easing: (t) => t,
          },
        },
      }}
    >
      {!user ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  );
};

export default Navigation;
