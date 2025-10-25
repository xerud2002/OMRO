// utils/storageService.ts
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import app from "./firebase"; // ✅ import corect (nu cu acolade)

/**
 * 📦 Upload multiple files to Firebase Storage and return their download URLs.
 * Compatible with cereri clienți / companii / admin uploads.
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
 * 🧩 Upload a single file to Firebase Storage with progress tracking.
 * Automatically sanitizes filenames and returns the public download URL.
 */
export async function uploadSingleFile(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void,
  storage = getStorage(app)
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (!file) throw new Error("Fișier invalid sau inexistent.");

      const sanitizedName = file.name.replace(/[^\w.()-]/g, "_");
      const path = `${folder}/${Date.now()}_${sanitizedName}`;
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
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("✅ Uploaded:", url);
            resolve(url);
          } catch (err) {
            console.error("❌ Error getting download URL:", err);
            reject(err);
          }
        }
      );
    } catch (err) {
      console.error("❌ Unexpected upload error:", err);
      reject(err);
    }
  });
}

/**
 * 🗑️ Delete a file from Firebase Storage by path or full URL.
 */
export async function deleteFileFromStorage(pathOrUrl: string): Promise<void> {
  try {
    const storage = getStorage(app);
    let fileRef;

    if (pathOrUrl.startsWith("http")) {
      // Convert download URL → storage ref
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
