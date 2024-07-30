// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQkgyF7CnHBJ3nF2PTI0h4Lb3BmKwhs8I",
  authDomain: "pantry-tracker-app-c938f.firebaseapp.com",
  projectId: "pantry-tracker-app-c938f",
  storageBucket: "pantry-tracker-app-c938f.appspot.com",
  messagingSenderId: "19251254170",
  appId: "1:19251254170:web:36af7d27bd9cbcf78d2023",
  measurementId: "G-PNZW80G2F9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export {firestore};