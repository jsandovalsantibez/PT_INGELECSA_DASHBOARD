import React from 'react';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import { Button } from 'react-bootstrap';

interface SidebarProps {
  setActiveView: (view: string) => void;
  handleLogout: () => void; // Añadimos la función de logout como prop
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveView, handleLogout }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}>
      <CDBSidebar
        textColor="#fff"
        backgroundColor="#333"
        className=""
        breakpoint={768}
        toggled={false}
        minWidth={collapsed ? "60px" : "150px"} // Ajuste del ancho cuando está colapsada
        maxWidth={collapsed ? "60px" : "150px"} // Ajuste del ancho cuando no está colapsada
      >
        <CDBSidebarHeader 
          prefix={<i className="fa fa-bars fa-large" onClick={() => setCollapsed(!collapsed)}></i>}
        >
          <a href="/" className="text-decoration-none" style={{ color: 'inherit' }}>
            Sidebar
          </a>
        </CDBSidebarHeader>

        <CDBSidebarContent className="sidebar-content">
          <CDBSidebarMenu>
            <div onClick={() => setActiveView('taskcardlist')}>
              <CDBSidebarMenuItem>Task</CDBSidebarMenuItem>
            </div>
            <div onClick={() => setActiveView('profile')}>
              <CDBSidebarMenuItem>Profile page</CDBSidebarMenuItem>
            </div>
            <div onClick={() => setActiveView('createtask')}>
              <CDBSidebarMenuItem>Create Task</CDBSidebarMenuItem>
            </div>
          </CDBSidebarMenu>
        </CDBSidebarContent>

        <CDBSidebarFooter>
          <div style={{ padding: '20px 5px' }}>
            <Button variant="danger" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  );
};

export default Sidebar;
