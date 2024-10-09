import React from 'react';
import Header from './Header';
import Footer from '../components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Carousel} from 'react-bootstrap';
import bienvenida_2 from '../assets/bienvenida_2.png';
import bienvenida_3 from '../assets/bienvenida_3.png';
import '../styles/style_bienvenida.css';
import iconoIngenieria from '../assets/icono-ingeniería.png';
import iconoMantenimiento from '../assets/icono-mantencion.jpg';
import iconoInstalacion from '../assets/icono-instalacion.jpg';
import iconoInspeccion from '../assets/icono-inspeccion.png';

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
                <h3>Bienvenido a INGELECSA LTDA</h3>
                <p>Soluciones para sistemas de protección contra incendios.</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img className="d-block w-100" src={bienvenida_3} alt="Second slide" />
              <Carousel.Caption>
                <h3>Ingeniería y Seguridad</h3>
                <p>Proyectos a la medida para los sectores industriales.</p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
        </div>

        {/* Sección de estadísticas */}
        <section className="statistics-section">
          <div className="statistics-container">
            <div className="statistics-text">
              <h1>TRABAJAMOS EN PROYECTOS EXCLUSIVOS</h1>
              <p>
                Nos enfocamos en desarrollar, diseñar y ejecutar proyectos a medida que
                permiten soluciones eficaces a las necesidades de nuestros clientes.
              </p>
            </div>
            <div className="statistics-card">
              <h1>148</h1>
              <h4>Proyectos Ejecutados</h4>
              <h1>21</h1>
              <h4>Proyectos Actuales</h4>
              <h1>25</h1>
              <h4>Años de Experiencia</h4>
            </div>
          </div>
        </section>

        {/* Sección de servicios */}
        <section className="services-section">
          <h2>INFO DE SERVICIOS</h2>
          <div className="services-container">
            <div className="service-card">
              <img src={iconoIngenieria} alt="Ingeniería" />
              <h3>Ingeniería</h3>
              <p>
              En INGELECSA LTDA, somos especialistas en sistemas de protección contra incendios. Ponemos a su disposición toda nuestra experiencia en consultoría, ingeniería, diseño, instalación y mantenimiento de todos estos sistemas, los cuales son de vital importancia para la protección de cualquier Empresa Minera, Industrial, Inmobiliario o del Retail.
              </p>
            </div>
            <div className="service-card">
              <img src={iconoMantenimiento} alt="Mantenimiento" />
              <h3>Mantenimiento</h3>
              <p>
              En INGELECSA LTDA, además de diseñar e instalar todos los sistemas de protección contra incendio, también ofrece el servicio de mantenimiento a dichas instalaciones.
              </p>
            </div>
            <div className="service-card">
              <img src={iconoInstalacion} alt="Instalación" />
              <h3>Instalación</h3>
              <p>
                En INGELECSA LTDA contamos con personal especializado en el uso de herramientas de prefabricación e instalación de tuberías, Así como el conocimiento de los sistemas de protección contra incendio; todos nuestros miembros del equipo de instalación cuentan con experiencia y constancias de habilidades en el manejo de herramientas especializadas y de seguridad en el trabajo avaladas por nuestro trabajo. Contamos con supervisores especializados en instalaciones de Sistemas de Protección contra incendio tanto hidráulicos como electrónicos, con amplia experiencia en manejo de ruta crítica y programas de obra, así como la coordinación y administración de recursos durante el proyecto para mayor eficiencia y calidad en los trabajos.
              </p>
            </div>
            <div className="service-card">
              <img src={iconoInspeccion} alt="Inspección" />
              <h3>Inspección Técnica</h3>
              <p>
              En INGELECSA LTDA, además, una de las ramas de nuestro expertis, es dar asesoría y soporte técnico en Inspecciones de Obras (ITO); así como recomendaciones de seguridad y protección en Empresas Minera, Industrial, Inmobiliario o del Retail.
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Welcome;
