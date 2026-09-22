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

const COLLECTION_NAME = 'products';

/*
 * Obtiene la referencia a la colección
 * de productos del usuario actual.
 *
 * Estructura:
 *
 * users/{uid}/products/{productId}
 */
const getProductsCollection = () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Usuario no autenticado.');
  }

  return collection(
    db,
    'users',
    user.uid,
    COLLECTION_NAME
  );
};


/*
 * Crear producto.
 */
export const createProduct = async (productData) => {
  const collectionRef = getProductsCollection();

  const product = {
    name: productData.name.trim(),
    description: productData.description?.trim() || '',
    category: productData.category?.trim() || '',
    imageURL: productData.imageURL || '',

    cost: Number(productData.cost) || 0,
    price: Number(productData.price) || 0,

    stock: Number(productData.stock) || 0,
    minStock: Number(productData.minStock) || 0,

    active: productData.active !== false,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const document = await addDoc(
    collectionRef,
    product
  );

  return {
    id: document.id,
    ...product
  };
};


/*
 * Obtener todos los productos.
 */
export const getProducts = async () => {
  const collectionRef = getProductsCollection();

  const productsQuery = query(
    collectionRef,
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(
    productsQuery
  );

  return snapshot.docs.map(document => ({
    id: document.id,
    ...document.data()
  }));
};


/*
 * Obtener un producto por ID.
 */
export const getProduct = async (productId) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Usuario no autenticado.');
  }

  const productRef = doc(
    db,
    'users',
    user.uid,
    COLLECTION_NAME,
    productId
  );

  const snapshot = await getDoc(productRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
};


/*
 * Actualizar producto.
 */
export const updateProduct = async (
  productId,
  productData
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Usuario no autenticado.');
  }

  const productRef = doc(
    db,
    'users',
    user.uid,
    COLLECTION_NAME,
    productId
  );

  const updates = {
    name: productData.name.trim(),
    description: productData.description?.trim() || '',
    category: productData.category?.trim() || '',
    imageURL: productData.imageURL || '',

    cost: Number(productData.cost) || 0,
    price: Number(productData.price) || 0,

    stock: Number(productData.stock) || 0,
    minStock: Number(productData.minStock) || 0,

    active: productData.active !== false,

    updatedAt: serverTimestamp()
  };

  await updateDoc(
    productRef,
    updates
  );

  return {
    id: productId,
    ...updates
  };
};


/*
 * Eliminar producto.
 */
export const deleteProduct = async (
  productId
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Usuario no autenticado.');
  }

  const productRef = doc(
    db,
    'users',
    user.uid,
    COLLECTION_NAME,
    productId
  );

  await deleteDoc(productRef);

  return true;
};