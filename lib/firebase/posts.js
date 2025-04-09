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
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
    console.log('Creating post with userId:', userId);
    
    if (!userId) {
      console.error('userId is undefined or null');
      return { success: false, error: 'User ID is required to create a post' };
    }
    
    // Upload image
    console.log('Uploading post image...');
    const imageURL = await uploadPostImage(imageUri, userId);
    console.log('Image uploaded successfully:', imageURL);

    // Create post document
    console.log('Creating post document in Firestore...');
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
    
    console.log('New post data:', newPost);
    const postDocRef = await addDoc(postsRef, newPost);
    const postId = postDocRef.id;
    console.log('Post created with ID:', postId);
    
    // Add post ID to the post document itself
    await updateDoc(postDocRef, { id: postId });
    
    // Add post ID to user's posts list
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      postsIds: arrayUnion(postId)
    });
    
    return { success: true, postId };
  } catch (error) {
    console.error('Error in createPost:', error);
    return { success: false, error: error.message };
  }
};

// Upload post image
const uploadPostImage = async (uri, userId) => {
  try {
    console.log('Starting image upload for user:', userId);
    
    if (!userId) {
      console.error('userId is undefined or null in uploadPostImage');
      throw new Error('User ID is required to upload an image');
    }
    
    // Convert image URI to blob
    console.log('Converting image URI to blob...');
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create a unique filename
    const filename = `post_${userId}_${Date.now()}`;
    console.log('Generated filename:', filename);
    
    const storageRef = ref(storage, `post_images/${filename}`);
    console.log('Storage reference created');
    
    // Upload the image
    console.log('Uploading image to Firebase Storage...');
    await uploadBytes(storageRef, blob);
    console.log('Image uploaded successfully to Firebase Storage');
    
    // Get the download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL obtained:', downloadURL);
    
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

// Get all posts except those created by the current user
export const getAllPostsExceptCurrentUser = async (currentUserId) => {
  try {
    console.log('Fetching all posts except those created by user:', currentUserId);
    
    if (!currentUserId) {
      console.error('currentUserId is undefined or null');
      return { success: false, error: 'Current user ID is required' };
    }
    
    // Get all posts ordered by creation date
    const postsRef = collection(db, 'posts');
    
    // Use a different approach: get posts in batches and filter
    // This avoids the need for a composite index
    const q = query(
      postsRef,
      orderBy('createdAt', 'desc'),
      limit(50) // Limit to avoid loading too many posts at once
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    // Filter out posts created by the current user
    querySnapshot.forEach((doc) => {
      const postData = doc.data();
      if (postData.creatorId !== currentUserId) {
        posts.push(postData);
      }
    });
    
    console.log(`Found ${posts.length} posts from other users`);
    
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
    console.error('Error in getAllPostsExceptCurrentUser:', error);
    return { success: false, error: error.message };
  }
};

// Delete all posts and associated images for a user
export const deleteUserPosts = async (userId) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('creatorId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    let deletedCount = 0;
    const deletionPromises = [];

    querySnapshot.forEach(doc => {
      const post = doc.data();
      const postId = doc.id;

      // 1. Delete Firestore post document
      batch.delete(doc.ref);
      deletedCount++;

      // 2. Delete associated image from Storage if it exists
      if (post.imageURL) {
        try {
          // Extract the path from the URL
          // Example URL: https://firebasestorage.googleapis.com/v0/b/your-bucket.appspot.com/o/post_images%2FuserId%2FimageId?alt=media&token=...
          // We need the path: post_images/userId/imageId
          const path = decodeURIComponent(post.imageURL.split('/o/')[1].split('?alt=')[0]);
          const imageRef = ref(storage, path);
          deletionPromises.push(deleteObject(imageRef));
        } catch (imgError) {
          console.warn(`Could not parse or queue deletion for image URL: ${post.imageURL} for post ${postId}`, imgError);
          // Don't block the whole process if one image fails
        }
      }
      
      // TODO: Delete comments associated with the post? 
      // This might be complex and slow. Decide if needed.
      // If so, add another helper: deletePostComments(postId)
    });
    
    // Execute Firestore batch delete
    await batch.commit();
    console.log(`Deleted ${deletedCount} Firestore posts for user ID: ${userId}`);
    
    // Execute Storage image deletions
    await Promise.all(deletionPromises);
    console.log(`Deleted ${deletionPromises.length} associated images from Storage for user ID: ${userId}`);

    return { success: true, deletedPosts: deletedCount, deletedImages: deletionPromises.length };

  } catch (error) {
    console.error(`Error deleting posts for user ID: ${userId}`, error);
    return { success: false, error: error.message };
  }
};

// Remove all comments by a specific user from all posts
export const removeUserCommentsFromPosts = async (userId) => {
  try {
    console.log(`Removing comments by user ${userId} from all posts...`);
    const postsRef = collection(db, 'posts');
    const q = query(postsRef); // Query all posts
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    let postsUpdatedCount = 0;
    let commentsRemovedCount = 0;

    querySnapshot.forEach(doc => {
      const post = doc.data();
      const postId = doc.id;
      const originalComments = post.comments || [];
      
      // Filter out comments made by the user
      const updatedComments = originalComments.filter(comment => comment.userId !== userId);

      // If comments were removed, update the post document in the batch
      if (originalComments.length > updatedComments.length) {
        batch.update(doc.ref, { comments: updatedComments });
        postsUpdatedCount++;
        commentsRemovedCount += (originalComments.length - updatedComments.length);
        console.log(`   Queued update for post ${postId}: Removed ${originalComments.length - updatedComments.length} comments.`);
      }
    });

    // Commit the batch update if any posts were modified
    if (postsUpdatedCount > 0) {
      await batch.commit();
      console.log(`Successfully removed ${commentsRemovedCount} comments by user ${userId} from ${postsUpdatedCount} posts.`);
    } else {
      console.log(`No comments found by user ${userId} in any posts.`);
    }

    return { success: true, postsUpdated: postsUpdatedCount, commentsRemoved: commentsRemovedCount };

  } catch (error) {
    console.error(`Error removing comments by user ${userId} from posts:`, error);
    return { success: false, error: error.message };
  }
}; 