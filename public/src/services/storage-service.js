import { storage } from './firebase-init.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Subir un archivo (imagen) a una ruta específica
export async function uploadFile(path, file) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
}

// Obtener la URL de un archivo
export async function getFileURL(path) {
  const fileRef = ref(storage, path);
  return await getDownloadURL(fileRef);
}

// Eliminar un archivo
export async function deleteFile(path) {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}