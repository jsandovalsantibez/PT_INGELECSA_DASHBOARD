import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './vistas/Home';
import About from './vistas/About';
import Dashboard from './vistas/Dashboard';
import Signin from './vistas/Signin';
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
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </Router>
  );
};

export default App;
