import React from 'react';
import { Container } from 'react-bootstrap';
import bienvenida_1 from '../assets/bienvenida_1.png';

const Footer: React.FC = () => {
    return (
        <footer className="bg-dark text-white text-center py-3">
            <Container>
                <p>&copy; 2024 Mi Aplicación. Todos los derechos reservados.</p>
            </Container>
        </footer>
    );
};

export default Footer;
