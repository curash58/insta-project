import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Image, TouchableOpacity, Keyboard, ActivityIndicator, TextInput, FlatList, Platform } from 'react-native';
import PostCard from '../components/postCard';
import TabForAllPages from '../components/tabForAllPages';
import { getAllPostsExceptCurrentUser } from '../lib/firebase/posts';
import { getCurrentUser } from '../lib/firebase/auth';
import { searchUsers } from '../lib/firebase/users';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Main = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPosts();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setCurrentUserId(currentUser.uid);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching posts for main screen...');
      
      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.log('No user currently logged in');
        setError('User not logged in');
        setLoading(false);
        return;
      }
      
      console.log('Current user ID:', currentUser.uid);
      
      // Fetch posts from other users
      const result = await getAllPostsExceptCurrentUser(currentUser.uid);
      
      if (result.success) {
        console.log(`Fetched ${result.posts.length} posts from other users`);
        setPosts(result.posts);
      } else {
        console.error('Failed to fetch posts:', result.error);
        setError(result.error || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error in fetchPosts:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    
    if (text.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const result = await searchUsers(text);
      
      if (result.success) {
        // Filter out the current user from search results
        const filteredResults = result.users.filter(user => user.uid !== currentUserId);
        setSearchResults(filteredResults);
      } else {
        console.error('Search failed:', result.error);
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const navigateToUserProfile = (userId) => {
    navigation.navigate('ProfileUserLook', { userId });
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.searchResultItem}
      onPress={() => navigateToUserProfile(item.uid)}
    >
      <Image 
        source={{ uri: item.photoURL || 'https://picsum.photos/200/200?random=profile' }} 
        style={styles.searchResultImage} 
      />
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultUsername}>{item.username}</Text>
        {item.bio && <Text style={styles.searchResultBio} numberOfLines={1}>{item.bio}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="#3D8D7A" 
        barStyle="light-content" 
        translucent={true}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Main Screen</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#A3D1C6" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#A3D1C6"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#A3D1C6" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {searchQuery.length > 0 ? (
          <View style={styles.searchResultsContainer}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3D8D7A" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={item => item.uid}
                contentContainerStyle={styles.searchResultsList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            )}
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3D8D7A" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts from other users yet.</Text>
            <Text style={styles.emptySubText}>Follow more users to see their posts here.</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScrollBeginDrag={() => Keyboard.dismiss()}
          >
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
      
      <TabForAllPages />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFFE4',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3D8D7A',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FBFFE4',
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
  },
  iconSpace: {
    marginRight: 15,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FBFFE4',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#B3D8A8',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#3D8D7A',
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: '#FBFFE4',
  },
  searchResultsList: {
    padding: 15,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#B3D8A8',
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginBottom: 5,
  },
  searchResultBio: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3D8D7A',
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
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FBFFE4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#3D8D7A',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Main;
