import React, { useState, useEffect } from 'react';
import { Button, Nav, Modal } from 'react-bootstrap';
import { useAuth } from '../components/AuthContext';
import { ref, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { storage } from '../firebase';
import Profile from '../views/Profile';
import { FaTasks, FaPlus, FaUserPlus, FaClipboardList, FaBars } from 'react-icons/fa';

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
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        className={`d-flex flex-column bg-dark text-white p-3 ${collapsed ? 'collapsed-sidebar' : ''}`}
        style={{ width: collapsed ? '80px' : '250px', transition: 'width 0.3s', alignItems: 'center' }}
      >
        {/* Imagen de perfil y nombre de usuario */}
        <div className="text-center mb-5" style={{ cursor: 'pointer' }} onClick={handleProfileClick}>
          <img
            src={photoURL || 'https://via.placeholder.com/150'}
            alt="Imagen de perfil"
            className="rounded-circle"
            style={{
              width: collapsed ? '40px' : '100px',
              height: collapsed ? '40px' : '100px',
              objectFit: 'cover',
            }}
          />
          {!collapsed && <h5 className="mt-2" style={{ fontSize: '1.3em' }}>{user?.displayName}</h5>}
        </div>

        {/* Grupo de navegación centrado verticalmente */}
        <div className="flex-grow-1 d-flex flex-column justify-content-center">
          <Nav className="flex-column align-items-center">
            <Nav.Link
              className="text-white d-flex align-items-center justify-content-center mb-4"
              style={{ width: '100%', textAlign: 'center' }}
              onClick={() => setActiveView('taskcardlist')}
            >
              <FaTasks size={collapsed ? 30 : 45} />
              {!collapsed && <span className="ms-3" style={{ fontSize: '22px' }}>Task</span>}
            </Nav.Link>
            <Nav.Link
              className="text-white d-flex align-items-center justify-content-center mb-4"
              style={{ width: '100%', textAlign: 'center' }}
              onClick={() => setActiveView('taskanalytics')}
            >
              <FaClipboardList size={collapsed ? 30 : 45} />
              {!collapsed && <span className="ms-3" style={{ fontSize: '22px' }}>Análisis</span>}
            </Nav.Link>
            <Nav.Link
              className="text-white d-flex align-items-center justify-content-center mb-4"
              style={{ width: '100%', textAlign: 'center' }}
              onClick={() => setActiveView('taskform')}
            >
              <FaClipboardList size={collapsed ? 30 : 45} />
              {!collapsed && <span className="ms-3" style={{ fontSize: '22px' }}>Formulario</span>}
            </Nav.Link>
          </Nav>
        </div>

        {/* Separación y segundo grupo de navegación */}
        {userRole === 'gerente_operaciones' && (
          <div className="mt-4">
            <hr className="text-white" />
            <Nav className="flex-column align-items-center">
              <Nav.Link
                className="text-white d-flex align-items-center justify-content-center mb-4"
                style={{ width: '100%', textAlign: 'center' }}
                onClick={() => setActiveView('createtask')}
              >
                <FaPlus size={collapsed ? 30 : 45} />
                {!collapsed && <span className="ms-3" style={{ fontSize: '22px' }}>Crear Tarea</span>}
              </Nav.Link>
              <Nav.Link
                className="text-white d-flex align-items-center justify-content-center mb-4"
                style={{ width: '100%', textAlign: 'center' }}
                onClick={() => setActiveView('createuser')}
              >
                <FaUserPlus size={collapsed ? 30 : 45} />
                {!collapsed && <span className="ms-3" style={{ fontSize: '22px' }}>Gestor de Usuarios</span>}
              </Nav.Link>
            </Nav>
          </div>
        )}

        {/* Botón de colapso siempre presente */}
        <div className="mt-auto text-center d-flex justify-content-center align-items-center" style={{ height: '60px' }}>
          <Button variant="link" className="text-white" onClick={() => setCollapsed(!collapsed)}>
            <FaBars size={collapsed ? 25 : 30} />
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
    </div>
  );
};

export default Sidebar;
