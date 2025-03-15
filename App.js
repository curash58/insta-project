import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './screens/logIn';
import SignIn from './screens/signIn';
import FollowersFollowing from './screens/followersFollowing';
import PostCreation from './screens/postCreation';
import Main from './screens/main';
import ProfileUser from './screens/profileUser';
import ProfileUserLook from './screens/profileUserLook';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {/* Change screen here for testing all screens */}
        <Stack.Navigator 
          initialRouteName="Main"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FBFFE4' },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={Login}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="SignIn" 
            component={SignIn}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Main" 
            component={Main}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ProfileUser" 
            component={ProfileUser}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ProfileUserLook" 
            component={ProfileUserLook}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="FollowersFollowing" 
            component={FollowersFollowing}
            options={{
              headerShown: false,
            }}  
          />
          <Stack.Screen 
            name="PostCreation" 
            component={PostCreation}
            options={{
              headerShown: false,
            }}  
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
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
