import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"; 
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { auth } from '../firebase';

const TaskCardsList: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [taskCards, setTaskCards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    const fetchTaskCards = async () => {
      const db = getFirestore();
      let q;

      if (userRole === 'gerente_operaciones') {
        q = collection(db, "taskCards");
      } else {
        q = query(collection(db, "taskCards"), where("assignedTo", "==", auth.currentUser?.uid));
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
    <div style={{ backgroundColor: '#1a2b4c', minHeight: '100vh', padding: '20px' }}>
      <Row xs={1} md={3} className="g-3" style={{ marginRight: 0, marginLeft: 0 }}>
        {taskCards.map(card => (
          <Col key={card.id}>
            <Card style={{ 
              margin: '0.5rem', 
              minHeight: '200px',
              backgroundColor: '#f8f9fa', // Fondo gris claro
            }}>
              <Card.Body className="d-flex flex-column justify-content-center align-items-center" style={{ color: 'black' }}>
                <Card.Title>{card.place}</Card.Title>
                <Card.Text>{card.date}</Card.Text>
                <Button variant="primary" onClick={() => handleShowDetails(card)}>Ver detalles</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              <h5>{selectedTask.place}</h5>
              <p>Fecha: {selectedTask.date}</p>
              <p>Persona de contacto: {selectedTask.contactPerson}</p>
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
    </div>
  );
};

export default TaskCardsList;
