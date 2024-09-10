import React from 'react';
import { Button, Nav } from 'react-bootstrap';

interface SidebarProps {
  setActiveView: (view: string) => void;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveView, handleLogout }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        className={`d-flex flex-column bg-dark text-white p-3 ${collapsed ? 'collapsed-sidebar' : ''}`}
        style={{ width: collapsed ? '60px' : '150px', transition: 'width 0.3s' }}
      >
        <div className="sidebar-header mb-4">
          <Button variant="link" className="text-white" onClick={() => setCollapsed(!collapsed)}>
            <i className="fa fa-bars fa-lg"></i>
          </Button>
          <span className={`${collapsed ? 'd-none' : ''}`}>Sidebar</span>
        </div>

        <Nav className="flex-column">
          <Nav.Link className="text-white" onClick={() => setActiveView('taskcardlist')}>
            <i className="fa fa-tasks"></i>
            <span className={`${collapsed ? 'd-none' : 'ms-2'}`}>Task</span>
          </Nav.Link>
          <Nav.Link className="text-white" onClick={() => setActiveView('profile')}>
            <i className="fa fa-user"></i>
            <span className={`${collapsed ? 'd-none' : 'ms-2'}`}>Profile page</span>
          </Nav.Link>
          <Nav.Link className="text-white" onClick={() => setActiveView('createtask')}>
            <i className="fa fa-plus"></i>
            <span className={`${collapsed ? 'd-none' : 'ms-2'}`}>Create Task</span>
          </Nav.Link>
          <Nav.Link className="text-white" onClick={() => setActiveView('createuser')}>
            <i className="fa fa-user-plus"></i>
            <span className={`${collapsed ? 'd-none' : 'ms-2'}`}>Crear Usuario</span>
          </Nav.Link>
          <Nav.Link className="text-white" onClick={() => setActiveView('taskform')}>
            <i className="fa fa-file"></i>
            <span className={`${collapsed ? 'd-none' : 'ms-2'}`}>Formulario de Tarea</span>
          </Nav.Link>
        </Nav>

        <div className="mt-auto">
          <Button variant="danger" className="w-100" onClick={handleLogout}>
            <i className="fa fa-sign-out"></i>
            <span className={`${collapsed ? 'd-none' : 'ms-2'}`}>Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
