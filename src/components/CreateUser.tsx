import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Image, Row, Col } from 'react-bootstrap';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, deleteDoc, updateDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../styles/style_createuser.css';

const CreateUser: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [confirmName, setConfirmName] = useState('');

  // Estados del formulario de creación de usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rut, setRut] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Abrir y cerrar modal de confirmación para eliminar usuario
  const handleShowDeleteModal = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  // Abrir y cerrar modal para editar usuario
  const handleShowEditModal = (user: any) => {
    setSelectedUser(user);
    setFullName(user.fullName);
    setRut(user.rut);
    setContactNumber(user.contactNumber);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => setShowEditModal(false);

  // Función para obtener los usuarios registrados
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersList: any[] = [];
    querySnapshot.forEach((doc) => {
      usersList.push({ ...doc.data(), id: doc.id });
    });
    setUsers(usersList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para manejar la creación del usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email,
        fullName,
        rut,
        contactNumber,
        uid: user.uid,
        photoURL: '', // Mantén la lógica de foto inicial
      });

      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setRut('');
      setContactNumber('');
      handleCloseModal();
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Función para manejar la edición del usuario
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedUser) {
        const userDocRef = doc(db, 'users', selectedUser.id);
        await updateDoc(userDocRef, { fullName, rut, contactNumber });
        handleCloseEditModal();
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Función para manejar la eliminación del usuario
  const handleDeleteUser = async () => {
    if (confirmName !== selectedUser.fullName) {
      setError('El nombre completo no coincide.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', selectedUser.id);
      await deleteDoc(userDocRef);
      handleCloseDeleteModal();
      setConfirmName('');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a2b4c', minHeight: '100vh' }}>
      <Row style={{ marginBottom: '20px' }}>
        <Col md={12}>
          <h2 style={{ color: 'white' }}>Administración de Usuarios</h2>
          <hr style={{ borderTop: '3px solid white' }} />
        </Col>
      </Row>
      <Button variant="primary" onClick={handleOpenModal} className="add-user-btn">+ Agregar Usuario</Button>
      <hr />
      {/* Tabla de Usuarios */}
      <Table bordered hover responsive className="user-table mt-3">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre Completo</th>
            <th>RUT</th>
            <th>Email</th>
            <th>Número de Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td className="text-center">
                <div className="user-image-container">
                  <Image
                    src={user.photoURL || 'https://via.placeholder.com/50'}
                    alt={user.fullName}
                    className="user-image"
                  />
                </div>
              </td>
              <td>{user.fullName}</td>
              <td>{user.rut}</td>
              <td>{user.email}</td>
              <td>{user.contactNumber}</td>
              <td>
                <Button variant="outline-warning" className="me-2" onClick={() => handleShowEditModal(user)}>✏️</Button>
                <Button variant="outline-danger" onClick={() => handleShowDeleteModal(user)}>🗑️</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modales para agregar, editar y eliminar usuario */}
      <Modal show={showModal} onHide={handleCloseModal}>
        {/* Modal para agregar */}
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateUser}>
            {error && <Alert variant="danger">{error}</Alert>}
            {/* Campos del formulario */}
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Ingrese el correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" placeholder="Ingrese la contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formConfirmPassword" className="mb-3">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control type="password" placeholder="Ingrese nuevamente la contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formFullName" className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control type="text" placeholder="Ingrese el nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formRut" className="mb-3">
              <Form.Label>RUT</Form.Label>
              <Form.Control type="text" placeholder="Ingrese el RUT" value={rut} onChange={(e) => setRut(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formContactNumber" className="mb-3">
              <Form.Label>Número de Contacto</Form.Label>
              <Form.Control type="text" placeholder="+569xxxxxxxx" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit">Crear Usuario</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Resto de los modales... */}
    </div>
  );
};

export default CreateUser;
