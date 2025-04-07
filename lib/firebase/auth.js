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
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

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

// Update user email
export const updateUserEmail = async (newEmail, currentPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Reauthenticate user before updating email
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
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

// Update user password
export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Reauthenticate user before updating password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password in Firebase Auth
    await updatePassword(user, newPassword);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete user account
export const deleteUserAccount = async (currentPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    // Reauthenticate user before deleting account
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', user.uid));
    
    // Delete user from Firebase Auth
    await deleteUser(user);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}; 