import React, { useState } from 'react';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import UsersImg from './UsersImg';  // Asegúrate de que la ruta esté correcta

const CreateUser: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rut, setRut] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const originalEmail = auth.currentUser?.email || '';
    const originalPassword = password;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      let photoURL = '';
      if (image) {
        const storageRef = ref(storage, `profileImages/${newUser.uid}`);
        await uploadBytes(storageRef, image);
        photoURL = await getDownloadURL(storageRef);
      }

      await setDoc(doc(db, 'users', newUser.uid), {
        role: 'tecnico_soporte',
        fullName,
        rut,
        contactNumber,
        email: newUser.email,
        photoURL, 
      });

      await signInWithEmailAndPassword(auth, originalEmail, originalPassword);

      alert('Usuario creado exitosamente!');
      setEmail('');
      setPassword('');
      setFullName('');
      setRut('');
      setContactNumber('');
      setImage(null);
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      if ((error as any).code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está en uso.');
      } else {
        setError('Hubo un problema al crear el usuario.');
      }
    }
  };

  return (
    <Container fluid>
      <Row style={{ backgroundColor: '#1a2b4c', minHeight: '100vh', padding: '20px', margin: '0' }}>
        <Col md={12}>
          <h2 style={{ color: 'white', marginBottom: '10px' }}>Administración de Usuarios</h2>
          <hr style={{ borderTop: '3px solid white', marginBottom: '30px' }} />
        </Col>
        <Col md={6}>
          <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', 
              marginTop: '30px'
            }}>
            <h3 className="text-center mb-4">Crear Nuevo Usuario</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleCreateUser}>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ingrese el correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Ingrese la contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formFullName" className="mb-3">
                <Form.Label>Nombre Completo</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formRut" className="mb-3">
                <Form.Label>RUT</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el RUT"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formContactNumber" className="mb-3">
                <Form.Label>Número de Contacto</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el número de contacto"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formImage" className="mb-3">
                <Form.Label>Imagen de Perfil</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImage(e.target.files[0]);
                    } else {
                      setImage(null);
                    }
                  }}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Crear Usuario
              </Button>
            </Form>
          </div>
        </Col>
        <Col md={6}>
          <UsersImg /> {/* Renderizado del componente que muestra las imágenes */}
        </Col>
      </Row>
    </Container>
  );
};

export default CreateUser;
