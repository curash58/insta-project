import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { likePost, unlikePost } from '../lib/firebase/posts';
import { getCurrentUser } from '../lib/firebase/auth';
import { savePost, unsavePost, isPostSaved } from '../lib/firebase/users';

const { width } = Dimensions.get('window');

const PostCard = ({ post, onLikeChange, onSaveChange }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isCheckingSaved, setIsCheckingSaved] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch current user
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        // Check if current user has liked the post
        if (post && user) {
          setLiked(post.likes?.includes(user.uid) || false);
          
          // Check if post is saved
          setIsCheckingSaved(true);
          try {
            const result = await isPostSaved(user.uid, post.id);
            if (result.success) {
              setSaved(result.isSaved);
            }
          } catch (error) {
            console.error('Error checking saved status:', error);
          } finally {
            setIsCheckingSaved(false);
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, [post]);

  const handleLike = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to like posts');
      return;
    }

    try {
      const result = liked 
        ? await unlikePost(post.id, currentUser.uid)
        : await likePost(post.id, currentUser.uid);

      if (result.success) {
        setLiked(!liked);
        // Update post likes count
        const updatedLikes = liked 
          ? (post.likes || []).filter(id => id !== currentUser.uid)
          : [...(post.likes || []), currentUser.uid];
        
        post.likes = updatedLikes;
        
        // Notify parent component if callback provided
        if (onLikeChange) {
          onLikeChange(post);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to update like status');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };
  
  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to save posts');
      return;
    }
    
    try {
      const result = saved
        ? await unsavePost(currentUser.uid, post.id)
        : await savePost(currentUser.uid, post.id);
        
      if (result.success) {
        setSaved(!saved);
        
        // Notify parent component if callback provided
        if (onSaveChange) {
          onSaveChange(post.id, !saved);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to save/unsave post');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const navigateToProfile = () => {
    navigation.navigate('ProfileUserLook', { userId: post.creatorId });
  };

  const navigateToPost = () => {
    navigation.navigate('PostPage', { post });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.userInfoContainer}
        onPress={navigateToProfile}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: post.userProfileImage || 'https://picsum.photos/200/200?random=profile' }} 
          style={styles.profileImage} 
        />
        <Text style={styles.username}>{post.username}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        activeOpacity={0.95}
        onPress={navigateToPost}
      >
        <Image 
          source={{ uri: post.imageURL }} 
          style={styles.postImage} 
          resizeMode="cover"
        />
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "#FF4D67" : "#3D8D7A"} 
            />
            <Text style={styles.actionText}>{post.likes?.length || 0} likes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={navigateToPost}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#3D8D7A" />
            <Text style={styles.actionText}>{post.comments?.length || 0} comments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleSave}
            disabled={isCheckingSaved}
          >
            <Ionicons 
              name={saved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color="#3D8D7A" 
            />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.captionContainer}>
        <Text style={styles.username}>{post.username}</Text>
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
    marginRight: 10,
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
    marginTop: 4,
  },
  viewCommentsText: {
    color: '#A3D1C6',
    fontSize: 14,
    fontWeight: '500',
  }
});

export default PostCard;
