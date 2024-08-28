import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './vistas/Dashboard';
import Welcome from './vistas/Welcome';
import Login from './vistas/Login';
import Profile from './vistas/Profile';
import TaskCardsList from './components/TaskCardsList';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path='/login' element={<Login/>}/>
        <Route path="/taskcardlist" element={<TaskCardsList userRole="admin" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
