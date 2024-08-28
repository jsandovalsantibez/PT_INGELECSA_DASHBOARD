import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import About from './vistas/About';
import Dashboard from './vistas/Dashboard';
import Welcome from './vistas/Welcome';
import Login from './vistas/Login';
import Profile from './vistas/Profile';
import Sidebar from './components/sideBar';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path='/login' element={<Login/>}/>
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>
    </Router>
  );
};

export default App;
