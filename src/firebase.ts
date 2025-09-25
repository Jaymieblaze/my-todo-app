import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhhEtueD44Y1npjPtJ3_3nDTbyMnLvf9Y",
  authDomain: "mytodoapp-f521e.firebaseapp.com",
  projectId: "mytodoapp-f521e",
  storageBucket: "mytodoapp-f521e.firebasestorage.app",
  messagingSenderId: "48707429602",
  appId: "1:48707429602:web:c6a27c5221188256c56abb",
  measurementId: "G-08Y48QRF4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const firestore = getFirestore(app);
