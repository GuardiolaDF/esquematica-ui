import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArM4hYO9njIYa_RbLZmT5lHTVqix9PEl0",
  authDomain: "esquematica-ui.firebaseapp.com",
  projectId: "esquematica-ui",
  storageBucket: "esquematica-ui.firebasestorage.app",
  messagingSenderId: "534362941049",
  appId: "1:534362941049:web:e8302f6459349e2e5416a8",
  measurementId: "G-8JDG4J45Z0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
