import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
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