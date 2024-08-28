import React from 'react';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';

interface SidebarProps {
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setActiveView }) => {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}>
      <CDBSidebar
        textColor="#fff"
        backgroundColor="#333"
        className=""
        breakpoint={768}
        toggled={false}
        minWidth="200px"
        maxWidth="300px"
      >
        <CDBSidebarHeader prefix={<i className="fa fa-bars fa-large"></i>}>
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
            Sidebar Footer
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  );
};

export default Sidebar;
