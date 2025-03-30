import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Sample comments data
const SAMPLE_COMMENTS = [
  {
    id: '1',
    username: 'sarah_smile',
    userImage: 'https://randomuser.me/api/portraits/women/22.jpg',
    text: 'This looks amazing! Love the colors 😍',
    timeAgo: '2h ago'
  },
  {
    id: '2',
    username: 'john_doe',
    userImage: 'https://randomuser.me/api/portraits/men/45.jpg',
    text: 'Great shot! Where was this taken?',
    timeAgo: '3h ago'
  },
  {
    id: '3',
    username: 'travel_explorer',
    userImage: 'https://randomuser.me/api/portraits/women/38.jpg',
    text: 'Adding this to my bucket list right now!',
    timeAgo: '5h ago'
  }
];

const PostPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params || {};
  
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(SAMPLE_COMMENTS);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isCommentFocused, setIsCommentFocused] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handlePostComment = () => {
    if (!comment.trim()) return;
    
    const newComment = {
      id: String(comments.length + 1),
      username: 'current_user',
      userImage: 'https://randomuser.me/api/portraits/men/88.jpg',
      text: comment,
      timeAgo: 'Just now'
    };
    
    setComments([newComment, ...comments]);
    setComment('');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Render only the first 2 comments when not showing all
  const displayComments = showAllComments ? comments : comments.slice(0, 2);

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.userImage }} style={styles.commentUserImage} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.commentTime}>{item.timeAgo}</Text>
      </View>
    </View>
  );

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No post data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3D8D7A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
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
            <Text style={styles.usernameCaption}>{post.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments</Text>
            
            {displayComments.map(comment => (
              <View key={comment.id} style={styles.commentContainer}>
                <Image source={{ uri: comment.userImage }} style={styles.commentUserImage} />
                <View style={styles.commentContent}>
                  <Text style={styles.commentUsername}>{comment.username}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                </View>
              </View>
            ))}
            
            {comments.length > 2 && !showAllComments && (
              <TouchableOpacity 
                style={styles.viewMoreButton} 
                onPress={() => setShowAllComments(true)}
              >
                <Text style={styles.viewMoreText}>View all {comments.length} comments</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <View style={styles.commentInputContainer}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/88.jpg' }} 
            style={styles.currentUserImage} 
          />
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#A3D1C6"
            value={comment}
            onChangeText={setComment}
            onFocus={() => setIsCommentFocused(true)}
            onBlur={() => setIsCommentFocused(false)}
          />
          <TouchableOpacity 
            style={[
              styles.postButton, 
              !comment.trim() && styles.postButtonDisabled
            ]} 
            onPress={handlePostComment}
            disabled={!comment.trim()}
          >
            <Text style={[
              styles.postButtonText,
              !comment.trim() && styles.postButtonTextDisabled
            ]}>Post</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFFE4',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#B3D8A8',
    backgroundColor: '#FBFFE4',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D8D7A',
  },
  headerRight: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    padding: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFFE4',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 15,
  },
  actionText: {
    color: '#3D8D7A',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  captionContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  usernameCaption: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginBottom: 5,
  },
  captionText: {
    color: '#3D8D7A',
    fontSize: 16,
  },
  commentsSection: {
    paddingHorizontal: 15,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginBottom: 15,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  commentUserImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3D8D7A',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#3D8D7A',
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 12,
    color: '#A3D1C6',
  },
  viewMoreButton: {
    marginTop: 5,
    marginBottom: 15,
  },
  viewMoreText: {
    color: '#A3D1C6',
    fontSize: 14,
    fontWeight: '600',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#B3D8A8',
    backgroundColor: '#FBFFE4',
  },
  currentUserImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#3D8D7A',
    borderWidth: 1,
    borderColor: '#B3D8A8',
  },
  postButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 10,
    borderRadius: 20,
    backgroundColor: '#3D8D7A',
  },
  postButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  postButtonText: {
    color: '#FBFFE4',
    fontWeight: 'bold',
  },
  postButtonTextDisabled: {
    color: '#A3D1C6',
  },
});

export default PostPage;
