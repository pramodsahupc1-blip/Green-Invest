import { initFirebase } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Helper to convert phone to email for Firebase Auth
const phoneToEmail = (phone: string) => `${phone}@greeninvest.app`;

export async function registerUser(phone: string, password: string, inviteCode: string, withdrawPassword?: string) {
  const { auth, db } = await initFirebase();
  const email = phoneToEmail(phone);
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user profile in Firestore
  await setDoc(doc(db, "users", user.uid), {
    phone,
    role: "user",
    walletBalance: 0,
    totalRevenue: 0,
    inviteCode: inviteCode || "",
    referredBy: null,
    withdrawPassword: withdrawPassword || "",
    createdAt: new Date().toISOString()
  });

  return user;
}

export async function loginUser(phone: string, password: string) {
  const { auth } = await initFirebase();
  const email = phoneToEmail(phone);
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser() {
  const { auth } = await initFirebase();
  await signOut(auth);
}

export async function getUserProfile(uid: string) {
  const { db } = await initFirebase();
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
}
