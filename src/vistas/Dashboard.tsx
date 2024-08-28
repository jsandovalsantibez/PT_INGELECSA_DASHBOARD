import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from '../firebase';
import { doc, getDoc } from "firebase/firestore";
import Sidebar from '../components/sideBar';
import Header from './Header';
import Profile from './Profile';
import TaskCardsList from '../components/TaskCardsList';
import CreateTaskCard from '../components/CreateTaskCard';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [activeView, setActiveView] = useState<string>('taskcardlist'); // Estado para manejar la vista activa

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          const userRole = userDoc.data()?.role;
          setRole(userRole);
        } catch (error) {
          console.error('Error obteniendo el rol:', error);
        }
      } else {
        setUser(null);
        setRole('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Sesión cerrada con éxito");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'profile':
        return <Profile />;
      case 'taskcardlist':
        return <TaskCardsList userRole={role} />;
      case 'createtask':
        return <CreateTaskCard />;
      default:
        return <TaskCardsList userRole={role} />;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="d-flex">
      <Sidebar setActiveView={setActiveView} />
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          <h1>Gestión de Trabajos y Mantenciones</h1>
          <button onClick={handleLogout}>Cerrar Sesión</button>
          <hr />
          
          {/* Renderiza la vista activa según el estado */}
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
