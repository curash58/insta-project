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
export const registerUser = async (email, password, username) => {
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
      photoURL: null,
      bio: '',
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
    return { success: true, user: userCredential.user };
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
export const getCurrentUser = () => {
  return auth.currentUser;
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

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
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