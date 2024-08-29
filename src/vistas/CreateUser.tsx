import React, { useState } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../firebase';

const CreateUser: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rut, setRut] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Subir imagen a Firebase Storage si existe una
      let imageUrl = '';
      if (image) {
        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Guardar la información adicional en Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        fullName,
        rut,
        address,
        contactNumber,
        photoURL: imageUrl,
        role: 'tecnicos_soporte', // O el rol que decidas asignar
      });

      alert('Usuario creado con éxito!');
      setEmail('');
      setPassword('');
      setFullName('');
      setRut('');
      setAddress('');
      setContactNumber('');
      setImage(null);
    } catch (error) {
      setError('Error al crear el usuario: ' + (error as Error).message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Crear Nuevo Usuario</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-2">
          <Form.Group as={Col} md="12">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </Form.Group>
        </Row>
        <Row className="mb-2">
          <Form.Group as={Col} md="12">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </Form.Group>
        </Row>
        <Row className="mb-2">
          <Form.Group as={Col} md="12">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </Form.Group>
        </Row>
        <Row className="mb-2">
          <Form.Group as={Col} md="12">
            <Form.Label>RUT</Form.Label>
            <Form.Control
              type="text"
              value={rut}
              onChange={e => setRut(e.target.value)}
              required
            />
          </Form.Group>
        </Row>
        <Row className="mb-2">
          <Form.Group as={Col} md="12">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </Form.Group>
        </Row>
        <Row className="mb-2">
          <Form.Group as={Col} md="12">
            <Form.Label>Número de Contacto</Form.Label>
            <Form.Control
              type="text"
              value={contactNumber}
              onChange={e => setContactNumber(e.target.value)}
              required
            />
          </Form.Group>
        </Row>
        <Row className="mb-2">
          <Form.Group as={Col} md="12">
            <Form.Label>Imagen de Perfil</Form.Label>
          </Form.Group>
        </Row>
        <Button type="submit" variant="primary" className="w-100">Crear Usuario</Button>
      </Form>
    </div>
  );
};

export default CreateUser;
