import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom'; 
import { auth, firestore } from '../firebase';
import { doc, getDoc } from "firebase/firestore";
import Sidebar from '../components/sideBar';
import Header from './Header';
import Profile from './Profile';
import TaskCardsList from '../components/TaskCardsList';
import CreateTaskCard from '../components/CreateTaskCard';
import HolaMundo from '../components/CreateUser'; // Importa la vista HolaMundo

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [activeView, setActiveView] = useState<string>('taskcardlist'); 
  const navigate = useNavigate(); 

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
      navigate('/'); 
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
      case 'createuser':
        return <HolaMundo />;
      default:
        return <TaskCardsList userRole={role} />;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar setActiveView={setActiveView} handleLogout={handleLogout} />
      <div className="flex-grow-1 d-flex flex-column">
        <Header />
        <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
