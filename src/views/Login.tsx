import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from '../components/Footer'; 
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { auth, db } from "../firebase"; 
import '../styles/style_login.css'; 
import Logo_2 from '../assets/logo_2.png';


const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const role = userDoc.data()?.role;

      if (role === 'gerente_operaciones' || role === 'tecnico_soporte') {
        navigate('/dashboard');
      } else {
        throw new Error('Usuario sin rol asignado.');
      }
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <Container fluid className="d-flex flex-column min-vh-100 p-0 m-0 login-background">
      {/* Logo centrado con enlace */}
      <a href="/" className="logo-link">
        <img src={Logo_2} alt="Ingelecsa Logo" className="ingelecsa-logo" />
      </a>
      {/* Overlay oscuro */}
      <div className="overlay"></div>
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        {/* Card con transparencia */}
        <Card className="login-card">
          <Card.Body>
            <h2 style={{ color: 'white' }} className="text-center mb-4">Iniciar Sesión</h2>
            <Form onSubmit={handleLogin}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label style={{ color: 'white' }}>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter email" 
                  required 
                />
              </Form.Group>
              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label style={{ color: 'white' }}>Contraseña</Form.Label>
                <Form.Control 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Password" 
                  required 
                />
              </Form.Group>
              <Button variant="secondary" type="submit" className="w-100 mt-4">
                Login
              </Button>
            </Form>
            {error && <p className="text-danger mt-3 text-center">{error}</p>}
          </Card.Body>
        </Card>
      </div>
      <Footer />
    </Container>
  );
};

export default Login;
