import React, { useState, useEffect } from 'react';
import { Button, Nav, Modal } from 'react-bootstrap';
import { useAuth } from '../components/AuthContext';
import { ref, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { storage } from '../firebase';
import Profile from '../views/Profile';

import {
  FaTasks,
  FaPlus,
  FaUserPlus,
  FaClipboardList,
  FaBars,
  FaSignOutAlt,
} from 'react-icons/fa';

import '../styles/style_sidebar.css';

interface SidebarProps {
  setActiveView: (view: string) => void;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveView, handleLogout }) => {
  // Para colapso en desktop
  const [collapsed, setCollapsed] = useState(false);

  // Para abrir/cerrar en móvil (off-canvas)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

      fetchProfileImage();
      fetchUserRole();
    }
  }, [user]);

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
  };

  // Alterna la visibilidad en modo móvil
  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Cierra la sidebar móvil al hacer clic en una opción
  const handleNavClick = (view: string) => {
    setActiveView(view);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* SIDEBAR */}
      <div
        className={`sidebar-container
          ${collapsed ? 'collapsed' : ''}
          ${isMobileOpen ? 'show-mobile' : ''}
        `}
      >
        <div className="d-flex flex-column text-white h-100 w-100">
          {/* Imagen de perfil */}
          <div className="profile-image-container text-center mb-4">
            <img
              src={photoURL || 'https://via.placeholder.com/60'}
              alt="Imagen de perfil"
              className="rounded-circle"
            />
          </div>

          {/* Menú principal */}
          <div className="flex-grow-1 d-flex flex-column justify-content-start">
            <Nav className="flex-column align-items-center w-100">
              <Nav.Link
                className="sidebar-link d-flex flex-column align-items-center mb-5"
                onClick={() => handleNavClick('taskcardlist')}
              >
                <FaTasks className="nav-icons" />
                {!collapsed && <span className="nav-text text-white">Tareas</span>}
              </Nav.Link>

              <Nav.Link
                className="sidebar-link d-flex flex-column align-items-center mb-5"
                onClick={() => handleNavClick('taskanalytics')}
              >
                <FaClipboardList className="nav-icons" />
                {!collapsed && <span className="nav-text text-white">Análisis</span>}
              </Nav.Link>

              <Nav.Link
                className="sidebar-link d-flex flex-column align-items-center mb-5"
                onClick={() => handleNavClick('taskform')}
              >
                <FaClipboardList className="nav-icons" />
                {!collapsed && <span className="nav-text text-white">Formulario</span>}
              </Nav.Link>
            </Nav>
          </div>

          {/* Opciones extra para el rol 'gerente_operaciones' */}
          {userRole === 'gerente_operaciones' && (
            <div className="mt-3 w-100">
              <hr className="text-white" />
              <Nav className="flex-column align-items-center w-100">
                <Nav.Link
                  className="sidebar-link d-flex flex-column align-items-center mb-5"
                  onClick={() => handleNavClick('createtask')}
                >
                  <FaPlus className="nav-icons" />
                  {!collapsed && <span className="nav-text text-white">Crear Tarea</span>}
                </Nav.Link>

                <Nav.Link
                  className="sidebar-link d-flex flex-column align-items-center mb-5"
                  onClick={() => handleNavClick('createuser')}
                >
                  <FaUserPlus className="nav-icons" />
                  {!collapsed && <span className="nav-text text-white">Gestor de Usuarios</span>}
                </Nav.Link>
              </Nav>
            </div>
          )}

          {/* Botón de Cerrar Sesión */}
          <div className="logout-button-container text-center my-3 w-100">
            <Nav.Link
              className="sidebar-link d-flex flex-column align-items-center"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="nav-icons" />
              {!collapsed && <span className="nav-text text-white">Cerrar Sesión</span>}
            </Nav.Link>
          </div>

          {/* Botón de colapso para desktop (oculto en móvil) */}
          <div className="mt-auto text-center d-none d-md-flex justify-content-center align-items-center">
            <Button variant="link" className="text-white" onClick={() => setCollapsed(!collapsed)}>
              <FaBars size={30} />
            </Button>
          </div>
        </div>
      </div>

      {/* BOTÓN HAMBURGUESA (MÓVIL) ABAJO CENTRADO */}
      <div className="mobile-toggle d-md-none">
        <Button variant="primary" onClick={toggleMobileSidebar}>
          <FaBars />
        </Button>
      </div>

      {/* Modal del perfil (si lo necesitas) */}
      <Modal show={showProfileModal} onHide={handleCloseProfileModal} size="lg">
        <Modal.Header closeButton />
        <Modal.Body>
          <Profile handleLogout={handleLogout} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Sidebar;
