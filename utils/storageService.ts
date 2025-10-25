import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import app from "./firebase";

/**
 * Upload multiple files to Firebase Storage and return their download URLs
 * @param files Array of File objects
 * @param folder Folder path (e.g. "uploads/requests")
 * @param setProgress Optional progress callback (0–100)
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: string,
  setProgress?: (progress: number) => void
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const storage = getStorage(app);
  const urls: string[] = [];
  const total = files.length;
  let completed = 0;

  for (const file of files) {
    const url = await uploadSingleFile(
      file,
      folder,
      (progress) => {
        const overall = ((completed + progress / 100) / total) * 100;
        if (setProgress) setProgress(overall);
      },
      storage
    );
    urls.push(url);
    completed++;
  }

  if (setProgress) setProgress(100);
  return urls;
}

/**
 * Upload a single file with progress tracking
 * @param file File object
 * @param folder Folder name in Firebase Storage
 * @param onProgress Optional callback for upload progress (0–100)
 * @param storage Optional custom storage instance
 */
async function uploadSingleFile(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void,
  storage = getStorage(app)
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const safeName = file.name.replace(/\s+/g, "_"); // avoid spaces
      const path = `${folder}/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(percent);
        },
        (error) => {
          console.error("❌ Upload error:", error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("✅ Uploaded:", url);
          resolve(url);
        }
      );
    } catch (err) {
      console.error("❌ Unexpected upload error:", err);
      reject(err);
    }
  });
}

/**
 * Delete a file from Firebase Storage by path or full URL
 * @param pathOrUrl Either full download URL or storage path
 */
export async function deleteFileFromStorage(pathOrUrl: string): Promise<void> {
  try {
    const storage = getStorage(app);
    let fileRef;

    if (pathOrUrl.startsWith("http")) {
      // Convert URL to ref
      const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/`;
      const path = decodeURIComponent(pathOrUrl.replace(baseUrl, "").split("?")[0]);
      fileRef = ref(storage, path);
    } else {
      fileRef = ref(storage, pathOrUrl);
    }

    await deleteObject(fileRef);
    console.log(`🗑️ File deleted: ${pathOrUrl}`);
  } catch (error: any) {
    console.error("❌ Error deleting file:", error?.message || error);
  }
}
