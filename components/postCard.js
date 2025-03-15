import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PostCard = ({ post }) => {
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
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>like</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>comment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>{post.likesCount} likes</Text>
          <Text style={styles.statsText}>{post.commentsCount} comments</Text>
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
    backgroundColor: '#3D8D7A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  actionText: {
    color: '#FBFFE4',
    fontWeight: '600',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsText: {
    color: '#3D8D7A',
    fontSize: 14,
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
