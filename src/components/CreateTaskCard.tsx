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
  const [taskCode, setTaskCode] = useState(''); // Código de la tarea
  
  const [taskPeriod, setTaskPeriod] = useState<[Date | null, Date | null]>([null, null]);  // Periodo de tarea
  const [personnelList, setPersonnelList] = useState<any[]>([]); // Lista de trabajadores

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

  // Mapa para la nomenclatura de las categorías de lugares
  const categoryCodeMap: { [key: string]: string } = {
    homecenter: 'HC',
    falabella: 'FAB',
    tottus: 'TOT',
    ikea: 'IKEA'
  };

  // Función para generar el código de tarea
  const generateTaskCode = () => {
    if (!placeCategory || !place || !date || !maintenanceType) return;

    const categoryCode = categoryCodeMap[placeCategory];
    const maintenanceCode = maintenanceTypes.find(type => type.value === maintenanceType)?.code;

    const taskDate = new Date(date);
    const day = String(taskDate.getDate()).padStart(2, '0');
    const month = taskDate.toLocaleString('default', { month: 'short' }).toUpperCase();

    // Código de tarea basado en los valores seleccionados
    const newTaskCode = `${categoryCode}_${place.toUpperCase()}_PCII_INGELECSA_${maintenanceCode}_${month}_${day}_1`;

    setTaskCode(newTaskCode); // Guardar el código de la tarea
  };

  useEffect(() => {
    generateTaskCode(); // Generar código cada vez que cambie el formulario
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
    
    // Obtener la lista de trabajadores
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const db = getFirestore();

    try {
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
        taskCode, // Guardar el código de la tarea generado
        taskPeriod,
        active: false,
      });
      alert("Card creada con éxito!");

      // Restablecer el estado del formulario
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
    setEditedTask({ ...task }); // Carga la tarea seleccionada para editarla
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
        </Col>

        <Col md={7}>
          <ListGroup className="mt-4">
            {tasks.map(task => (
              <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
                <div>
                  {`${task.taskCode}`} {/* Mostrar el código de la tarea */}
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
                  <Form.Group as={Col} md="12">
                    <Form.Label>Categoría del Lugar</Form.Label>
                    <Form.Control
                      as="select"
                      name="placeCategory"
                      value={editedTask?.placeCategory || ''}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Seleccione una categoría</option>
                      {Object.keys(placesByCategory).map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group as={Col} md="12">
                    <Form.Label>Lugar</Form.Label>
                    <Form.Control
                      as="select"
                      name="place"
                      value={editedTask?.place || ''}
                      onChange={handleInputChange}
                      disabled={!editedTask?.placeCategory}
                    >
                      <option value="" disabled>Seleccione un lugar</option>
                      {editedTask?.placeCategory && placesByCategory[editedTask.placeCategory]?.map((placeOption) => (
                        <option key={placeOption} value={placeOption}>{placeOption}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group as={Col} md="12">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={editedTask?.date || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="12">
                    <Form.Label>Hora de Ingreso</Form.Label>
                    <Form.Control
                      type="time"
                      name="checkInTime"
                      value={editedTask?.checkInTime || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="12">
                    <Form.Label>Hora de Salida</Form.Label>
                    <Form.Control
                      type="time"
                      name="checkOutTime"
                      value={editedTask?.checkOutTime || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="12">
                    <Form.Label>Persona de Contacto</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactPerson"
                      value={editedTask?.contactPerson || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="12">
                    <Form.Label>Número de Contacto</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactNumber"
                      value={editedTask?.contactNumber || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="12">
                    <Form.Label>Personal Designado</Form.Label>
                    <Form.Control
                      type="text"
                      name="assignedPersonnel"
                      value={editedTask?.assignedPersonnel || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="12">
                    <Form.Label>Herramientas</Form.Label>
                    <Form.Control
                      type="text"
                      name="tools"
                      value={editedTask?.tools || ''}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="12">
                    <Form.Label>Tipo de Mantenimiento</Form.Label>
                    <Form.Control
                      as="select"
                      name="maintenanceType"
                      value={editedTask?.maintenanceType || ''}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>Seleccione un tipo de mantenimiento</option>
                      {maintenanceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </>
              ) : (
                <>
                  <h5>{selectedTask.taskCode}</h5> {/* Mostrar código generado */}
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
