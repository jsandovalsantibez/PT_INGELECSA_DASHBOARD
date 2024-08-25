import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from '../firebase';
import { doc, getDoc } from "firebase/firestore"; // Asegúrate de importar estas funciones de Firestore
import CreateTaskCard from '../components/CreateTaskCard';
import TaskCardsList from '../components/TaskCardsList';
import Header from './Header';
import Sidebar from '../components/sideBar';
import { useNavigate } from 'react-router-dom';


const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const navigate = useNavigate(); // Agregar esto

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log('Usuario autenticado:', currentUser.uid);
        
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          const userRole = userDoc.data()?.role;
          console.log('Rol del usuario:', userRole);
          setRole(userRole);
        } catch (error) {
          console.error('Error obteniendo el rol:', error);
        }
      } else {
        setUser(null);
        setRole('');
        navigate('/login'); // Redirigir al login si no hay usuario
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Sesión cerrada con éxito");
      navigate('/login'); // Redirigir al login después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          <h1>Gestión de Trabajos y Mantenciones</h1>
          <button onClick={handleLogout}>Cerrar Sesión</button>
          <hr />
          {role === 'gerente_operaciones' && <CreateTaskCard />}
          <TaskCardsList userRole={role} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;