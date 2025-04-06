import { 
  doc, 
  getDoc, 
  getDocs,
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { getUserBasicInfo, getBatchUserBasicInfo } from './users';

// Generate a unique ID
const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${randomStr}`;
};

// Create a new post
export const createPost = async (userId, postData, imageUri) => {
  try {
    // Upload image
    const imageURL = await uploadPostImage(imageUri, userId);

    // Create post document
    const postsRef = collection(db, 'posts');
    const newPost = {
      uid: generateUniqueId(),
      creatorId: userId,
      imageURL,
      caption: postData.caption || '',
      likes: [],
      comments: [],
      createdAt: serverTimestamp(),
    };
    
    const postDocRef = await addDoc(postsRef, newPost);
    const postId = postDocRef.id;
    
    // Add post ID to the post document itself
    await updateDoc(postDocRef, { id: postId });
    
    // Add post ID to user's posts list
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      postsIds: arrayUnion(postId)
    });
    
    return { success: true, postId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload post image
const uploadPostImage = async (uri, userId) => {
  try {
    // Convert image URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create a unique filename
    const filename = `post_${userId}_${Date.now()}`;
    const storageRef = ref(storage, `post_images/${filename}`);
    
    // Upload the image
    await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading post image:', error);
    throw error;
  }
};

// Get a post by ID
export const getPostById = async (postId) => {
  try {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    
    if (postDoc.exists()) {
      const post = postDoc.data();
      
      // Get user info for the creator
      const userResult = await getUserBasicInfo(post.creatorId);
      if (userResult.success) {
        post.username = userResult.userInfo.username;
        post.userProfileImage = userResult.userInfo.photoURL;
      }
      
      return { success: true, post };
    } else {
      return { success: false, error: 'Post not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete a post
export const deletePost = async (postId, userId) => {
  try {
    // Get the post to check if user is the creator
    const postDoc = await getDoc(doc(db, 'posts', postId));
    
    if (!postDoc.exists()) {
      return { success: false, error: 'Post not found' };
    }
    
    const postData = postDoc.data();
    
    if (postData.creatorId !== userId) {
      return { success: false, error: 'You are not authorized to delete this post' };
    }
    
    // Delete post document
    await deleteDoc(doc(db, 'posts', postId));
    
    // Remove post ID from user's posts list
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      postsIds: arrayRemove(postId)
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user posts
export const getUserPosts = async (userId) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('creatorId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push(doc.data());
    });
    
    // Get user info for the creator (all posts have the same creator in this case)
    if (posts.length > 0) {
      const userResult = await getUserBasicInfo(userId);
      if (userResult.success) {
        posts.forEach(post => {
          post.username = userResult.userInfo.username;
          post.userProfileImage = userResult.userInfo.photoURL;
        });
      }
    }
    
    return { success: true, posts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get feed posts (posts from users that the current user follows)
export const getFeedPosts = async (userId) => {
  try {
    // Get the user's following list
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const following = userDoc.data().following || [];
    
    // Add the user's own ID to see their posts too
    following.push(userId);
    
    if (following.length === 0) {
      return { success: true, posts: [] };
    }
    
    // Get posts from followed users
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('creatorId', 'in', following),
      orderBy('createdAt', 'desc'),
      limit(50) // Limit to avoid loading too many posts at once
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push(doc.data());
    });
    
    // Get all user info at once for efficiency
    if (posts.length > 0) {
      const userIds = [...new Set(posts.map(post => post.creatorId))]; // Get unique user IDs
      const usersResult = await getBatchUserBasicInfo(userIds);
      
      if (usersResult.success) {
        // Attach user info to each post
        posts.forEach(post => {
          if (usersResult.usersInfo[post.creatorId]) {
            post.username = usersResult.usersInfo[post.creatorId].username;
            post.userProfileImage = usersResult.usersInfo[post.creatorId].photoURL;
          }
        });
      }
    }
    
    return { success: true, posts };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Like a post
export const likePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(userId)
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Unlike a post
export const unlikePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayRemove(userId)
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get saved posts
export const getSavedPosts = async (userId) => {
  try {
    // Get user's saved posts IDs
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const savedPostIds = userDoc.data().savedPosts || [];
    
    if (savedPostIds.length === 0) {
      return { success: true, posts: [] };
    }
    
    // Get the posts
    const posts = [];
    
    for (const postId of savedPostIds) {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists()) {
        posts.push(postDoc.data());
      }
    }
    
    // Get all user info at once for efficiency
    if (posts.length > 0) {
      const userIds = [...new Set(posts.map(post => post.creatorId))]; // Get unique user IDs
      const usersResult = await getBatchUserBasicInfo(userIds);
      
      if (usersResult.success) {
        // Attach user info to each post
        posts.forEach(post => {
          if (usersResult.usersInfo[post.creatorId]) {
            post.username = usersResult.usersInfo[post.creatorId].username;
            post.userProfileImage = usersResult.usersInfo[post.creatorId].photoURL;
          }
        });
      }
    }
    
    return { success: true, posts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}; 