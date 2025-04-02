import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

export default app;
