// utils/storageService.ts
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

/**
 * Upload multiple files and return their URLs
 * @param files File[] array
 * @param folder string (e.g. "requests")
 * @param setProgress optional progress callback
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: string,
  setProgress?: (progress: number) => void
): Promise<string[]> {
  const storage = getStorage(app);
  const urls: string[] = [];
  const total = files.length;
  let completed = 0;

  for (const file of files) {
    const url = await uploadSingleFile(file, folder, (progress) => {
      const overall = ((completed + progress / 100) / total) * 100;
      if (setProgress) setProgress(overall);
    }, storage);
    urls.push(url);
    completed++;
  }

  if (setProgress) setProgress(100);
  return urls;
}

/**
 * Upload a single file to Firebase Storage
 * @param file File
 * @param folder Folder name
 * @param onProgress Callback for upload percentage
 * @param storage Optional custom instance
 */
async function uploadSingleFile(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void,
  storage = getStorage(app)
): Promise<string> {
  return new Promise((resolve, reject) => {
    const path = `${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(percent);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}
