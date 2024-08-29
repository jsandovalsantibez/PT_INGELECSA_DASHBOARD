import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import About from './vistas/About';
import Dashboard from './vistas/Dashboard';
import Welcome from './vistas/Welcome';
import Login from './vistas/Login';
import Profile from './vistas/Profile';
import CreateUser from './components/CreateUser';
import { AuthProvider } from './components/AuthContext';  // Importa el AuthProvider

const App: React.FC = () => {
  return (
    <AuthProvider> {/* Envuelve la app con el AuthProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path='/login' element={<Login/>}/>
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/createuser" element={<CreateUser />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
