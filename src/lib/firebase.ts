import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Fetch the Firebase configuration dynamically
let app: any;
let db: any;
let auth: any;

export async function initFirebase() {
  if (app) return { app, db, auth };
  
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    return { app, db, auth };
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw error;
  }
}
