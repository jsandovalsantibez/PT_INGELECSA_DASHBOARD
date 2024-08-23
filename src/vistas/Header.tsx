import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import logo_2 from '../assets/logo_2.png';

const Header: React.FC = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <img
                    alt=""
                    src={logo_2}
                    width="300"
                    height="80"
                    className="d-inline-block align-top"
                />{' '}
                <Navbar.Brand href="#home">Mi Aplicación</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Inicio</Nav.Link>
                        <Nav.Link href="#about">Acerca de</Nav.Link>
                        <Nav.Link href="#contact">Contacto</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
