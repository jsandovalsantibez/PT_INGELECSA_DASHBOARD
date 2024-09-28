import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Image } from 'react-bootstrap';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, deleteDoc, updateDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase'; // 'storage' eliminado

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
    <Container fluid className="p-4" style={{ backgroundColor: '#1d3557', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#f1faee' }}>Administración de Usuarios</h2>
        <Button variant="primary" onClick={handleOpenModal}>+ Agregar Usuario</Button>
      </div>

      {/* Tabla de Usuarios */}
      <Table bordered hover responsive className="table align-middle" style={{ borderRadius: '8px', overflow: 'hidden' }}>
        <thead className="table-dark">
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
                <Image
                  src={user.photoURL || 'https://via.placeholder.com/50'}
                  roundedCircle
                  width="50"
                  height="50"
                  alt={user.fullName}
                  style={{ objectFit: 'cover' }}
                />
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

      {/* Modal para creación de usuario */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateUser}>
            {error && <Alert variant="danger">{error}</Alert>}
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

      {/* Modal para editar usuario */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditUser}>
            {error && <Alert variant="danger">{error}</Alert>}
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
            <Button variant="primary" type="submit">Guardar Cambios</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para confirmar eliminación de usuario */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar a {selectedUser?.fullName}?</p>
          <p>Para confirmar, escribe el nombre completo del usuario:</p>
          <Form.Control type="text" placeholder="Escribe el nombre completo" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteUser}>Confirmar Eliminación</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateUser;
