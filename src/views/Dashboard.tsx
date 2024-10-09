import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db } from '../firebase';  // Importa 'db' en lugar de 'firestore'
import { doc, getDoc } from "firebase/firestore";
import Sidebar from '../components/sideBar';
import TaskCardsList from './HomePage';
import CreateTaskCard from '../components/CreateTaskCard';
import HolaMundo from '../components/CreateUser';
import TaskForm from '../components/TaskForm';
import TaskAnalytics from './TaskAnalytics';  // Importamos el nuevo formulario

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [activeView, setActiveView] = useState<string>('taskcardlist'); 
  const { taskCode } = useParams<{ taskCode: string }>();  // Se añade taskCode para usarlo en TaskForm
  const navigate = useNavigate(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);  // Usa 'db' en lugar de 'firestore'
          const userDoc = await getDoc(userDocRef);
          const userRole = userDoc.data()?.role;
          const userName = userDoc.data()?.fullName || "Usuario";

          console.log("Usuario logueado:", userName);
          console.log(auth.currentUser?.uid);

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
      case 'taskcardlist':
        return <TaskCardsList userRole={role} />;
      case 'createtask':
        return <CreateTaskCard />;
      case 'createuser':
        return <HolaMundo />;
      case 'taskform':  // Nueva vista taskform
        return <TaskForm />;
      case 'taskanalytics':
        return <TaskAnalytics />;
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
        <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
