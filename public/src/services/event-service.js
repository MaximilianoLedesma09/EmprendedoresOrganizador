// event-service.js
import { db, auth } from './firebase-init.js';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// Obtener referencia a la colección de eventos del usuario actual
const getEventsCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuario no autenticado');
  return collection(db, 'users', user.uid, 'events');
};

// Crear un nuevo evento
export const createEvent = async (eventData) => {
  const colRef = getEventsCollection();
  const docRef = await addDoc(colRef, {
    ...eventData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

// Actualizar un evento existente
export const updateEvent = async (eventId, updatedData) => {
  const docRef = doc(getEventsCollection(), eventId);
  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: new Date()
  });
};

// Eliminar un evento
export const deleteEvent = async (eventId) => {
  const docRef = doc(getEventsCollection(), eventId);
  await deleteDoc(docRef);
};

// Obtener eventos en un rango de fechas (inicio y fin)
export const getEventsInRange = async (startDate, endDate) => {
  const colRef = getEventsCollection();
  const q = query(
    colRef,
    where('startDate', '>=', startDate),
    where('startDate', '<=', endDate),
    orderBy('startDate', 'asc')
  );
  const snapshot = await getDocs(q);
  const events = [];
  snapshot.forEach(doc => {
    events.push({ id: doc.id, ...doc.data() });
  });
  return events;
};

// Obtener eventos de un día específico (fecha)
export const getEventsForDay = async (date) => {
  // date es un objeto Date, establecemos inicio y fin del día
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return getEventsInRange(start, end);
};

// Obtener eventos de un mes (para vista mensual)
export const getEventsForMonth = async (year, month) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return getEventsInRange(start, end);
};