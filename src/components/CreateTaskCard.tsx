import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Form, Button, Col, Row, ListGroup, Dropdown, Container, ButtonGroup, Modal } from 'react-bootstrap';
import { BsThreeDotsVertical } from 'react-icons/bs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateTaskCard: React.FC = () => {
  const [placeCategory, setPlaceCategory] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [assignedPersonnel, setAssignedPersonnel] = useState<string[]>([]);
  const [tools, setTools] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskCode, setTaskCode] = useState(''); 
  const [taskPeriod, setTaskPeriod] = useState<[Date | null, Date | null]>([null, null]); 
  const [personnelList, setPersonnelList] = useState<any[]>([]); 
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false); 
  const [editedTask, setEditedTask] = useState<any>(null); 

  const placesByCategory: { [key: string]: string[] } = {
    homecenter: ["Estación Central", "Independencia", "El Bosque"],
    falabella: ["Costanera", "Parque Arauco", "Independencia"],
    tottus: ["El Bosque", "Estación Central", "Buin"],
    ikea: ["Parque Arauco"],
  };

  const maintenanceTypes = [
    { value: 'mantencion_preventiva', label: 'Mantención Preventiva', code: 'MP', color: 'green' },
    { value: 'mantencion_correctiva', label: 'Mantención Correctiva', code: 'MC', color: 'orange' },
    { value: 'inspeccion', label: 'Inspección', code: 'INS', color: 'blue' },
    { value: 'emergencia', label: 'Emergencia', code: 'EMR', color: 'red' },
  ];

  const categoryCodeMap: { [key: string]: string } = {
    homecenter: 'HC',
    falabella: 'FAB',
    tottus: 'TOT',
    ikea: 'IKEA'
  };

  const generateTaskCode = () => {
    if (!placeCategory || !place || !date || !maintenanceType) return;
    const categoryCode = categoryCodeMap[placeCategory];
    const maintenanceCode = maintenanceTypes.find(type => type.value === maintenanceType)?.code;
    const taskDate = new Date(date);
    const day = String(taskDate.getDate()).padStart(2, '0');
    const month = taskDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const newTaskCode = `${categoryCode}_${place.toUpperCase()}_PCII_INGELECSA_${maintenanceCode}_${month}_${day}_1`;
    setTaskCode(newTaskCode); 
  };

  useEffect(() => {
    generateTaskCode(); 
  }, [placeCategory, place, date, maintenanceType]);

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
    const fetchPersonnel = async () => {
      const db = getFirestore();
      const q = collection(db, 'users');
      const personnelDocs = await getDocs(q);
      const personnelList = personnelDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPersonnelList(personnelList);
    };
    fetchPersonnel();
  }, []);

  const handlePersonnelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setAssignedPersonnel(prev =>
      checked ? [...prev, value] : prev.filter(person => person !== value)
    );
  };

  const coordinatesMap: { [key: string]: { [key: string]: { lat: number; lng: number } } } = {
    homecenter: {
      "Estación Central": { lat: -33.454371487250405, lng: -70.68038025126974 },
      "Independencia": { lat: -33.42410776719904, lng: -70.65437272933464 },
      "El Bosque": { lat: -33.55397243135922, lng: -70.67567938425546 },
    },
    falabella: {
      "Costanera": { lat: -33.41779539847876, lng: -70.6063008072978 },
      "Parque Arauco": { lat: -33.40092528854494, lng: -70.57696037900823 },
      "Independencia": { lat: -33.42452448110847, lng: -70.65448901351925 },
    },
    tottus: {
      "El Bosque": { lat: -33.553663532393486, lng: -70.67505127947594 },
      "Estación Central": { lat: -33.4524555995196, lng: -70.68236381684659 },
      "Buin": { lat: -33.73184491529447, lng: -70.73469287730991 },
    },
    ikea: {
      "Parque Arauco": { lat: -33.40116170486019, lng: -70.57553957108563 },
    },
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirestore();
    try {
      // Busca las coordenadas para el lugar y categoría seleccionados
      const coordinates = coordinatesMap[placeCategory]?.[place];
  
      if (!coordinates) {
        alert("Coordenadas no encontradas para el lugar seleccionado.");
        return;
      }
  
      await addDoc(collection(db, "taskCards"), {
        placeCategory,
        place,
        date,
        checkInTime,
        checkOutTime,
        contactPerson,
        contactNumber,
        assignedPersonnel,
        tools,
        maintenanceType,
        taskCode,
        taskPeriod,
        active: false,
        coordinates, // Añade las coordenadas aquí
      });
  
      alert("Card creada con éxito!");
      setPlaceCategory('');
      setPlace('');
      setDate('');
      setCheckInTime('');
      setCheckOutTime('');
      setContactPerson('');
      setContactNumber('');
      setAssignedPersonnel([]);
      setTools('');
      setMaintenanceType('');
      setTaskPeriod([null, null]);
      setTaskCode('');
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
    setEditedTask(task);
    setShowModal(true);
    setIsEditing(false); 
  };

  const handleEditTask = (task: any) => {
    setIsEditing(true);
    setEditedTask({ ...task });
    setShowModal(true);
  };

  const handleSaveChanges = async () => {
    if (!editedTask) return;
    try {
      const db = getFirestore();
      const taskRef = doc(db, 'taskCards', editedTask.id);
      await updateDoc(taskRef, editedTask);
      alert('Tarea actualizada con éxito!');
      setShowModal(false);
      setIsEditing(false);
      fetchTasks();
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setEditedTask((prevTask: any) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false); 
  };

  return (
    <Container fluid style={{ padding: '0' }}>
      <Row style={{ backgroundColor: '#1a2b4c', minHeight: '100vh', padding: '20px', margin: '0' }}>
        <Col md={12}>
          <h2 style={{ color: 'white', marginBottom: '10px' }}>Creación y Edición de Tareas</h2>
          <hr style={{ borderTop: '3px solid white', marginBottom: '30px' }} />
        </Col>
        <Col md={5} style={{ paddingBottom: '20px', paddingRight: '10px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
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
                    name="date"
                  />
                </Form.Group>

                <Form.Group as={Col} md="3">
                  <Form.Label>Hora de Ingreso</Form.Label>
                  <Form.Control
                    type="time"
                    value={checkInTime}
                    onChange={e => setCheckInTime(e.target.value)}
                    required
                    name="checkInTime"
                  />
                </Form.Group>

                <Form.Group as={Col} md="3">
                  <Form.Label>Hora de Salida</Form.Label>
                  <Form.Control
                    type="time"
                    value={checkOutTime}
                    onChange={e => setCheckOutTime(e.target.value)}
                    required
                    name="checkOutTime"
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
                    name="contactPerson"
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
                    name="contactNumber"
                  />
                </Form.Group>
              </Row>

              <Form.Group as={Col} md="12">
                <Form.Label>Seleccionar Técnicos de Soporte</Form.Label>
                {personnelList.map(person => (
                  <Form.Check
                    key={person.id}
                    type="checkbox"
                    label={person.fullName}
                    value={person.id}
                    onChange={handlePersonnelChange}
                  />
                ))}
              </Form.Group>

              <Form.Group as={Col} md="12">
                <Form.Label>Periodo de la Tarea</Form.Label>
                <DatePicker
                  selectsRange
                  startDate={taskPeriod[0] || undefined}
                  endDate={taskPeriod[1] || undefined}
                  onChange={(update: [Date | null, Date | null]) => setTaskPeriod(update)}
                  isClearable={true}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                />
              </Form.Group>

              <Row className="mb-2">
                <Form.Group as={Col} md="6">
                  <Form.Label>Herramientas</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese las herramientas necesarias"
                    value={tools}
                    onChange={e => setTools(e.target.value)}
                    required
                    name="tools"
                  />
                </Form.Group>

                <Form.Group as={Col} md="6">
                  <Form.Label>Tipo de Mantenimiento</Form.Label>
                  <Form.Control
                    as="select"
                    value={maintenanceType}
                    onChange={e => setMaintenanceType(e.target.value)}
                    required
                    name="maintenanceType"
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

              <Button type="submit" variant="primary" className="w-100">Crear Tarea</Button>
            </Form>
          </div>
        </Col>

        <Col md={7} style={{ paddingBottom: '20px', paddingLeft: '10px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', flexGrow: 1 }}>
            <ListGroup className="mt-4">
              {tasks.map(task => (
                <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    {`${task.taskCode}`}
                  </div>
                  <div className="d-flex align-items-center" style={{ marginLeft: 'auto' }}>
                    <ButtonGroup className="me-2">
                      <Button variant="outline-info" onClick={() => handleShowDetails(task)}>Ver Detalles</Button>
                    </ButtonGroup>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" id="dropdown-basic">
                        <BsThreeDotsVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleDeleteTask(task.id)}>Borrar Tarea</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleEditTask(task)}>Editar Tarea</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Tarea' : 'Detalles de la Tarea'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              {isEditing ? (
                <>
                  {/* Contenido para editar la tarea */}
                </>
              ) : (
                <>
                  <h5>{selectedTask.taskCode}</h5>
                  <p>Categoría: {selectedTask.placeCategory}</p>
                  <p>Lugar: {selectedTask.place}</p>
                  <p>Fecha: {selectedTask.date}</p>
                  <p>Hora de Ingreso: {selectedTask.checkInTime}</p>
                  <p>Hora de Salida: {selectedTask.checkOutTime}</p>
                  <p>Persona de contacto: {selectedTask.contactPerson}</p>
                  <p>Número de contacto: {selectedTask.contactNumber}</p>
                  <p>Personal Designado: {selectedTask.assignedPersonnel.join(', ')}</p>
                  <p>Herramientas: {selectedTask.tools}</p>
                  <p>Tipo de Mantenimiento: {selectedTask.maintenanceType}</p>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {isEditing ? 'Cancelar' : 'Cerrar'}
          </Button>
          {isEditing ? (
            <Button variant="primary" onClick={handleSaveChanges}>
              Guardar Cambios
            </Button>
          ) : (
            <Button variant="primary" onClick={() => handleEditTask(selectedTask)}>
              Editar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateTaskCard;
