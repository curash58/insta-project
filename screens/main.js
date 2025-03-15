import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import PostCard from '../components/postCard';
import TabForAllPages from '../components/tabForAllPages';


const POSTS = [
  {
    id: '1',
    username: 'coffee_lover',
    userProfileImage: 'https://randomuser.me/api/portraits/women/43.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    likesCount: 254,
    commentsCount: 42,
    caption: 'Perfect morning with my favorite latte art ☕️ #coffeetime'
  },
  {
    id: '2',
    username: 'plant_enthusiast',
    userProfileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    likesCount: 189,
    commentsCount: 23,
    caption: 'My indoor jungle is growing! 🌿 #plantlover #urbanjungle'
  },
  {
    id: '3',
    username: 'travel_addict',
    userProfileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    likesCount: 423,
    commentsCount: 87,
    caption: 'Missing the beach sunsets in Bali 🌅 #travelmemories'
  },
  {
    id: '4',
    username: 'foodie_adventures',
    userProfileImage: 'https://randomuser.me/api/portraits/men/78.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    likesCount: 312,
    commentsCount: 56,
    caption: 'Homemade pizza night was a success! 🍕 #foodporn #homecooking'
  }
];

const Main = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FBFFE4" barStyle="dark-content" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Main Screen</Text>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {POSTS.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </ScrollView>
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
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3D8D7A',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FBFFE4',
  },
  scrollView: {
    flex: 1,
  },
});

export default Main;
