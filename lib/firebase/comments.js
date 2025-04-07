import { 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  serverTimestamp,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getBatchUserBasicInfo } from './users';

// Generate a unique ID
const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${randomStr}`;
};

// Add a comment to a post
export const addComment = async (postId, userId, message) => {
  try {
    // Validate inputs to ensure they're not undefined
    if (!postId || !userId || !message) {
      console.error('Missing required fields:', { postId, userId, message });
      return { success: false, error: 'Missing required fields for comment' };
    }
    
    // Create comment object with only primitive values to ensure compatibility with arrayUnion
    const comment = {
      id: generateUniqueId(),
      userId: String(userId), // Ensure userId is a string
      message: String(message), // Ensure message is a string
      timestamp: new Date().toISOString() // Store as ISO string for cross-platform compatibility
    };
    
    // Log the comment object for debugging
    console.log('Adding comment:', comment);
    
    // Add comment to post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion(comment)
    });
    
    return { success: true, comment };
  } catch (error) {
    console.error('Error in addComment:', error);
    return { success: false, error: error.message };
  }
};

// Delete a comment from a post
export const deleteComment = async (postId, commentId, userId) => {
  try {
    // Get the post first to find the comment
    const postDoc = await getDoc(doc(db, 'posts', postId));
    
    if (!postDoc.exists()) {
      return { success: false, error: 'Post not found' };
    }
    
    const post = postDoc.data();
    const comments = post.comments || [];
    
    // Find the comment to delete
    const commentToDelete = comments.find(c => c.id === commentId);
    
    if (!commentToDelete) {
      return { success: false, error: 'Comment not found' };
    }
    
    // Check if the user is authorized to delete this comment
    // Only allow if user is the comment creator or the post creator
    if (commentToDelete.userId !== userId && post.creatorId !== userId) {
      return { success: false, error: 'You are not authorized to delete this comment' };
    }
    
    // Remove the comment
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayRemove(commentToDelete)
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get comments for a post
export const getComments = async (postId) => {
  try {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    
    if (!postDoc.exists()) {
      return { success: false, error: 'Post not found' };
    }
    
    const post = postDoc.data();
    const comments = post.comments || [];
    
    // Sort comments by timestamp (most recent first)
    comments.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Get all user info at once for efficiency
    if (comments.length > 0) {
      const userIds = comments.map(comment => comment.userId);
      const usersResult = await getBatchUserBasicInfo(userIds);
      
      if (usersResult.success) {
        // Attach user info to each comment
        comments.forEach(comment => {
          if (usersResult.usersInfo[comment.userId]) {
            comment.username = usersResult.usersInfo[comment.userId].username;
            comment.userProfileImage = usersResult.usersInfo[comment.userId].photoURL;
          }
        });
      }
    }
    
    return { success: true, comments };
  } catch (error) {
    return { success: false, error: error.message };
  }
}; 