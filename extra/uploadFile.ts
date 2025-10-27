import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTask,
  UploadTaskSnapshot,
  StorageError,
  UploadMetadata,
} from "firebase/storage";
import { auth, storage, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Uploads a file to Firebase Storage with metadata, progress tracking, and Firestore logging.
 *
 * @param file - The file object (from input[type=file] or drag-drop)
 * @param pathType - "uploads" | "chat" | "companies"
 * @param requestId - Optional request ID (for move/chat attachments)
 * @param onProgress - Optional callback(progressPercent: number)
 * @returns Promise<string> - download URL of the uploaded file
 */
export async function uploadFile(
  file: File,
  pathType: "uploads" | "chat" | "companies" = "uploads",
  requestId?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated.");

      // ✅ Build file path dynamically
      const safeName = file.name.replace(/\s+/g, "_");
      let path = `${pathType}/${safeName}`;

      if (pathType === "uploads" && requestId) {
        path = `uploads/${requestId}/${Date.now()}_${safeName}`;
      } else if (pathType === "chat" && requestId) {
        path = `chat/${requestId}/${currentUser.uid}_${Date.now()}_${safeName}`;
      } else if (pathType === "companies") {
        path = `companies/${currentUser.uid}/${Date.now()}_${safeName}`;
      }

      // ✅ Metadata (helps identify who uploaded & when)
      const metadata: UploadMetadata = {
        customMetadata: {
          uploaderUid: currentUser.uid,
          uploaderEmail: currentUser.email || "",
          uploadedAt: new Date().toISOString(),
          pathType,
          requestId: requestId || "-",
        },
      };

      // ✅ Start upload
      const storageRef = ref(storage, path);
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        "state_changed",
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error: StorageError) => {
          console.error("❌ Upload failed:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // ✅ Log in Firestore (optional but great for admin tracking)
          try {
            await setDoc(
              doc(db, "uploads_log", `${currentUser.uid}_${Date.now()}`),
              {
                fileName: file.name,
                fileType: file.type,
                path,
                downloadURL,
                uploaderUid: currentUser.uid,
                uploaderEmail: currentUser.email,
                pathType,
                requestId: requestId || "-",
                createdAt: serverTimestamp(),
              }
            );
          } catch (logErr) {
            console.warn("⚠️ Failed to write upload log:", logErr);
          }

          resolve(downloadURL);
        }
      );
    } catch (err) {
      console.error("⚠️ uploadFile error:", err);
      reject(err);
    }
  });
}
