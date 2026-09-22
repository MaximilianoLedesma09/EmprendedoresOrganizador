// firebase-init.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence 
} from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase (usa tus credenciales reales)
const firebaseConfig = {
  apiKey: "AIzaSyC5g2raYDnHxDCISM_4NbCpGRPbj-ToGkA",
  authDomain: "gestor-emprendimiento.firebaseapp.com",
  projectId: "gestor-emprendimiento",
  storageBucket: "gestor-emprendimiento.firebasestorage.app",
  messagingSenderId: "368017852844",
  appId: "1:368017852844:web:d3735512d04d9dbdfdd209"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios
const auth = getAuth(app);
const db = getFirestore(app);      // <-- Ahora solo usamos getFirestore
const storage = getStorage(app);

// Habilitar persistencia offline (caché local)
enableIndexedDbPersistence(db)
  .then(() => console.log('Persistencia offline activada'))
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistencia no disponible en múltiples pestañas');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistencia no soportada por el navegador');
    }
  });

// Configurar persistencia de autenticación (sesión)
export const setAuthPersistence = async (recordar) => {
  const persistence = recordar ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
};

export { auth, db, storage };