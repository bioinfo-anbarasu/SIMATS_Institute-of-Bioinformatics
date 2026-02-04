import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBHNHOClchpJHUx21hY5l9Ov5QHRXIpx94",
    authDomain: "sr-plot-lite.firebaseapp.com",
    projectId: "sr-plot-lite",
    storageBucket: "sr-plot-lite.firebasestorage.app",
    messagingSenderId: "557465819492",
    appId: "1:557465819492:web:fcace808ba6c27eb4c0271"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
