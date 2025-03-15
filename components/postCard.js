import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfoContainer}>
        <Image 
          source={{ uri: post.userProfileImage }} 
          style={styles.profileImage} 
        />
        <Text style={styles.username}>{post.username}</Text>
      </View>

      <Image 
        source={{ uri: post.imageUrl }} 
        style={styles.postImage} 
        resizeMode="cover"
      />

      <View style={styles.actionsContainer}>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "#FF4D67" : "#3D8D7A"} 
            />
            <Text style={styles.actionText}>{post.likesCount} likes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#3D8D7A" />
            <Text style={styles.actionText}>{post.commentsCount} comments</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.captionContainer}>
        <Text style={styles.captionText}>{post.caption}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#FBFFE4',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D8D7A',
  },
  postImage: {
    width: width,
    height: width,
  },
  actionsContainer: {
    padding: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFFE4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 20,
  },
  actionText: {
    color: '#3D8D7A',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  captionContainer: {
    padding: 10,
    paddingTop: 0,
  },
  captionText: {
    color: '#3D8D7A',
    fontSize: 16,
  }
});

export default PostCard;
