import { 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  serverTimestamp,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Add a comment to a post
export const addComment = async (postId, userId, message) => {
  try {
    // Get user data to include username and profile image
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userDoc.data();
    
    // Create comment object
    const comment = {
      id: crypto.randomUUID(), // Generate a unique ID for the comment
      userId,
      username: userData.username,
      userProfileImage: userData.photoURL || null,
      message,
      timestamp: new Date().toISOString() // Store as ISO string for cross-platform compatibility
    };
    
    // Add comment to post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion(comment)
    });
    
    return { success: true, comment };
  } catch (error) {
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
    
    return { success: true, comments };
  } catch (error) {
    return { success: false, error: error.message };
  }
}; 