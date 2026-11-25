// materials-service.js
// Servicio para el registro de materiales e insumos (modo fabricante).
//
// Estructura en Firestore:
// users/{uid}/materials/{materialId}

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

import { db, auth } from './firebase-init.js';
import { validatePriceAmount } from '../utils/validators.js';

const COLLECTION_NAME = 'materials';

/* Obtiene la referencia a la colección de materiales del usuario actual. */
const getMaterialsCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado.');
  return collection(db, 'users', user.uid, COLLECTION_NAME);
};

/* Crear material. */
export const createMaterial = async (materialData) => {
  const collectionRef = getMaterialsCollection();

  // Validar precio unitario
  const costError = validatePriceAmount(materialData.unitCost, 'Costo unitario');
  if (costError) throw new Error(costError);

  // Validar stock no negativo
  const stock = Number(materialData.stock) || 0;
  if (stock < 0) throw new Error('El stock no puede ser negativo.');

  const material = {
    name: materialData.name.trim(),
    description: materialData.description?.trim() || '',
    unitOfMeasure: materialData.unitOfMeasure || 'unidad',
    unitCost: Number(materialData.unitCost) || 0,
    stock: stock,
    active: materialData.active !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const document = await addDoc(collectionRef, material);
  return { id: document.id, ...material };
};

/* Obtener todos los materiales. */
export const getMaterials = async () => {
  const collectionRef = getMaterialsCollection();
  const materialsQuery = query(collectionRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(materialsQuery);
  return snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
};

/* Obtener un material por ID. */
export const getMaterial = async (materialId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado.');
  const materialRef = doc(db, 'users', user.uid, COLLECTION_NAME, materialId);
  const snapshot = await getDoc(materialRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

/* Actualizar material. */
export const updateMaterial = async (materialId, materialData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado.');

  // Validar precio unitario si se proporciona
  if (materialData.unitCost !== undefined) {
    const costError = validatePriceAmount(materialData.unitCost, 'Costo unitario');
    if (costError) throw new Error(costError);
  }

  // Validar stock no negativo si se proporciona
  if (materialData.stock !== undefined) {
    const stock = Number(materialData.stock);
    if (stock < 0) throw new Error('El stock no puede ser negativo.');
  }

  const materialRef = doc(db, 'users', user.uid, COLLECTION_NAME, materialId);

  const updates = {
    name: materialData.name?.trim(),
    description: materialData.description?.trim() || '',
    unitOfMeasure: materialData.unitOfMeasure || 'unidad',
    unitCost: materialData.unitCost !== undefined ? Number(materialData.unitCost) || 0 : undefined,
    stock: materialData.stock !== undefined ? Number(materialData.stock) || 0 : undefined,
    active: materialData.active !== false,
    updatedAt: serverTimestamp()
  };

  // Eliminar campos undefined para no sobrescribir con undefined
  Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

  await updateDoc(materialRef, updates);
  return { id: materialId, ...updates };
};

/* Eliminar material. */
export const deleteMaterial = async (materialId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado.');
  const materialRef = doc(db, 'users', user.uid, COLLECTION_NAME, materialId);
  await deleteDoc(materialRef);
  return true;
};
