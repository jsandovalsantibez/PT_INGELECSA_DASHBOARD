import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, useParams } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { doc, getDoc } from "firebase/firestore";
import Sidebar from '../components/sideBar';
import Header from '../views/Header';
import Profile from '../views/Profile';
import TaskCardsList from '../components/TaskCardsList';
import CreateTaskCard from '../components/CreateTaskCard';
import HolaMundo from '../components/CreateUser';
import TaskPlan from '../components/TaskPlan'; // Importa la vista TaskPlan
import UserList from '../components/UserList'; // Importamos el componente UserList

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('');
  const [activeView, setActiveView] = useState<string>('taskcardlist'); 
  const { taskId } = useParams<{ taskId: string }>();  // Para obtener el ID de la tarea desde la URL
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
        return (
          <div className="d-flex">
            <div style={{ flex: 2 }}>
              <TaskCardsList userRole={role} />
            </div>
            <div style={{ flex: 1, marginLeft: '20px' }}>
              <UserList />
            </div>
          </div>
        );
      case 'createtask':
        return <CreateTaskCard />;
      case 'createuser':
        return <HolaMundo />;
      case 'taskplan':  // Nueva vista para TaskPlan
        return <TaskPlan taskId={taskId || ''} />; // Asegúrate de pasar taskId, usa una cadena vacía si es undefined
      default:
        return (
          <div className="d-flex">
            <div style={{ flex: 2 }}>
              <TaskCardsList userRole={role} />
            </div>
            <div style={{ flex: 1, marginLeft: '20px' }}>
              <UserList />
            </div>
          </div>
        );
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
