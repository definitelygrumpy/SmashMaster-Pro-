// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0isIiOp38Xb2D-VuDv8ey0wt-sfqwQM0",
  authDomain: "badmintour-pro.firebaseapp.com",
  projectId: "badmintour-pro",
  storageBucket: "badmintour-pro.firebasestorage.app",
  messagingSenderId: "853902477802",
  appId: "1:853902477802:web:2cfa7b6ceaf8fb52e74a93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };