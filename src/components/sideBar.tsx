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

  // Cargar la imagen de perfil desde Firebase Storage
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

      // Obtener el rol del usuario desde Firestore
      const fetchUserRole = async () => {
        try {
          const db = getFirestore();
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData?.role || null); // Establecer el rol del usuario
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
        style={{ width: collapsed ? '80px' : '250px', transition: 'width 0.3s' }}
      >
        {/* Header del Sidebar */}
        <div className="sidebar-header mb-4 d-flex align-items-center">
          <Button variant="link" className="text-white" onClick={() => setCollapsed(!collapsed)}>
            <FaBars size={30} />
          </Button>
          <span className={`ms-2 ${collapsed ? 'd-none' : ''}`} style={{ fontSize: '20px' }}>IngeApp</span>
        </div>

        {/* Primer grupo de navegación */}
        <Nav className="flex-column mb-4">
          <Nav.Link className="text-white d-flex align-items-center" onClick={() => setActiveView('taskcardlist')}>
            <FaTasks size={30} />
            <span className={`ms-3 ${collapsed ? 'd-none' : ''}`} style={{ fontSize: '18px' }}>Task</span>
          </Nav.Link>
          <Nav.Link className="text-white d-flex align-items-center" onClick={() => setActiveView('taskanalytics')}>
            <FaClipboardList size={30} />
            <span className={`ms-3 ${collapsed ? 'd-none' : ''}`} style={{ fontSize: '18px' }}>Análisis</span>
          </Nav.Link>
          <Nav.Link className="text-white d-flex align-items-center" onClick={() => setActiveView('taskform')}>
            <FaClipboardList size={30} />
            <span className={`ms-3 ${collapsed ? 'd-none' : ''}`} style={{ fontSize: '18px' }}>Formulario</span>
          </Nav.Link>
        </Nav>

        {/* Separación y segundo grupo de navegación */}
        {userRole === 'gerente_operaciones' && (
          <>
            <hr className="text-white" />
            <Nav className="flex-column">
              <Nav.Link className="text-white d-flex align-items-center" onClick={() => setActiveView('createtask')}>
                <FaPlus size={30} />
                <span className={`ms-3 ${collapsed ? 'd-none' : ''}`} style={{ fontSize: '18px' }}>Crear Tarea</span>
              </Nav.Link>
              <Nav.Link className="text-white d-flex align-items-center" onClick={() => setActiveView('createuser')}>
                <FaUserPlus size={30} />
                <span className={`ms-3 ${collapsed ? 'd-none' : ''}`} style={{ fontSize: '18px' }}>Gestor de Usuarios</span>
              </Nav.Link>
            </Nav>
          </>
        )}

        {/* Espaciado y Footer del Sidebar */}
        <div className="mt-auto text-center d-flex justify-content-center align-items-center" style={{ height: '60px' }}>
          {photoURL ? (
            <img
              src={photoURL}
              alt="Imagen de perfil"
              className="rounded-circle"
              style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
              onClick={handleProfileClick}
            />
          ) : (
            <div
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#ccc',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
              onClick={handleProfileClick}
            ></div>
          )}

          {/* Modal del perfil */}
          <Modal show={showProfileModal} onHide={handleCloseProfileModal} size="lg">
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body>
              <Profile handleLogout={handleLogout} />
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
