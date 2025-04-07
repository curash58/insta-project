import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { initializeFirestoreWithSettings } from "../lib/firebase/firestore-init"; We can survive without this one

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCVlGOA988wS_7yksEtEhdwVdKzuSUxxaA",
    authDomain: "reactnative-ffe6d.firebaseapp.com",
    projectId: "reactnative-ffe6d",
    storageBucket: "reactnative-ffe6d.firebasestorage.app",
    messagingSenderId: "267320336547",
    appId: "1:267320336547:web:95e2801ab5132daeea9f16",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Note: In React Native, auth state is typically persisted automatically
// No need to manually set persistence like in web environments

// Enable Firestore offline persistence
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Firestore offline persistence enabled');
  })
  .catch((error) => {
    console.error('Error enabling Firestore offline persistence:', error);
  });

export default app;
