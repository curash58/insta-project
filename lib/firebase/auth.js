import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { deleteUserDocument } from './users';
import { deleteUserPosts, removeUserCommentsFromPosts } from './posts';
import { deleteUserComments } from './comments';

// Register a new user
export const registerUser = async (email, password, username, additionalData = {}) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with username
    await updateProfile(user, {
      displayName: username
    });
    
    // Store user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      username: username,
      photoURL: additionalData.photoURL || null,
      bio: additionalData.bio || '',
      createdAt: new Date(),
      postsIds: [],
      savedPosts: [],
      followers: [],
      following: []
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Update the user object with Firestore data
      user.userData = userData;
      
      return { success: true, user };
    } else {
      // If user document doesn't exist in Firestore, create it
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        username: user.displayName || 'user_' + user.uid.substring(0, 5),
        photoURL: null,
        bio: '',
        createdAt: new Date(),
        postsIds: [],
        savedPosts: [],
        followers: [],
        following: []
      });
      
      // Add the created user data to the user object
      user.userData = {
        uid: user.uid,
        email: email,
        username: user.displayName || 'user_' + user.uid.substring(0, 5),
        photoURL: null,
        bio: '',
        createdAt: new Date(),
        postsIds: [],
        savedPosts: [],
        followers: [],
        following: []
      };
      
      return { success: true, user };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    console.log('getCurrentUser called');
    const user = auth.currentUser;
    console.log('Auth current user:', user ? `User ID: ${user.uid}` : 'No user');
    
    if (!user) {
      console.log('No user currently logged in');
      return null;
    }
    
    // Always fetch fresh user data from Firestore
    console.log('Fetching fresh user data from Firestore for user ID:', user.uid);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User data from Firestore:', userData);
      
      // Create a new user object with the Firestore data
      const userWithData = {
        ...user,
        userData: userData
      };
      
      // Ensure photoURL is available at the top level for compatibility
      if (userData.photoURL) {
        userWithData.photoURL = userData.photoURL;
      }
      
      return userWithData;
    } else {
      console.log('No user document found in Firestore for user ID:', user.uid);
      return user;
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

// Send email verification
export const sendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Listen for auth state changes
export const onAuthStateChange = (callback) => {
  console.log('Setting up auth state change listener');
  return onAuthStateChanged(auth, async (user) => {
    console.log('Auth state changed:', user ? `User ID: ${user.uid}` : 'No user');
    
    if (user) {
      try {
        // Fetch user data from Firestore
        console.log('Fetching user data from Firestore for user ID:', user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data from Firestore:', userData);
          
          // Create a new user object with the Firestore data
          const userWithData = {
            ...user,
            userData: userData
          };
          
          // Call the callback with the user object that includes Firestore data
          callback(userWithData);
        } else {
          console.log('No user document found in Firestore for user ID:', user.uid);
          callback(user);
        }
      } catch (error) {
        console.error('Error fetching user data on auth state change:', error);
        callback(user);
      }
    } else {
      callback(null);
    }
  });
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    const updates = {};
    
    // Update displayName if provided
    if (userData.username) {
      await updateProfile(user, {
        displayName: userData.username
      });
      updates.username = userData.username;
    }
    
    // Update photoURL if provided
    if (userData.photoURL) {
      await updateProfile(user, {
        photoURL: userData.photoURL
      });
      updates.photoURL = userData.photoURL;
    }
    
    // Update other fields in Firestore
    if (Object.keys(updates).length > 0 || userData.bio) {
      if (userData.bio) updates.bio = userData.bio;
      
      await updateDoc(doc(db, 'users', user.uid), updates);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Helper to re-authenticate
const reauthenticate = async (password) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in for re-authentication.');
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
};

// Update user email (requires re-authentication)
export const updateUserEmail = async (currentPassword, newEmail) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Reauthenticate user before updating email
    await reauthenticate(currentPassword);
    
    // Update email in Firebase Auth
    await updateEmail(user, newEmail);
    
    // Update email in Firestore
    await updateDoc(doc(db, 'users', user.uid), {
      email: newEmail
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user password (requires re-authentication)
export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Reauthenticate user before updating password
    await reauthenticate(currentPassword);
    
    // Update password in Firebase Auth
    await updatePassword(user, newPassword);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete user account (requires re-authentication and deletes associated data)
export const deleteUserAccountAndAssociatedData = async (currentPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user currently logged in.' };
    }
    const userId = user.uid;

    // 1. Re-authenticate the user
    console.log(`Re-authenticating user ${userId}...`);
    await reauthenticate(currentPassword);
    console.log(`User ${userId} re-authenticated successfully.`);

    // 2. Delete associated data
    console.log(`Deleting associated data for user ${userId}...`);
    
    // First, remove user's comments from all posts
    const removeCommentsResult = await removeUserCommentsFromPosts(userId);
    if (!removeCommentsResult.success) {
      // Log the error but continue with deletion for now
      console.error(`Failed to remove comments for user ${userId}: ${removeCommentsResult.error}`);
      // Optionally, you could decide to stop the process here
      // return { success: false, error: `Failed to remove comments: ${removeCommentsResult.error}` };
    }
    
    // Then, delete user's posts and user document in parallel
    const deletePromises = [
      deleteUserPosts(userId),
      deleteUserDocument(userId) 
    ];
    
    const results = await Promise.allSettled(deletePromises);

    // Log results and check for failures
    let dataDeletionFailed = false;
    // Log result for comment removal (already done, just logging status)
    if (!removeCommentsResult.success) {
        dataDeletionFailed = true;
        console.error(`Failed to remove comments for user ${userId}:`, removeCommentsResult.error);
    } else {
        console.log(`Successfully removed comments for user ${userId}.`);
    }
    
    results.forEach((result, index) => {
      const operation = ['posts', 'user document'][index]; // Updated operations array
      if (result.status === 'fulfilled' && result.value.success) {
        console.log(`Successfully deleted ${operation} for user ${userId}.`);
      } else {
        dataDeletionFailed = true;
        const errorMsg = result.status === 'fulfilled' ? result.value.error : result.reason;
        console.error(`Failed to delete ${operation} for user ${userId}:`, errorMsg);
      }
    });

    if (dataDeletionFailed) {
      console.warn(`Data deletion partially failed for user ${userId}. Proceeding with auth deletion.`);
      // Optionally, return a specific error indicating partial failure
      // return { success: false, error: 'Partial data deletion failed. Auth record not deleted.' };
    }

    // 3. Delete the user's authentication record
    console.log(`Deleting auth record for user ${userId}...`);
    await deleteUser(user);
    console.log(`Successfully deleted auth record for user ${userId}.`);

    return { success: true };

  } catch (error) {
    console.error(`Error deleting user account for user ${userId}:`, error);
    if (error.code === 'auth/requires-recent-login') {
      return { 
        success: false, 
        error: 'This operation requires recent login. Please log out and log back in.',
        code: error.code 
      };
    }
    if (error.code === 'auth/wrong-password') {
       return { 
        success: false, 
        error: 'Incorrect current password.',
        code: error.code 
      };
    }
    return { success: false, error: error.message, code: error.code || 'unknown' };
  }
};

// Send password reset email
export const requestPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}; 