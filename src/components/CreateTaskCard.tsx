import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Form, Button, Col, Row, ListGroup, Dropdown, Container, ButtonGroup, Modal } from 'react-bootstrap';
import { BsThreeDotsVertical } from 'react-icons/bs';

const CreateTaskCard: React.FC = () => {
  const [placeCategory, setPlaceCategory] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [assignedPersonnel, setAssignedPersonnel] = useState('');
  const [tools, setTools] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const placesByCategory: { [key: string]: string[] } = {
    homecenter: ["Estación Central", "Independencia", "El Bosque"],
    falabella: ["Costanera", "Parque Arauco", "Independencia"],
    tottus: ["El Bosque", "Estación Central", "Buin"],
    ikea: ["Parque Arauco"],
  };

  const maintenanceTypes = [
    { value: 'mantencion_preventiva', label: 'Mantención Preventiva', color: 'green' },
    { value: 'mantencion_correctiva', label: 'Mantención Correctiva', color: 'orange' },
    { value: 'inspeccion', label: 'Inspección', color: 'blue' },
    { value: 'emergencia', label: 'Emergencia', color: 'red' },
  ];

  const fetchTasks = async () => {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, "taskCards"));
    const tasksList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any),
    }));
    setTasks(tasksList);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const db = getFirestore();

    try {
      await addDoc(collection(db, "taskCards"), {
        place,
        date,
        checkInTime,
        checkOutTime,
        contactPerson,
        contactNumber,
        assignedPersonnel,
        tools,
        maintenanceType,
        active: false,
      });
      alert("Card creada con éxito!");
      setPlaceCategory('');
      setPlace('');
      setDate('');
      setCheckInTime('');
      setCheckOutTime('');
      setContactPerson('');
      setContactNumber('');
      setAssignedPersonnel('');
      setTools('');
      setMaintenanceType('');
      fetchTasks();
    } catch (error) {
      console.error("Error al crear la card: ", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("¿Está seguro que desea borrar esta tarea?")) {
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "taskCards", taskId));
        fetchTasks(); 
        alert("Tarea borrada con éxito.");
      } catch (error) {
        console.error("Error al borrar la tarea: ", error);
      }
    }
  };

  const handleShowDetails = (task: any) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <Container fluid>
      <Row>
        <Col md={5} style={{ paddingBottom: '20px' }}>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-2">
              <Form.Group as={Col} md="12">
                <Form.Label>Categoría del Lugar</Form.Label>
                <Form.Control
                  as="select"
                  value={placeCategory}
                  onChange={e => {
                    setPlaceCategory(e.target.value);
                    setPlace(''); 
                  }}
                  required
                >
                  <option value="" disabled>Seleccione una categoría</option>
                  <option value="homecenter">Homecenter</option>
                  <option value="falabella">Falabella</option>
                  <option value="tottus">Tottus</option>
                  <option value="ikea">Ikea</option>
                </Form.Control>
              </Form.Group>
            </Row>

            <Row className="mb-2">
              <Form.Group as={Col} md="12">
                <Form.Label>Lugar</Form.Label>
                <Form.Control
                  as="select"
                  value={place}
                  onChange={e => setPlace(e.target.value)}
                  required
                  disabled={!placeCategory}
                >
                  <option value="" disabled>Seleccione un lugar</option>
                  {placeCategory && placesByCategory[placeCategory]?.map((placeOption) => (
                    <option key={placeOption} value={placeOption}>{placeOption}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Row>

            <Row className="mb-2">
              <Form.Group as={Col} md="6">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md="3">
                <Form.Label>Hora de Ingreso</Form.Label>
                <Form.Control
                  type="time"
                  value={checkInTime}
                  onChange={e => setCheckInTime(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md="3">
                <Form.Label>Hora de Salida</Form.Label>
                <Form.Control
                  type="time"
                  value={checkOutTime}
                  onChange={e => setCheckOutTime(e.target.value)}
                  required
                />
              </Form.Group>
            </Row>

            <Row className="mb-2">
              <Form.Group as={Col} md="6">
                <Form.Label>Persona de Contacto</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el nombre del contacto"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md="6">
                <Form.Label>Número de Contacto</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el número de contacto"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  required
                />
              </Form.Group>
            </Row>

            <Row className="mb-2">
              <Form.Group as={Col} md="6">
                <Form.Label>Personal Designado</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese el personal designado"
                  value={assignedPersonnel}
                  onChange={e => setAssignedPersonnel(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md="6">
                <Form.Label>Herramientas</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ingrese las herramientas necesarias"
                  value={tools}
                  onChange={e => setTools(e.target.value)}
                  required
                />
              </Form.Group>
            </Row>

            <Row className="mb-2">
              <Form.Group as={Col} md="12">
                <Form.Label>Tipo de Mantenimiento</Form.Label>
                <Form.Control
                  as="select"
                  value={maintenanceType}
                  onChange={e => setMaintenanceType(e.target.value)}
                  required
                >
                  <option value="" disabled>Seleccione un tipo de mantenimiento</option>
                  {maintenanceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Row>

            <Button type="submit" variant="primary" className="w-100">Crear Card</Button>
          </Form>
        </Col>
        <Col md={7}>
          <ListGroup className="mt-4">
            {tasks.map(task => (
              <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
                <div>
                  {task.place} - {task.date}
                </div>
                <div className="d-flex align-items-center" style={{ marginLeft: 'auto' }}>
                  <ButtonGroup className="me-2">
                    <Button variant="outline-primary">Crear Plan</Button>
                    <Button variant="outline-info" onClick={() => handleShowDetails(task)}>Ver Detalles</Button>
                  </ButtonGroup>
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="link" id="dropdown-basic">
                      <BsThreeDotsVertical />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleDeleteTask(task.id)}>Borrar Tarea</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>

      {/* Modal para ver detalles */}
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
    </Container>
  );
};

export default CreateTaskCard;
