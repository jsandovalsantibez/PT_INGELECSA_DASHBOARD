import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Carousel from 'react-bootstrap/Carousel';
import Header from './Header'; 
import Footer from './Footer'; 
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Asegúrate de importar estas funciones
import { auth, firestore } from "../firebase"; 
import bienvenida_2 from '../assets/bienvenida_2.png';
import bienvenida_3 from '../assets/bienvenida_3.png';


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

      // Obtener el rol del usuario desde Firestore usando la API modular
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const role = userDoc.data()?.role;

      if (role === 'gerente_operaciones') {
        navigate('/dashboard'); // Redirigir al dashboard para Gerente de Operaciones
      } else if (role === 'tecnico_soporte') {
        navigate('/dashboard'); // Redirigir al dashboard para Técnico
      } else {
        throw new Error('Usuario sin rol asignado.');
      }
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <Container fluid className="d-box flex-column min-vh-100 p-0 m-0">
      <Header />
      <Row className="flex-grow-1 g-0">
        <Carousel className="position-absolute w-100 h-100" controls={false} indicators={false} interval={3000}>
          <Carousel.Item>
            <img
              className="d-block w-100 h-100"
              src={bienvenida_2}
              alt="Segunda imagen"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100 h-100"
              src={bienvenida_3}
              alt="Tercera imagen"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Carousel.Item>
        </Carousel>

        <Col xs={12} md={6} className="d-flex justify-content-center align-items-center">
          <Card style={{ width: '18rem', marginTop: '3rem' }}> 
            <Card.Body>
              <h2>Login</h2>
              <form onSubmit={handleLogin}>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Email" 
                  required 
                />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Password" 
                  required 
                />
                <button type="submit">Login</button>
              </form>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Footer />
    </Container>
  );
};

export default Login;
