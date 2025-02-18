import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from "firebase/firestore";
import Sidebar from '../components/sideBar';

import TaskCardsList from './HomePage';
import CreateTaskCard from '../components/CreateTaskCard';
import HolaMundo from '../components/CreateUser';
import TaskForm from '../components/TaskForm';
import TaskAnalytics from './TaskAnalytics';

import '../styles/style_dashboard.css';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState<string>('taskcardlist');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          console.log("Usuario logueado:", userDoc.data()?.fullName || "Usuario");
        } catch (error) {
          console.error('Error obteniendo los datos del usuario:', error);
        }
      } else {
        setUser(null);
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
      case 'taskcardlist':
        return <TaskCardsList />;
      case 'createtask':
        return <CreateTaskCard />;
      case 'createuser':
        return <HolaMundo />;
      case 'taskform':
        return <TaskForm />;
      case 'taskanalytics':
        return <TaskAnalytics />;
      default:
        return <TaskCardsList />;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <Sidebar setActiveView={setActiveView} handleLogout={handleLogout} />
      <div className="content-container">
        <div className="content-body">
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
