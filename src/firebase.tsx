
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Si usas Firestore
import { getAuth } from "firebase/auth"; // Si usas Authentication

const firebaseConfig = {
  apiKey: "AIzaSyAJ3KHo2TM8rvcCtFT7cWqv2ah_DKL1NtU",
  authDomain: "proyectodetitulo-3f8c7.firebaseapp.com",
  projectId: "proyectodetitulo-3f8c7",
  storageBucket: "proyectodetitulo-3f8c7.appspot.com",
  messagingSenderId: "974231405386",
  appId: "1:974231405386:web:dfd96b9a6377da2abb77b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app); // Autenticación

export { firestore, auth };