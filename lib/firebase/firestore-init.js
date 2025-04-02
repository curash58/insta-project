import { initializeFirestore } from 'firebase/firestore';
import { app } from '../../config/firebase';

// This file can be used to set up Firestore indexes
// or perform initial setup tasks for the database

/**
 * The following indexes will be needed for this application:
 * 
 * Collection: posts
 * Fields indexed:
 * 1. creatorId + createdAt (desc) - for user posts
 * 2. creatorId (array) + createdAt (desc) - for feed posts
 * 
 * Collection: users
 * Fields indexed:
 * 1. username (asc) - for username search
 * 
 * You can set up these indexes in the Firebase console or using the Firebase CLI.
 * Firebase will also prompt you to create indexes when queries fail due to missing indexes.
 */

// Initialize Firestore with settings
export const initializeFirestoreWithSettings = () => {
  // Enable offline persistence if needed
  const firestoreInstance = initializeFirestore(app, {
    cacheSizeBytes: 50000000, // 50 MB
    ignoreUndefinedProperties: true,
  });
  
  return firestoreInstance;
};

// Function to check if required indexes exist
export const checkRequiredIndexes = async () => {
  // In a real app, you could check for indexes using the Firebase Admin SDK
  // For a client app, this is usually not possible as index management requires admin privileges
  
  console.log('It is recommended to set up the following indexes in your Firebase console:');
  console.log('1. Collection: posts, Fields: creatorId + createdAt (desc)');
  console.log('2. Collection: posts, Fields: creatorId (array) + createdAt (desc)');
  console.log('3. Collection: users, Fields: username (asc)');
};

export default { initializeFirestoreWithSettings, checkRequiredIndexes }; 