import { auth } from "@/config/firebaseConfig";
import {
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

/**
 * Listen for Firebase authentication state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Logs out the current user
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
