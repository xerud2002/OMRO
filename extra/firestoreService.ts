import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

/* ------------------------- USERS ------------------------- */

// Create or update user profile
export async function saveUserProfile(uid: string, data: any) {
  await setDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: Timestamp.now(),
  }, { merge: true });
}

// Get user profile
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/* ------------------------- REQUESTS ------------------------- */

// Create a new move request
export async function createRequest(formData: any) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated.");

  const requestId = `REQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  await setDoc(doc(db, "requests", requestId), {
    ...formData,
    userId: uid,
    status: "new",
    createdAt: Timestamp.now(),
  });

  return requestId;
}

// Get all requests for current user
export async function getMyRequests() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated.");

  const q = query(
    collection(db, "requests"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Update a request
export async function updateRequest(requestId: string, data: any) {
  await updateDoc(doc(db, "requests", requestId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// Delete a request
export async function deleteRequest(requestId: string) {
  await deleteDoc(doc(db, "requests", requestId));
}

/* ------------------------- DRAFTS ------------------------- */

export async function saveDraft(data: any) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated.");
  await setDoc(doc(db, "drafts", uid), {
    formData: data,
    updatedAt: Timestamp.now(),
  }, { merge: true });
}

export async function getDraft() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated.");
  const snap = await getDoc(doc(db, "drafts", uid));
  return snap.exists() ? snap.data() : null;
}

export async function deleteDraft() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated.");
  await deleteDoc(doc(db, "drafts", uid));
}

/* ------------------------- PAYMENTS ------------------------- */

export async function recordPayment(companyId: string, requestId: string, amount: number) {
  await setDoc(doc(db, `requests/${requestId}/payments/${companyId}`), {
    amount,
    paidAt: Timestamp.now(),
  });
}

/* ------------------------- CONTACT ------------------------- */

export async function getContactDetails(requestId: string) {
  const snap = await getDoc(doc(db, `requests/${requestId}/contact/info`));
  return snap.exists() ? snap.data() : null;
}
