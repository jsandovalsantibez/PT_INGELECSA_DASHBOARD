import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import About from './views/About';
import Dashboard from './views/Dashboard';
import Welcome from './views/Welcome';
import Login from './views/Login';
import Profile from './views/Profile';
import CreateUser from './components/CreateUser';
import TaskPlan from './components/TaskPlan'; // Importa el componente TaskPlan
import { AuthProvider } from './components/AuthContext'; 

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path='/login' element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/taskplan/:taskId" element={<TaskPlan />} />
          <Route path="/createuser" element={<CreateUser />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
