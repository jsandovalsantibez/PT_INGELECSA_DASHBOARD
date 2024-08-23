import { Navbar, Container, Nav, Col } from 'react-bootstrap';

function Sidebar() {
  return (
    <div className="d-flex">
      <Col xs={3} className="bg-dark" style={{ height: '100vh' }}>
        <Navbar variant="dark">
          <Container>
            <Nav className="flex-column">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <Nav.Link href="#link">Another link</Nav.Link>
            </Nav>
          </Container>
        </Navbar>
      </Col>
      <Col xs={9}>
        {/* Contenido principal de tu aplicación */}
      </Col>
    </div>
  );
}

export default Sidebar;