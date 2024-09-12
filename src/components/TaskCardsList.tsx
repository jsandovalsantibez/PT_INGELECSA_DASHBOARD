import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"; 
import { auth } from '../firebase';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import falabellaLogo from '../assets/falabella_logo.png';
import hcLogo from '../assets/hc_logo.png';
import ikeaLogo from '../assets/ikea_logo.png';
import tottusLogo from '../assets/tottus_logo.png';
import Modal from 'react-bootstrap/Modal';

const TaskCardsList: React.FC<{ userRole: string }> = ({ userRole }) => {
  const [taskCards, setTaskCards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    const fetchTaskCards = async () => {
      const db = getFirestore();
      let q = null;

      const currentUserUID = auth.currentUser?.uid;
      if (!currentUserUID) {
        console.error("No se pudo obtener el UID del usuario");
        return;
      }

      if (userRole === 'tecnico_soporte' || userRole === 'gerente_operaciones') {
        q = query(collection(db, "taskCards"), where("assignedPersonnel", "array-contains", currentUserUID));
      }

      if (q) {
        try {
          const querySnapshot = await getDocs(q);
          const cards = querySnapshot.docs.map(doc => ({
            id: doc.id, 
            ...(doc.data() as any),
          }));
          setTaskCards(cards);
        } catch (error) {
          console.error("Error al cargar las tarjetas:", error);
        }
      }
    };

    fetchTaskCards();
  }, [userRole]);

  const handleShowDetails = (task: any) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const getPlaceLogo = (place: string) => {
    switch (place.toLowerCase()) {
      case 'falabella':
        return falabellaLogo;
      case 'homecenter':
        return hcLogo;
      case 'ikea':
        return ikeaLogo;
      case 'tottus':
        return tottusLogo;
      default:
        return '';
    }
  };

  return (
    <Row style={{ backgroundColor: '#1a2b4c', minHeight: '100vh', padding: '20px' }}>
      <Col md={8}>
        <Row xs={1} md={3} className="g-3" style={{ gap: '10px' }}> {/* Reduce el espacio horizontal */}
          {taskCards.length === 0 ? (
            <p style={{ color: 'white' }}>No hay tareas asignadas a este usuario.</p>
          ) : (
            taskCards.map(card => (
              <Col key={card.id}>
                <Card style={{ margin: '0.5rem', width: '300px', height: '350px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
                  <Card.Img 
                    variant="top" 
                    src={getPlaceLogo(card.placeCategory)} 
                    style={{ height: '140px', objectFit: 'cover', filter: 'brightness(85%)' }}
                  />
                  <Card.Body className="d-flex flex-column justify-content-between" style={{ color: 'black' }}>
                    <div>
                      <Card.Title>{card.place}</Card.Title>
                      <Card.Text>
                        <strong>Fecha:</strong> {card.date}<br />
                        <strong>Contacto:</strong> {card.contactPerson}<br />
                        <strong>Número:</strong> {card.contactNumber}<br />
                      </Card.Text>
                    </div>
                    <div className="d-flex justify-content-between align-items-center" style={{ marginTop: 'auto' }}> {/* Asegura que los elementos estén dentro */}
                      <Button variant="primary" onClick={() => handleShowDetails(card)} style={{ whiteSpace: 'nowrap' }}>Ver detalles</Button>
                      {card.assignedPersonnel && card.assignedPersonnel.length > 0 && (
                        <Badge pill bg="info">
                          {card.assignedPersonnel.length > 3 ? '3+' : card.assignedPersonnel.length}
                        </Badge>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
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
              <p>Herramientas: {selectedTask.tools}</p>
              <p>Tipo de Mantenimiento: {selectedTask.maintenanceType}</p>
              <p>Detalles adicionales: {selectedTask.details || 'No disponibles'}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default TaskCardsList;







