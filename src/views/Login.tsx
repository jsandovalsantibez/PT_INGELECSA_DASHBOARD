import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header'; 
import Footer from '../components/Footer'; 
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { auth, db } from "../firebase"; 

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
    <Container fluid className="d-flex flex-column min-vh-100 p-0 m-0" style={{ backgroundColor: '#e9ecef' }}>
      <Header />
      <div className="flex-grow-1 d-flex justify-content-center align-items-center">
        <Card style={{ width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: '#ffffff', borderRadius: '10px' }}>
          <Card.Body>
            <h2 className="text-center mb-4">Login</h2>
            <Form onSubmit={handleLogin}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter email" 
                  required 
                />
              </Form.Group>
              <Form.Group controlId="formBasicPassword" className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Password" 
                  required 
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 mt-4">
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
