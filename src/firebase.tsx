
// firebase.tsx
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';  // Firestore
import { getAuth } from 'firebase/auth';  // Autenticación
import { getStorage } from 'firebase/storage';  // Storage

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAJ3KHo2TM8rvcCtFT7cWqv2ah_DKL1NtU",
  authDomain: "proyectodetitulo-3f8c7.firebaseapp.com",
  projectId: "proyectodetitulo-3f8c7",
  storageBucket: "proyectodetitulo-3f8c7.appspot.com",
  messagingSenderId: "974231405386",
  appId: "1:974231405386:web:dfd96b9a6377da2abb77b3"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa servicios
const db = getFirestore(app);  // Firestore
const auth = getAuth(app);  // Autenticación
const storage = getStorage(app);  // Almacenamiento

// Exporta servicios para usarlos en el resto de la app
export { db, auth, storage };
