// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApb-p_DzaRgN2FGcm6X7kXLHJIGQvmoOw",
  authDomain: "pawhub-858e8.firebaseapp.com",
  projectId: "pawhub-858e8",
  storageBucket: "pawhub-858e8.appspot.com",
  messagingSenderId: "1064105879369",
  appId: "1:1064105879369:web:19229d362355cbdfa11c98",
  measurementId: "G-4HCFE4PC1Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
