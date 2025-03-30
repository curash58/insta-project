import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TabForAllPages from '../components/tabForAllPages';

const { width } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns;

// Enhanced post data with necessary information for the PostPage
const POSTS = Array(20).fill().map((_, index) => ({
  id: index.toString(),
  username: 'username',
  userProfileImage: 'https://picsum.photos/200/200?random=otherprofile',
  imageUrl: `https://picsum.photos/500/500?random=${100 + index}`,
  caption: `This is post ${index} from another user's profile`,
  likesCount: Math.floor(Math.random() * 500),
  commentsCount: Math.floor(Math.random() * 100)
}));

const ProfileUserLook = () => {
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState(false);

  const handlePostPress = (postId) => {
    // Find the post data by id
    const postData = POSTS.find(post => post.id === postId);
    
    // Navigate to the PostPage with the full post data
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

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
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
        source={{ uri: item.imageUrl }} 
        style={styles.postImage}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3D8D7A" />
          </TouchableOpacity>
          <Text style={styles.usernameHeader}>Username</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://picsum.photos/200/200?random=otherprofile' }} 
            style={styles.profileImage}
          />
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>82</Text>
              <Text style={styles.statLabel}>posts</Text>
            </View>
            
            <TouchableOpacity style={styles.statItem} onPress={navigateToFollowers}>
              <Text style={styles.statNumber}>150</Text>
              <Text style={styles.statLabel}>followers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem} onPress={navigateToFollowing}>
              <Text style={styles.statNumber}>250</Text>
              <Text style={styles.statLabel}>following</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
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
        </View>
        
        <View style={styles.postsContainer}>
          <FlatList
            data={POSTS}
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
  postsContainer: {
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
});

export default ProfileUserLook;
