import React, { useState, useEffect } from 'react';
import { Button, Nav, Modal } from 'react-bootstrap';
import { useAuth } from '../components/AuthContext';
import { ref, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { storage } from '../firebase';
import Profile from '../views/Profile';
import { FaTasks, FaPlus, FaUserPlus, FaClipboardList, FaBars, FaSignOutAlt } from 'react-icons/fa';
import '../styles/style_sidebar.css';

interface SidebarProps {
  setActiveView: (view: string) => void;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveView, handleLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchProfileImage = async () => {
        try {
          const imageRef = ref(storage, `profileImages/${user.uid}`);
          const url = await getDownloadURL(imageRef);
          setPhotoURL(url);
        } catch (error) {
          console.error('Error al cargar la imagen de perfil:', error);
        }
      };

      fetchProfileImage();

      const fetchUserRole = async () => {
        try {
          const db = getFirestore();
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData?.role || null);
          } else {
            console.log('No se encontró el documento del usuario');
          }
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        }
      };

      fetchUserRole();
    }
  }, [user]);

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
  };

  return (
    <div className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
      <div
        className="d-flex flex-column text-white"
        style={{ width: collapsed ? '60px' : '240px', transition: 'width 0.3s', alignItems: 'center' }}
      >
        {/* Imagen de perfil */}
        <div className="profile-image-container text-center mb-4">
          <img
            src={photoURL || 'https://via.placeholder.com/60'}
            alt="Imagen de perfil"
            className="rounded-circle"
          />
        </div>

        {/* Grupo de navegación centrado verticalmente */}
        <div className="flex-grow-1 d-flex flex-column justify-content-start">
          <Nav className="flex-column align-items-center w-100">
            <Nav.Link
              className="sidebar-link d-flex flex-column align-items-center mb-5"
              onClick={() => setActiveView('taskcardlist')}
            >
              <FaTasks className="nav-icons" />
              {!collapsed && <span className="nav-text text-white">Tareas</span>}
            </Nav.Link>
            <Nav.Link
              className="sidebar-link d-flex flex-column align-items-center mb-5"
              onClick={() => setActiveView('taskanalytics')}
            >
              <FaClipboardList className="nav-icons" />
              {!collapsed && <span className="nav-text text-white">Análisis</span>}
            </Nav.Link>
            <Nav.Link
              className="sidebar-link d-flex flex-column align-items-center mb-5"
              onClick={() => setActiveView('taskform')}
            >
              <FaClipboardList className="nav-icons" />
              {!collapsed && <span className="nav-text text-white">Formulario</span>}
            </Nav.Link>
          </Nav>
        </div>

        {/* Separación y segundo grupo de navegación */}
        {userRole === 'gerente_operaciones' && (
          <div className="mt-5">
            <hr className="text-white" />
            <Nav className="flex-column align-items-center w-100">
              <Nav.Link
                className="sidebar-link d-flex flex-column align-items-center mb-5"
                onClick={() => setActiveView('createtask')}
              >
                <FaPlus className="nav-icons" />
                {!collapsed && <span className="nav-text text-white">Crear Tarea</span>}
              </Nav.Link>
              <Nav.Link
                className="sidebar-link d-flex flex-column align-items-center mb-5"
                onClick={() => setActiveView('createuser')}
              >
                <FaUserPlus className="nav-icons" />
                {!collapsed && <span className="nav-text text-white">Gestor de Usuarios</span>}
              </Nav.Link>
            </Nav>
          </div>
        )}
      </div>

      {/* Botón de cerrar sesión */}
      <div className="logout-button-container text-center mb-5">
        <Nav.Link
          className="sidebar-link d-flex flex-column align-items-center"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="nav-icons" />
          {!collapsed && <span className="nav-text text-white">Cerrar Sesión</span>}
        </Nav.Link>
      </div>

      {/* Botón de colapso siempre presente */}
      <div className="mt-auto text-center d-flex justify-content-center align-items-center" style={{ height: '50px' }}>
        <Button variant="link" className="text-white" onClick={() => setCollapsed(!collapsed)}>
          <FaBars size={30} />
        </Button>
      </div>

      {/* Modal del perfil */}
      <Modal show={showProfileModal} onHide={handleCloseProfileModal} size="lg">
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <Profile handleLogout={handleLogout} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Sidebar;