import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Keyboard, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFollowers, getFollowing, followUser, unfollowUser } from '../lib/firebase/users';
import { getCurrentUser } from '../lib/firebase/auth';

const FollowersFollowing = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const type = route.params?.type || 'followers';
  const targetUserId = route.params?.userId;

  useEffect(() => {
    fetchData();
  }, [type, targetUserId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current user ID
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('User not logged in');
        setLoading(false);
        return;
      }
      
      setCurrentUserId(currentUser.uid);
      
      // Use targetUserId if provided, otherwise use current user's ID
      const userIdToFetch = targetUserId || currentUser.uid;
      
      // Fetch followers or following based on type
      let result;
      if (type === 'followers') {
        result = await getFollowers(userIdToFetch);
      } else {
        result = await getFollowing(userIdToFetch);
      }
      
      if (result.success) {
        // Add isFollowing flag to each user
        const usersWithFollowStatus = result[type].map(user => {
          // Check if the current user is following this user
          const isFollowing = currentUser.userData?.following?.includes(user.uid) || false;
          return { ...user, isFollowing };
        });
        
        setUsers(usersWithFollowStatus);
      } else {
        setError(result.error || `Failed to fetch ${type}`);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (userId) => {
    if (!currentUserId) return;
    
    try {
      // Find the user in the list
      const userIndex = users.findIndex(user => user.uid === userId);
      if (userIndex === -1) return;
      
      const user = users[userIndex];
      const isCurrentlyFollowing = user.isFollowing;
      
      // Optimistically update UI
      const updatedUsers = [...users];
      updatedUsers[userIndex] = { ...user, isFollowing: !isCurrentlyFollowing };
      setUsers(updatedUsers);
      
      // Call the appropriate API
      let result;
      if (isCurrentlyFollowing) {
        result = await unfollowUser(currentUserId, userId);
      } else {
        result = await followUser(currentUserId, userId);
      }
      
      if (!result.success) {
        // Revert the optimistic update if the API call failed
        const revertedUsers = [...users];
        revertedUsers[userIndex] = { ...user, isFollowing: isCurrentlyFollowing };
        setUsers(revertedUsers);
        
        setError(result.error || `Failed to ${isCurrentlyFollowing ? 'unfollow' : 'follow'} user`);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const renderUser = ({ item }) => (
    <View style={styles.followerItem}>
      <TouchableOpacity 
        style={styles.profileSection}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ProfileUserLook', { userId: item.uid })}
      >
        <Image 
          source={{ uri: item.photoURL || 'https://picsum.photos/200/200?random=profile' }} 
          style={styles.followerImage}
        />
        <Text style={styles.followerName}>{item.username}</Text>
      </TouchableOpacity>
      
      {item.uid !== currentUserId && (
        <TouchableOpacity 
          style={[
            styles.followButton,
            item.isFollowing && styles.followingButton
          ]}
          onPress={() => toggleFollow(item.uid)}
        >
          <Text style={[
            styles.followButtonText,
            item.isFollowing && styles.followingButtonText
          ]}>
            {item.isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={goBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FBFFE4" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>{type === 'followers' ? 'Followers' : 'Following'}</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3D8D7A" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={goBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FBFFE4" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>{type === 'followers' ? 'Followers' : 'Following'}</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FBFFE4" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>{type === 'followers' ? 'Followers' : 'Following'}</Text>
          <Text style={styles.subtitle}>{users.length} {type}</Text>
        </View>
      </View>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.uid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {type} yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default FollowersFollowing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFFE4',
  },
  header: {
    padding: 15,
    backgroundColor: '#3D8D7A',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FBFFE4',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FBFFE4',
    opacity: 0.8,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80, // Extra padding to ensure content doesn't go behind tab bar
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#3D8D7A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  profileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  followerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#3D8D7A',
  },
  followerName: {
    fontSize: 16,
    color: '#3D8D7A',
    fontWeight: '500',
  },
  followButton: {
    backgroundColor: '#3D8D7A',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3D8D7A',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderColor: '#3D8D7A',
  },
  followButtonText: {
    color: '#FBFFE4',
    fontSize: 14,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#3D8D7A',
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
