import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"; 
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';
import { auth } from '../firebase';
import UserList from './UserList';

const TaskCardsList: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [taskCards, setTaskCards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    const fetchTaskCards = async () => {
      const db = getFirestore();
      let q;

      if (userRole === 'gerente_operaciones') {
        q = query(collection(db, "taskCards"), where("active", "==", true)); // Solo tareas activas
      } else {
        q = query(collection(db, "taskCards"), 
            where("active", "==", true), 
            where("assignedPersonnel", "array-contains", auth.currentUser?.uid)); 
      }

      try {
        const querySnapshot = await getDocs(q);
        let cards = querySnapshot.docs.map(doc => ({
          id: doc.id, 
          ...(doc.data() as any),
        }));

        cards = cards.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setTaskCards(cards);
      } catch (error) {
        console.error("Error al cargar las tarjetas:", error);
      }
    };

    fetchTaskCards();
  }, [userRole]);

  const handleShowDetails = (task: any) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <Row style={{ backgroundColor: '#1a2b4c', minHeight: '100vh', padding: '20px' }}>
      {/* Columna para las Task Cards */}
      <Col md={8}>
        <Row xs={1} md={2} className="g-3">
          {taskCards.map(card => (
            <Col key={card.id}>
              <Card style={{ 
                margin: '0.5rem', 
                minHeight: '200px',
                backgroundColor: '#f8f9fa', 
              }}>
                <Card.Body className="d-flex flex-column justify-content-center align-items-center" style={{ color: 'black' }}>
                  <Card.Title>{card.place}</Card.Title>
                  <Card.Text>{card.date}</Card.Text>
                  <div className="d-flex align-items-center">
                    <Button variant="primary" onClick={() => handleShowDetails(card)}>Ver detalles</Button>
                    {card.assignedPersonnel && card.assignedPersonnel.length > 0 && (
                      <Badge pill bg="info" className="ms-2">
                        {card.assignedPersonnel.length > 3 ? '3+' : card.assignedPersonnel.length}
                      </Badge>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Col>

      {/* Columna para la lista de usuarios */}
      <Col md={4}>
        <UserList />
      </Col>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              <h5>{selectedTask.place}</h5>
              <p>Categoría: {selectedTask.placeCategory}</p>
              <p>Fecha: {selectedTask.date}</p>
              <p>Hora de Ingreso: {selectedTask.checkInTime}</p>
              <p>Hora de Salida: {selectedTask.checkOutTime}</p>
              <p>Persona de contacto: {selectedTask.contactPerson}</p>
              <p>Número de contacto: {selectedTask.contactNumber}</p>
              <p>Personal Designado: {selectedTask.assignedPersonnel.join(', ')}</p>
              <p>Herramientas: {selectedTask.tools}</p>
              <p>Tipo de Mantenimiento: {selectedTask.maintenanceType}</p>
              <p>Detalles adicionales: {selectedTask.details || 'No disponibles'}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default TaskCardsList;
