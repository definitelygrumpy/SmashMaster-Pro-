
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA0isIiOp38Xb2D-VuDv8ey0wt-sfqwQM0",
  authDomain: "badmintour-pro.firebaseapp.com",
  projectId: "badmintour-pro",
  storageBucket: "badmintour-pro.firebasestorage.app",
  messagingSenderId: "853902477802",
  appId: "1:853902477802:web:2cfa7b6ceaf8fb52e74a93",
  databaseURL: "https://badmintour-pro-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
