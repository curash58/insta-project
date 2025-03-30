import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const dummyFollowers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
    isFollowing: false,
  },
  {
    id: '2',
    name: 'Mike Wilson',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
    isFollowing: true,
  },
  {
    id: '3',
    name: 'Emma Davis',
    image: 'https://randomuser.me/api/portraits/women/3.jpg',
    isFollowing: false,
  },
  {
    id: '4',
    name: 'James Brown',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
    isFollowing: true,
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    image: 'https://randomuser.me/api/portraits/women/5.jpg',
    isFollowing: false,
  },
  {
    id: '6',
    name: 'David Lee',
    image: 'https://randomuser.me/api/portraits/men/6.jpg',
    isFollowing: true,
  },
  {
    id: '7',
    name: 'Sophie Taylor',
    image: 'https://randomuser.me/api/portraits/women/7.jpg',
    isFollowing: false,
  },
  {
    id: '8',
    name: 'Alex Thompson',
    image: 'https://randomuser.me/api/portraits/men/8.jpg',
    isFollowing: true,
  },
];

const FollowersFollowing = () => {
  const [followers, setFollowers] = useState(dummyFollowers);
  const navigation = useNavigation();

  const toggleFollow = (id) => {
    setFollowers(followers.map(follower => 
      follower.id === id 
        ? { ...follower, isFollowing: !follower.isFollowing }
        : follower
    ));
  };

  const goBack = () => {
    navigation.goBack();
  };

  const renderFollower = ({ item }) => (
    <View style={styles.followerItem}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.followerImage}
      />
      <Text style={styles.followerName}>{item.name}</Text>
      <TouchableOpacity 
        style={[
          styles.followButton,
          item.isFollowing && styles.followingButton
        ]}
        onPress={() => toggleFollow(item.id)}
      >
        <Text style={[
          styles.followButtonText,
          item.isFollowing && styles.followingButtonText
        ]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#3D8D7A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Followers</Text>
          <Text style={styles.subtitle}>{followers.length} followers</Text>
        </View>
      </View>
      <FlatList
        data={followers}
        renderItem={renderFollower}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#B3D8A8',
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#3D8D7A',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#A3D1C6',
  },
  listContainer: {
    padding: 15,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#B3D8A8',
  },
  followerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  followerName: {
    flex: 1,
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
    borderColor: '#B3D8A8',
  },
  followButtonText: {
    color: '#FBFFE4',
    fontSize: 14,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#3D8D7A',
  },
});
