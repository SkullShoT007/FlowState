// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUTMsez4MV8MzjQbRm2SK_J4B4ExqMPqA",
  authDomain: "flowstate-d68ee.firebaseapp.com",
  projectId: "flowstate-d68ee",
  storageBucket: "flowstate-d68ee.firebasestorage.app",
  messagingSenderId: "81212476768",
  appId: "1:81212476768:web:8b99842a14f6143caa6205"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth(app)

export const provider = new GoogleAuthProvider()