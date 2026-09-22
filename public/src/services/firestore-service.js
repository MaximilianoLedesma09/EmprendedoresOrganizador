import { db } from './firebase-init.js';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Obtener un documento por ID
export async function getDocument(collectionName, docId) {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}

// Crear o actualizar un documento
export async function setDocument(collectionName, docId, data) {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data, { merge: true });
  return { id: docId, ...data };
}

// Actualizar parcialmente un documento
export async function updateDocument(collectionName, docId, data) {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data);
}

// Eliminar un documento
export async function deleteDocument(collectionName, docId) {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

// Obtener todos los documentos de una colección (con opción de filtro por uid)
export async function getDocuments(collectionName, field, value) {
  const colRef = collection(db, collectionName);
  let q = colRef;
  if (field && value) {
    q = query(colRef, where(field, '==', value));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}