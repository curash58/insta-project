import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  arrayUnion,
  arrayRemove,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Get user profile by ID
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      return { success: true, user: userDoc.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user by username
export const getUserByUsername = async (username) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return { success: true, user: userData };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user data
export const updateUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, userData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Follow a user
export const followUser = async (currentUserId, targetUserId) => {
  try {
    if (currentUserId === targetUserId) {
      return { success: false, error: 'You cannot follow yourself' };
    }

    // Update current user's following list
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId)
    });

    // Update target user's followers list
    const targetUserRef = doc(db, 'users', targetUserId);
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUserId)
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Unfollow a user
export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    // Remove from current user's following list
    const currentUserRef = doc(db, 'users', currentUserId);
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId)
    });

    // Remove from target user's followers list
    const targetUserRef = doc(db, 'users', targetUserId);
    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUserId)
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Save a post
export const savePost = async (userId, postId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      savedPosts: arrayUnion(postId)
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Unsave a post
export const unsavePost = async (userId, postId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      savedPosts: arrayRemove(postId)
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get followers for a user
export const getFollowers = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const followers = userDoc.data().followers || [];
    
    // Get detailed information for each follower
    const followersData = [];
    
    for (const followerId of followers) {
      const followerDoc = await getDoc(doc(db, 'users', followerId));
      if (followerDoc.exists()) {
        // Only include necessary user data for display
        const { username, photoURL, uid } = followerDoc.data();
        followersData.push({ username, photoURL, uid });
      }
    }
    
    return { success: true, followers: followersData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get following for a user
export const getFollowing = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const following = userDoc.data().following || [];
    
    // Get detailed information for each following user
    const followingData = [];
    
    for (const followingId of following) {
      const followingDoc = await getDoc(doc(db, 'users', followingId));
      if (followingDoc.exists()) {
        // Only include necessary user data for display
        const { username, photoURL, uid } = followingDoc.data();
        followingData.push({ username, photoURL, uid });
      }
    }
    
    return { success: true, following: followingData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Search users by username (prefix search)
export const searchUsers = async (searchTerm, maxResults = 10) => {
  try {
    // We need to use prefix search since Firestore doesn't support regex
    // This will search for usernames that start with the searchTerm
    const usersRef = collection(db, 'users');
    const endSearchTerm = searchTerm + '\uf8ff'; // This is a high code point in Unicode
    
    const q = query(
      usersRef,
      where('username', '>=', searchTerm),
      where('username', '<=', endSearchTerm),
      orderBy('username'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check if username is available
export const checkUsernameAvailability = async (username) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    return { success: true, isAvailable: querySnapshot.empty };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get basic user info (just username and photo) - for efficient use in posts/comments
export const getUserBasicInfo = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { 
        success: true, 
        userInfo: {
          username: userData.username,
          photoURL: userData.photoURL || 'https://picsum.photos/200/200?random=profile'
        }
      };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get multiple users' basic info at once (for efficiently loading comments, posts, etc.)
export const getBatchUserBasicInfo = async (userIds) => {
  try {
    const uniqueUserIds = [...new Set(userIds)]; // Remove duplicates
    const usersInfo = {};
    
    // Batch get all users' info
    const promises = uniqueUserIds.map(userId => 
      getDoc(doc(db, 'users', userId))
    );
    
    const results = await Promise.all(promises);
    
    results.forEach((userDoc, index) => {
      const userId = uniqueUserIds[index];
      if (userDoc.exists()) {
        const userData = userDoc.data();
        usersInfo[userId] = {
          username: userData.username,
          photoURL: userData.photoURL || 'https://picsum.photos/200/200?random=profile'
        };
      }
    });
    
    return { success: true, usersInfo };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check if a post is saved by the user
export const isPostSaved = async (userId, postId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userDoc.data();
    const savedPosts = userData.savedPosts || [];
    
    return { success: true, isSaved: savedPosts.includes(postId) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete user document from Firestore
export const deleteUserDocument = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    console.log(`User document deleted for user ID: ${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting user document for user ID: ${userId}`, error);
    return { success: false, error: error.message };
  }
}; 