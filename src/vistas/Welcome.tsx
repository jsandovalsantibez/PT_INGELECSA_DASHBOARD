import React from 'react';
import Header from './Header';
import Footer from '../components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Carousel, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import bienvenida_2 from '../assets/bienvenida_2.png';
import bienvenida_3 from '../assets/bienvenida_3.png';
import '../styles/style_bienvenida.css'; // Importa el archivo CSS global

const Welcome: React.FC = () => {
  return (
    <div>
      <Header />
      <main>
        {/* Carrusel */}
        <div className="carousel-wrapper">
          <Carousel>
            <Carousel.Item>
              <img className="d-block w-100" src={bienvenida_2} alt="First slide" />
              <Carousel.Caption>
                <h3>Bienvenido a Calzados Caminar</h3>
                <p>Transforma tu forma de caminar.</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img className="d-block w-100" src={bienvenida_3} alt="Second slide" />
              <Carousel.Caption>
                <h3>Estilo y Comodidad</h3>
                <p>Los mejores diseños para tu día a día.</p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </div>

        {/* Sección debajo del carrusel */}
        <div className="cards-section">
          <div className="container my-5">
            <div className="row">
              <div className="col-md-4">
                <Card className="mb-4">
                  <Card.Img variant="top" src="https://via.placeholder.com/150" />
                  <Card.Body>
                    <Card.Title>Card 1</Card.Title>
                    <Card.Text>
                      Esta es una descripción de la primera tarjeta.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card className="mb-4">
                  <Card.Img variant="top" src="https://via.placeholder.com/150" />
                  <Card.Body>
                    <Card.Title>Card 2</Card.Title>
                    <Card.Text>
                      Esta es una descripción de la segunda tarjeta.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-4">
                <Card className="mb-4">
                  <Card.Img variant="top" src="https://via.placeholder.com/150" />
                  <Card.Body>
                    <Card.Title>Card 3</Card.Title>
                    <Card.Text>
                      Esta es una descripción de la tercera tarjeta.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>

          {/* -- Código comentado para los elementos flotantes visuales -- */}
          {/* 
          <div className="floating-elements">
            <div className="float-circle float-animation"></div>
            <div className="float-square float-animation"></div>
          </div>
          */}
        </div>
      </main>

      <Link to="/login">
        <Button variant="secondary" className="ml-2">Ir a Login</Button>
      </Link>
      <Footer />
    </div>
  );
};

export default Welcome;
