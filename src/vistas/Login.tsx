import React, { useState } from 'react';
import { Container, Row, Col, Card} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Carousel from 'react-bootstrap/Carousel';
import Header from './Header';  // Importa el Header
import Footer from './Footer';  // Importa el Footer
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
// Importar las imágenes correctamente
import bienvenida_2 from '../assets/bienvenida_2.png';
import bienvenida_3 from '../assets/bienvenida_3.png';


const Bienvenida2: React.FC = () => {
const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Redirige al dashboard después del login
    } catch (error) {
      console.error("Error al iniciar sesión", error);
    }
  };
    return (
        <Container fluid className="d-box flex-column min-vh-100 p-0 m-0">
            <Header /> {/* Agrega el Header aquí */}
            <Row className="flex-grow-1 g-0">
                {/* Carrusel en el fondo */}
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
                        <Card.Body >

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

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Footer /> {/* Agrega el Footer aquí */}
        </Container>
    );
};

export default Bienvenida2;
