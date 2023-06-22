// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore"; // 추가

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAK_YkdPrCwPcisic4etNQUkXWe9fSpXik",
  authDomain: "spatialoffice-88961.firebaseapp.com",
  projectId: "spatialoffice-88961",
  storageBucket: "spatialoffice-88961.appspot.com",
  messagingSenderId: "36953804653",
  appId: "1:36953804653:web:51eee62f3c2e9c51d1d464"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore 인스턴스 추가

export default app;
