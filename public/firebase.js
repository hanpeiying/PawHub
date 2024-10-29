import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { firebaseConfig } from "../configure.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };

// Use/Import the functions you need from the SDKs
//import { app } from "../firebase.js";
// import { getAnalytics } from "firebase/analytics" ;
// import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
// import { getFirestore, doc, setDoc, getDoc} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
// import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Use these to utilise the imports
// const analytics = getAnalytics(app);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);
