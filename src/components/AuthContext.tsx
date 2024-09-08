import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase';  // Importa 'db' en lugar de 'firestore'
import { doc, getDoc } from 'firebase/firestore';  // Para interactuar con Firestore

// Define el tipo para el contexto
interface AuthContextType {
  user: User | null;
  role: string | null;
}

// Crear el contexto con el tipo definido
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para acceder al contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Componente Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);  // Usa 'db' en lugar de 'firestore'
          const userDoc = await getDoc(userDocRef);
          setRole(userDoc.data()?.role || null);
        } catch (error) {
          console.error('Error obteniendo el rol:', error);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role }}>
      {children}
    </AuthContext.Provider>
  );
};
