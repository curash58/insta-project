import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TabForAllPages from '../components/tabForAllPages';
import { getUserPosts } from '../lib/firebase/posts';
import { getUserById } from '../lib/firebase/users';
import { getCurrentUser } from '../lib/firebase/auth';
import { followUser, unfollowUser } from '../lib/firebase/users';

const { width } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns;

const ProfileUserLook = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const userId = route.params?.userId;
  
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current user to check if following
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('User not logged in');
        setLoading(false);
        return;
      }
      
      setCurrentUserId(currentUser.uid);
      
      // Get user data
      const userResult = await getUserById(userId);
      if (!userResult.success) {
        setError(userResult.error || 'Failed to fetch user data');
        setLoading(false);
        return;
      }
      
      setUserData(userResult.user);
      
      // Check if current user is following this user
      const isUserFollowing = currentUser.userData?.following?.includes(userId) || false;
      setIsFollowing(isUserFollowing);
      
      // Fetch user posts
      const postsResult = await getUserPosts(userId);
      if (postsResult.success) {
        setPosts(postsResult.posts);
      } else {
        setError(postsResult.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
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
    navigation.navigate('FollowersFollowing', { type: 'followers', userId });
  };

  const navigateToFollowing = () => {
    navigation.navigate('FollowersFollowing', { type: 'following', userId });
  };

  const toggleFollow = async () => {
    if (!currentUserId || !userId) return;
    
    try {
      // Optimistically update UI
      setIsFollowing(!isFollowing);
      
      // Call the appropriate API
      let result;
      if (isFollowing) {
        result = await unfollowUser(currentUserId, userId);
      } else {
        result = await followUser(currentUserId, userId);
      }
      
      if (!result.success) {
        // Revert the optimistic update if the API call failed
        setIsFollowing(isFollowing);
        setError(result.error || `Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      }
    } catch (err) {
      // Revert the optimistic update if there was an error
      setIsFollowing(isFollowing);
      setError('An unexpected error occurred');
      console.error(err);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
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
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#3D8D7A" />
            </TouchableOpacity>
            <Text style={styles.usernameHeader}>Loading...</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3D8D7A" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#3D8D7A" />
            </TouchableOpacity>
            <Text style={styles.usernameHeader}>Error</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchUserData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3D8D7A" />
          </TouchableOpacity>
          <Text style={styles.usernameHeader}>{userData?.username || 'Username'}</Text>
          <View style={styles.placeholder} />
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
          {currentUserId !== userId && (
            <TouchableOpacity 
              style={[
                styles.followButton, 
                isFollowing ? styles.followingButton : styles.notFollowingButton
              ]}
              onPress={toggleFollow}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {userData?.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>{userData.bio}</Text>
          </View>
        )}
        
        <View style={styles.postsContainer}>
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={item => item.id}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.postsGrid}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            }
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 34,
  },
  usernameHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3D8D7A',
    textAlign: 'center',
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
  followButton: {
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  notFollowingButton: {
    backgroundColor: '#3D8D7A',
  },
  followingButton: {
    backgroundColor: '#A3D1C6',
  },
  messageButton: {
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
  bioContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  bioText: {
    fontSize: 14,
    color: '#3D8D7A',
    lineHeight: 20,
  },
  postsContainer: {
    flex: 1,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4D67',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3D8D7A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FBFFE4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#3D8D7A',
    opacity: 0.7,
  },
});

export default ProfileUserLook;
