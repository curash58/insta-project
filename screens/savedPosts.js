import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, Keyboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import TabForAllPages from '../components/tabForAllPages';
import { getSavedPosts } from '../lib/firebase/posts';
import { getCurrentUser } from '../lib/firebase/auth';

const { width } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns;

const SavedPosts = () => {
  const navigation = useNavigation();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getSavedPosts(currentUser.uid);
      
      if (result.success) {
        setSavedPosts(result.posts);
      } else {
        setError(result.error || 'Failed to fetch saved posts');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const navigateToPost = (post) => {
    navigation.navigate('PostPage', { post });
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postTile}
      onPress={() => navigateToPost(item)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.imageURL }} 
        style={styles.postImage}
      />
      <View style={styles.saveIconContainer}>
        <Ionicons name="bookmark" size={16} color="#FBFFE4" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FBFFE4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Posts</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3D8D7A" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#FF4D67" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : savedPosts.length > 0 ? (
          <FlatList
            data={savedPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.postsContainer}
            onScrollBeginDrag={() => Keyboard.dismiss()}
            onRefresh={fetchSavedPosts}
            refreshing={loading}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={80} color="#A3D1C6" />
            <Text style={styles.emptyText}>You haven't saved any posts yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the bookmark icon on posts to save them for later
            </Text>
          </View>
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
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3D8D7A',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FBFFE4',
    textAlign: 'center',
  },
  placeholder: {
    width: 34, 
  },
  postsContainer: {
    padding: 2,
    paddingBottom: 80, 
  },
  postTile: {
    width: tileSize - 4,
    height: tileSize - 4,
    margin: 2,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  saveIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(61, 141, 122, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#A3D1C6',
    textAlign: 'center',
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
    marginTop: 10,
  }
});

export default SavedPosts;
