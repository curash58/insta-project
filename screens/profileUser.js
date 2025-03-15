import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabForAllPages from '../components/tabForAllPages';

const { width } = Dimensions.get('window');
const numColumns = 3;
const tileSize = width / numColumns;

const POSTS = Array(20).fill().map((_, index) => ({
  id: index.toString(),
  imageUrl: `https://picsum.photos/500/500?random=${index}`
}));

const ProfileUser = () => {
  const navigation = useNavigation();

  const handlePostPress = (postId) => {
    console.log('Navigate to post:', postId);
  };

  const navigateToFollowers = () => {
    navigation.navigate('FollowersFollowing', { type: 'followers' });
  };

  const navigateToFollowing = () => {
    navigation.navigate('FollowersFollowing', { type: 'following' });
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postTile}
      onPress={() => handlePostPress(item.id)}
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
        <Text style={styles.usernameHeader}>Username</Text>
        
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://picsum.photos/200/200?random=profile' }} 
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
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>saved posts</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={POSTS}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.postsGrid}
          showsVerticalScrollIndicator={false}
        />
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
  usernameHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D8D7A',
    padding: 15,
  },
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#3D8D7A',
    borderRadius: 5,
    padding: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FBFFE4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postsGrid: {
    paddingBottom: 20,
  },
  postTile: {
    width: tileSize,
    height: tileSize,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProfileUser;
