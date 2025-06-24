import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhp4PxAWGKuPwMv8DVlK_jCy48VDO2uK4",
  authDomain: "ecommerce-website-577ff.firebaseapp.com",
  projectId: "ecommerce-website-577ff",
  storageBucket: "ecommerce-website-577ff.firebasestorage.app",
  messagingSenderId: "639480155354",
  appId: "1:639480155354:web:9f455206c02a87a4c729e3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
