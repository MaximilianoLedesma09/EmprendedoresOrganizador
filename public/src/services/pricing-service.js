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
import { validatePriceAmount } from '../utils/validators.js';

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
    pricingConfig: {
      multiplier: 2.30,
      threshold: 7000,
      fixedAdditionBelow: 1000,
      fixedAdditionAbove: 1500,
    },
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

// -------- Configuración de precios --------

// Valores predeterminados del cálculo de precio sugerido.
// Se define como objeto de configuración para poder modificarlo sin
// cambiar la firma de la función.
export const PRICING_DEFAULT = {
  multiplier: 2.30,
  threshold: 7000,
  fixedAdditionBelow: 1000,
  fixedAdditionAbove: 1500,
};

// Configuración actual de precios (se sincroniza con Firestore).
// Inicializada con los valores predeterminados y actualizada al cargar
// la configuración del usuario.
let currentPricingConfig = { ...PRICING_DEFAULT };

// Establece la configuración de precios activa.
//
// Se invoca tras obtener la configuración del usuario desde Firestore
// para que los cálculos de precio sugerido usen los valores personalizados.
export const setPricingConfig = (config) => {
  currentPricingConfig = {
    multiplier: config?.multiplier ?? PRICING_DEFAULT.multiplier,
    threshold: config?.threshold ?? PRICING_DEFAULT.threshold,
    fixedAdditionBelow: config?.fixedAdditionBelow ?? PRICING_DEFAULT.fixedAdditionBelow,
    fixedAdditionAbove: config?.fixedAdditionAbove ?? PRICING_DEFAULT.fixedAdditionAbove,
  };
};

// Devuelve la configuración de precios actualmente activa.
export const getPricingConfig = () => ({ ...currentPricingConfig });

// Calcular precio sugerido comercial aplicando la fórmula aprobada.
//
// costoBase <= 7000:
//   precioSugerido = costoBase * 2.30 + 1000
//
// costoBase > 7000:
//   precioSugerido = costoBase * 2.30 + 1500
export const calcSuggestedPriceCommercial = (costBase) => {
  const validationError = validatePriceAmount(costBase, 'costo base');

  if (validationError) {
    throw new Error(validationError);
  }

  const cost = Number(costBase);

  const multiplier = currentPricingConfig.multiplier;
  const threshold = currentPricingConfig.threshold;
  const fixedAdditionBelow = currentPricingConfig.fixedAdditionBelow;
  const fixedAdditionAbove = currentPricingConfig.fixedAdditionAbove;

  const intermediateValue = cost * multiplier;

  const fixedAddition =
    cost > threshold ? fixedAdditionAbove : fixedAdditionBelow;

  const suggestedPrice = intermediateValue + fixedAddition;

  // Redondeo final al centavo, preservando la fórmula exacta.
  return Math.round(suggestedPrice * 100) / 100;
};

// Devuelve el desglose del cálculo del precio sugerido.
//
// Esta información puede usarse en la vista para mostrar el desglose
// sin duplicar la fórmula.
export const calcSuggestedPriceBreakdown = (costBase) => {
  const validationError = validatePriceAmount(costBase, 'costo base');

  if (validationError) {
    throw new Error(validationError);
  }

  const cost = Number(costBase);

  const multiplier = currentPricingConfig.multiplier;
  const threshold = currentPricingConfig.threshold;
  const fixedAdditionBelow = currentPricingConfig.fixedAdditionBelow;
  const fixedAdditionAbove = currentPricingConfig.fixedAdditionAbove;

  const intermediateValue = cost * multiplier;

  const fixedAddition =
    cost > threshold ? fixedAdditionAbove : fixedAdditionBelow;

  const suggestedPrice = intermediateValue + fixedAddition;

  return {
    costBase: cost,
    multiplier: multiplier,
    threshold,
    fixedAdditionApplied: fixedAddition,
    intermediateValue,
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
    formulaLabel:
      cost > threshold
        ? `costo > ${threshold} ? costo * ${multiplier} + ${fixedAdditionAbove}`
        : `costo <= ${threshold} ? costo * ${multiplier} + ${fixedAdditionBelow}`,
  };
};

// Calcular margen real (%) a partir de costo y precio de venta.
//
// Esta función NO debe cambiarse por la centralización del precio
// sugerido. Se mantiene con el mismo significado original.
export const calcMargin = (cost, salePrice) => {
  const c = Number(cost) || 0;
  const s = Number(salePrice) || 0;
  if (s === 0) return 0;
  return +(((s - c) / s) * 100).toFixed(2);
};

// Calcular ganancia (precio - costo).
//
// Esta función NO debe cambiarse por la centralización del precio
// sugerido. Se mantiene con el mismo significado original.
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