import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TabForAllPages from '../components/tabForAllPages';
import { getUserPosts } from '../lib/firebase/posts';
import { getCurrentUser } from '../lib/firebase/auth';
import { getUserById } from '../lib/firebase/users';

const { width } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns;

const ProfileUser = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      // Fetch user data including profile picture
      const userResult = await getUserById(currentUser.uid);
      if (userResult.success) {
        setUserData(userResult.user);
      }

      // Fetch user posts
      const result = await getUserPosts(currentUser.uid);
      if (result.success) {
        setPosts(result.posts);
      } else {
        setError(result.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePostPress = (postId) => {
    const postData = posts.find(post => post.id === postId);
    if (postData) {
      navigation.navigate('PostPage', { post: postData });
    }
  };

  const navigateToFollowers = () => {
    navigation.navigate('FollowersFollowing', { type: 'followers' });
  };

  const navigateToFollowing = () => {
    navigation.navigate('FollowersFollowing', { type: 'following' });
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const navigateToSavedPosts = () => {
    navigation.navigate('SavedPosts');
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postTile}
      onPress={() => handlePostPress(item.id)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.imageURL }} 
        style={styles.postImage}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D8D7A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.usernameHeader}>{userData?.username || 'Username'}</Text>
          <TouchableOpacity onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={24} color="#3D8D7A" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileSection}>
          <Image 
            source={{ 
              uri: userData?.photoURL || 'https://picsum.photos/200/200?random=profile'
            }} 
            style={styles.profileImage}
          />
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts?.length || 0}</Text>
              <Text style={styles.statLabel}>posts</Text>
            </View>
            
            <TouchableOpacity style={styles.statItem} onPress={navigateToFollowers}>
              <Text style={styles.statNumber}>{userData?.followers?.length || 0}</Text>
              <Text style={styles.statLabel}>followers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem} onPress={navigateToFollowing}>
              <Text style={styles.statNumber}>{userData?.following?.length || 0}</Text>
              <Text style={styles.statLabel}>following</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={navigateToSettings}>
            <Ionicons name="settings-outline" size={18} color="#FBFFE4" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={navigateToSavedPosts}>
            <Ionicons name="bookmark-outline" size={18} color="#FBFFE4" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Saved Posts</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.postsContainer}>
          <FlatList
            data={posts || []}
            renderItem={renderPost}
            keyExtractor={item => item.id}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.postsGrid}
          />
        </View>
      </SafeAreaView>
      
      <TabForAllPages />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFFE4',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  usernameHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D8D7A',
  },
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3D8D7A',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D8D7A',
  },
  statLabel: {
    fontSize: 14,
    color: '#3D8D7A',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#3D8D7A',
    borderRadius: 8,
    padding: 10,
    flex: 0.48,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: '#FBFFE4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postsGrid: {
    paddingBottom: 5,
  },
  postTile: {
    width: tileSize,
    height: tileSize,
    padding: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFFE4',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFFE4',
  },
  errorText: {
    color: '#FF4D67',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileUser;
