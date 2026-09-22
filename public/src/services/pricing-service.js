// pricing-service.js
import { db, auth } from './firebase-init.js';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy
} from 'firebase/firestore';

// -------- Configuración del negocio --------

const getBusinessConfigRef = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  return doc(db, 'users', user.uid, 'config', 'business');
};

// Obtener configuración (crea una por defecto si no existe)
export const getBusinessConfig = async () => {
  const ref = getBusinessConfigRef();
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();

  const defaultConfig = {
    businessType: 'revendedor', // 'fabricante' | 'revendedor'
    currency: 'ARS',
    defaultMargin: 30, // porcentaje
  };
  await setDoc(ref, defaultConfig);
  return defaultConfig;
};

// Guardar configuración
export const saveBusinessConfig = async (config) => {
  const ref = getBusinessConfigRef();
  await setDoc(ref, config, { merge: true });
};

// -------- Productos / Insumos --------

const getProductsCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  return collection(db, 'users', user.uid, 'products');
};

// Obtener todos los productos
export const getProducts = async () => {
  const colRef = getProductsCollection();
  const q = query(colRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  const products = [];
  snapshot.forEach(d => products.push({ id: d.id, ...d.data() }));
  return products;
};

// Crear producto
export const createProduct = async (data) => {
  const colRef = getProductsCollection();
  const docRef = await addDoc(colRef, {
    name: data.name || '',
    sku: data.sku || '',
    category: data.category || '',
    type: data.type || 'product', // 'raw' (insumo) | 'product' | 'final'
    unitCost: Number(data.unitCost) || 0,
    salePrice: Number(data.salePrice) || 0,
    margin: Number(data.margin) || 0,
    stock: Number(data.stock) || 0,
    notes: data.notes || '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

// Actualizar producto
export const updateProduct = async (id, data) => {
  const docRef = doc(getProductsCollection(), id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date()
  });
};

// Eliminar producto
export const deleteProduct = async (id) => {
  const docRef = doc(getProductsCollection(), id);
  await deleteDoc(docRef);
};

// -------- Cálculos --------

// Calcular precio de venta sugerido a partir del costo y margen (%)
export const calcSuggestedPrice = (cost, marginPercent) => {
  const c = Number(cost) || 0;
  const m = Number(marginPercent) || 0;
  return +(c * (1 + m / 100)).toFixed(2);
};

// Calcular margen real (%) a partir de costo y precio de venta
export const calcMargin = (cost, salePrice) => {
  const c = Number(cost) || 0;
  const s = Number(salePrice) || 0;
  if (s === 0) return 0;
  return +(((s - c) / s) * 100).toFixed(2);
};

// Calcular ganancia (precio - costo)
export const calcProfit = (cost, salePrice) => {
  return +((Number(salePrice) || 0) - (Number(cost) || 0)).toFixed(2);
};

// Formatear precio según moneda
export const formatCurrency = (value, currency = 'ARS') => {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency
    }).format(value || 0);
  } catch {
    return `$${(value || 0).toFixed(2)}`;
  }
};