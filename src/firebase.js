// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics"; // Import isSupported for conditional analytics initialization
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Function to initialize analytics
async function initializeAnalytics(app) {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
}

const analytics = initializeAnalytics(app);

// Export Firestore (and analytics if needed)
export { firestore, analytics };
