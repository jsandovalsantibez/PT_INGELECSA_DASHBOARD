import React from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';


// Importar las imágenes correctamente
import bienvenida_1 from '../assets/bienvenida_1.png';
import bienvenida_2 from '../assets/bienvenida_2.png';
import bienvenida_3 from '../assets/bienvenida_3.png';

const Bienvenida: React.FC = () => {
    return (
      <Container fluid className="position-relative" style={{ height: '100vh', overflow: 'hidden' }}>
        <Row>
          {/* Carrusel en el fondo */}
          <Carousel className="position-absolute w-100 h-100" controls={false} indicators={false} interval={3000}>
            <Carousel.Item>
              <img
                className="d-block w-100 h-100"
                src={bienvenida_1} // Usar la imagen importada
                alt="Primera imagen"
                style={{ objectFit: 'cover' }}
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100 h-100"
                src={bienvenida_2} // Usar la imagen importada
                alt="Segunda imagen"
                style={{ objectFit: 'cover' }}
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100 h-100"
                src={bienvenida_3} // Usar la imagen importada
                alt="Tercera imagen"
                style={{ objectFit: 'cover' }}
              />
            </Carousel.Item>
          </Carousel>
  
          {/* Contenido principal */}
          <Row className="d-flex justify-content-center align-items-center" style={{ height: '100%', zIndex: 1, position: 'relative' }}>
            <Col xs={12} md={6}>
              <Card style={{ width: '100%' }}>
                <Card.Img variant="top" src="holder.js/100px180" />
                <Card.Body>
                  <Card.Title>Iniciar Sesión</Card.Title>
                  <Card.Text>
                    <Form>
                      <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" />
                        <Form.Text className="text-muted">
                          We'll never share your email with anyone else.
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="Check me out" />
                      </Form.Group>
                      <Button variant="primary" type="submit">
                        Submit
                      </Button>
                    </Form>
                  </Card.Text>
  
                  {/* Botón existente */}
                  <Button variant="primary">Go somewhere</Button>
  
                  {/* Nuevo botón que redirige a la vista de Bienvenida */}
                  <Link to="/login">
                    <Button variant="secondary" className="ml-2">Ir a Bienvenida</Button>
                  </Link>
  
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Row>
      </Container>
    );
  };
  
  export default Bienvenida;