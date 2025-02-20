import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Form, Button, ListGroup, Dropdown, Modal
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc
} from 'firebase/firestore';
import { BsThreeDotsVertical } from 'react-icons/bs';
import '../styles/style_createtaskcard.css';

interface Task {
  id: string;
  // Campos originales
  assignedPersonnel?: string[];
  tools?: string[];
  maintenanceType?: string;
  taskPeriod?: [Date | null, Date | null];
  taskCode?: string;
  panelMarca?: string;
  lazos?: number;
  description?: string;
  active?: boolean;
  coordinates?: { lat: number; lng: number };

  // NUEVOS CAMPOS de mantención
  negocio?: string;
  centroCosto?: string;
  storeName?: string;
  ot?: string;
  maintenanceDate?: Date | null;
  reportCreatedBy?: string;
  reportDate?: Date | null;

  // Campos de la "Información de Contacto" (si los usabas)
  contactPerson?: string[];
  contactNumber?: string;

  // (Otros campos que pudieran existir)
  placeCategory?: string; // Si aún se usan en la lista, etc.
  place?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

const CreateTaskForm: React.FC = () => {
  // --- NUEVOS CAMPOS: Información de mantención ---
  const [negocio, setNegocio] = useState('');
  const [centroCosto, setCentroCosto] = useState('');
  const [lugar, setLugar] = useState('');
  const [storeName, setStoreName] = useState('');
  const [ot, setOt] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState<Date | null>(null);
  const [reportCreatedBy, setReportCreatedBy] = useState('');
  const [reportDate, setReportDate] = useState<Date | null>(null);
  // Se mantienen Hora de Ingreso y Salida
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');

  // --- CAMPOS DE INFORMACIÓN DE CONTACTO ---
  const [contactPerson, setContactPerson] = useState<string[]>(['']);
  const [contactNumber, setContactNumber] = useState('');

  // --- INFORMACIÓN DEL PERSONAL ---
  const [assignedPersonnel, setAssignedPersonnel] = useState<string[]>([]);
  const [personnelList, setPersonnelList] = useState<any[]>([]);

  // --- OTROS CAMPOS ---
  const [tools, setTools] = useState<string[]>(['']);
  const [maintenanceType, setMaintenanceType] = useState('');
  const [taskPeriod, setTaskPeriod] = useState<[Date | null, Date | null]>([null, null]);
  const [taskCode, setTaskCode] = useState('');

  // --- INFORMACIÓN DEL PANEL ---
  const [panelMarca, setPanelMarca] = useState('');
  const [lazos, setLazos] = useState<number>(0);
  const [description, setDescription] = useState('');

  // --- LISTADO DE TAREAS Y MODAL ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  // --- ESTADOS PARA DETECTORES (si se usan en el formulario) ---
  const [detectorsByLazo, setDetectorsByLazo] = useState<{ [key: string]: string[] }>({});
  const [imagesInicio, setImagesInicio] = useState<(File | null)[]>([]);
  const [imagesTermino, setImagesTermino] = useState<(File | null)[]>([]);
  const [workDays, setWorkDays] = useState<Date[]>([]);
  const [uploadedDays, setUploadedDays] = useState<number>(0);

  // --- ESTADOS PARA MODAL DE VISTA PREVIA ---
  const [showPreview, setShowPreview] = useState(false);

  // Opciones de select para Negocio (antes: placeCategory)
  const negociosOptions: { [key: string]: string[] } = {
    homecenter: ["Estación Central", "Independencia", "El Bosque"],
    falabella: ["Costanera", "Parque Arauco", "Independencia"],
    tottus: ["El Bosque", "Estación Central", "Buin"],
    ikea: ["Parque Arauco"],
  };

  const maintenanceTypes = [
    { value: 'mantencion_preventiva', label: 'Mantención Preventiva', code: 'MP' },
    { value: 'mantencion_correctiva', label: 'Mantención Correctiva', code: 'MC' },
    { value: 'inspeccion', label: 'Inspección', code: 'INS' },
    { value: 'emergencia', label: 'Emergencia', code: 'EMR' },
  ];

  const categoryCodeMap: { [key: string]: string } = {
    homecenter: 'HC',
    falabella: 'FAB',
    tottus: 'TOT',
    ikea: 'IKEA'
  };

  // Mapa de coordenadas
  const coordinatesMap: { [key: string]: { [key: string]: { lat: number; lng: number } } } = {
    homecenter: {
      "Estación Central": { lat: -33.454371, lng: -70.680380 },
      "Independencia": { lat: -33.424107, lng: -70.654372 },
      "El Bosque": { lat: -33.553972, lng: -70.675679 },
    },
    falabella: {
      "Costanera": { lat: -33.417795, lng: -70.606300 },
      "Parque Arauco": { lat: -33.400925, lng: -70.576960 },
      "Independencia": { lat: -33.424524, lng: -70.654489 },
    },
    tottus: {
      "El Bosque": { lat: -33.553663, lng: -70.675051 },
      "Estación Central": { lat: -33.452455, lng: -70.682363 },
      "Buin": { lat: -33.731844, lng: -70.734692 },
    },
    ikea: {
      "Parque Arauco": { lat: -33.401161, lng: -70.575539 },
    },
  };

  // --- Generar "Nombre de Tienda" (Negocio + Lugar) ---
  useEffect(() => {
    if (negocio && lugar) {
      setStoreName(`${negocio} ${lugar}`);
    } else {
      setStoreName('');
    }
  }, [negocio, lugar]);

  // --- Generar taskCode (usando Negocio, Lugar y Tipo de Mantenimiento) ---
  const generateTaskCode = () => {
    if (!negocio || !lugar || !maintenanceType) return;
    const categoryCode = categoryCodeMap[negocio];
    const maintenanceObj = maintenanceTypes.find(type => type.value === maintenanceType);
    const maintenanceCode = maintenanceObj?.code || 'XX';
    const newTaskCode = `${categoryCode}_${lugar.toUpperCase()}_PCII_INGELECSA_${maintenanceCode}`;
    setTaskCode(newTaskCode);
  };

  useEffect(() => {
    generateTaskCode();
  }, [negocio, lugar, maintenanceType]);

  // --- Cargar Tareas ---
  const fetchTasks = async () => {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, "taskCards"));
    const tasksList = querySnapshot.docs.map(docSnapshot => ({
      id: docSnapshot.id,
      ...(docSnapshot.data() as Omit<Task, 'id'>),
    }));
    setTasks(tasksList);
  };

  // --- Cargar Personal ---
  const fetchPersonnel = async () => {
    const db = getFirestore();
    const q = collection(db, 'users');
    const personnelDocs = await getDocs(q);
    const personnelArray = personnelDocs.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPersonnelList(personnelArray);
  };

  useEffect(() => {
    fetchTasks();
    fetchPersonnel();
  }, []);

  // --- Manejo de checkboxes para técnicos ---
  const handlePersonnelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setAssignedPersonnel(prev =>
      checked ? [...prev, value] : prev.filter(person => person !== value)
    );
  };

  // --- CREAR TAREA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    generateTaskCode();
    if (!taskCode) {
      alert("No se pudo generar el código de la tarea. Revisa Negocio, Lugar y Tipo de Mantenimiento.");
      return;
    }
    try {
      const db = getFirestore();
      const coords = coordinatesMap[negocio]?.[lugar];
      if (!coords) {
        alert("Coordenadas no encontradas para el lugar seleccionado.");
        return;
      }
      await addDoc(collection(db, "taskCards"), {
        // Información de la Mantención
        negocio,
        centroCosto,
        storeName,
        ot,
        maintenanceDate,
        reportCreatedBy,
        reportDate,
        checkInTime,
        checkOutTime,
        // Información de Contacto
        contactPerson,
        contactNumber,
        // Información del Personal
        assignedPersonnel,
        // Periodo de la Tarea
        taskPeriod,
        // Herramientas y Tipo de Mantenimiento
        tools,
        maintenanceType,
        // Información del Panel
        panelMarca,
        lazos,
        description,
        // Generado
        taskCode,
        active: false,
        coordinates: coords
      });
      alert("Tarea creada con éxito!");
      // Resetear formulario
      setNegocio('');
      setCentroCosto('');
      setLugar('');
      setStoreName('');
      setOt('');
      setMaintenanceDate(null);
      setReportCreatedBy('');
      setReportDate(null);
      setCheckInTime('');
      setCheckOutTime('');
      setContactPerson(['']);
      setContactNumber('');
      setAssignedPersonnel([]);
      setTools(['']);
      setMaintenanceType('');
      setTaskPeriod([null, null]);
      setTaskCode('');
      setPanelMarca('');
      setLazos(0);
      setDescription('');
      fetchTasks();
    } catch (error) {
      console.error("Error al crear la tarea: ", error);
    }
  };

  // --- BORRAR TAREA ---
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("¿Está seguro que desea borrar esta tarea?")) {
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "taskCards", taskId));
        fetchTasks();
        alert("Tarea borrada con éxito.");
      } catch (error) {
        console.error("Error al borrar la tarea:", error);
      }
    }
  };

  // --- MODAL: DETALLES / EDICIÓN ---
  const handleShowDetails = (task: Task) => {
    setSelectedTask(task);
    setEditedTask(task);
    setShowModal(true);
    setIsEditing(false);
  };

  const handleEditTask = (task: Task) => {
    setIsEditing(true);
    setEditedTask({ ...task });
    setShowModal(true);
  };

  const handleSaveChanges = async () => {
    if (!editedTask) return;
    try {
      const db = getFirestore();
      const taskRef = doc(db, 'taskCards', editedTask.id);
      const filteredEditedTask = Object.fromEntries(
        Object.entries(editedTask).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(taskRef, filteredEditedTask);
      alert('Tarea actualizada con éxito!');
      setShowModal(false);
      setIsEditing(false);
      fetchTasks();
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  return (
    <Container fluid className="create-task-container">
      <Row>
        <Col xs={12}>
          <h2 className="create-task-title">Creación y Edición de Tareas</h2>
          <hr className="create-task-hr" />
        </Col>
      </Row>

      {/* Nuevo apartado: Información de la Mantención */}
      <Row className="g-3">
        <Col xs={12} className="mb-3">
          <div className="task-form-card">
            <div className="form-wrapper">
              <h4 className="section-title">Información de la Mantención</h4>
              <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} controlId="negocio">
                  <Form.Label>Negocio</Form.Label>
                  <Form.Control
                    as="select"
                    value={negocio}
                    onChange={(e) => {
                      setNegocio(e.target.value);
                      setLugar('');
                    }}
                    required
                  >
                    <option value="" disabled>Seleccione un negocio</option>
                    <option value="homecenter">Homecenter</option>
                    <option value="falabella">Falabella</option>
                    <option value="tottus">Tottus</option>
                    <option value="ikea">Ikea</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group as={Col} xs={12} md={6} controlId="centroCosto">
                  <Form.Label>Centro de Costo</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese el centro de costo"
                    value={centroCosto}
                    onChange={(e) => setCentroCosto(e.target.value)}
                    required
                  />
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} controlId="lugar">
                  <Form.Label>Lugar</Form.Label>
                  <Form.Control
                    as="select"
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    required
                    disabled={!negocio}
                  >
                    <option value="" disabled>Seleccione el Lugar</option>
                    {negocio && negociosOptions[negocio]?.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group as={Col} xs={12} md={6} controlId="storeName">
                  <Form.Label>Nombre de Tienda</Form.Label>
                  <Form.Control
                    type="text"
                    value={storeName}
                    readOnly
                  />
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} controlId="ot">
                  <Form.Label>Orden de Trabajo (OT)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese la OT"
                    value={ot}
                    onChange={(e) => setOt(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group as={Col} xs={12} md={6} controlId="maintenanceDate">
                  <Form.Label>Fecha de Mantenimiento</Form.Label>
                  <DatePicker
                    selected={maintenanceDate}
                    onChange={(date: Date | null) => setMaintenanceDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    required
                  />
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} controlId="reportCreatedBy">
                  <Form.Label>Informe creado por</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="(Standby)"
                    value={reportCreatedBy}
                    onChange={(e) => setReportCreatedBy(e.target.value)}
                    disabled
                  />
                </Form.Group>
                <Form.Group as={Col} xs={12} md={6} controlId="reportDate">
                  <Form.Label>Fecha Informe</Form.Label>
                  <DatePicker
                    selected={reportDate}
                    onChange={(date: Date | null) => setReportDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    disabled
                  />
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} xs={6} controlId="checkInTime">
                  <Form.Label>Hora de Ingreso</Form.Label>
                  <Form.Control
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group as={Col} xs={6} controlId="checkOutTime">
                  <Form.Label>Hora de Salida</Form.Label>
                  <Form.Control
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    required
                  />
                </Form.Group>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      {/* --- Resto del formulario (Información de Contacto, Personal, Periodo, Herramientas, Información del Panel) --- */}
      <Row className="g-3">
        {/* Columna izquierda: Información de Contacto */}
        <Col xs={12} md={5} className="left-column">
          <div className="task-form-card">
            <div className="form-wrapper">
              <h4 className="section-title">Información de Contacto</h4>
              <Row className="mb-3">
                <Form.Group as={Col} xs={12}>
                  <Form.Label>Personal de Contacto</Form.Label>
                  {contactPerson.map((person, index) => (
                    <Form.Control
                      key={index}
                      type="text"
                      placeholder="Nombre y Apellido"
                      value={person}
                      onChange={(e) => {
                        const updated = [...contactPerson];
                        updated[index] = e.target.value;
                        setContactPerson(updated);
                      }}
                      required
                      className="mb-2"
                    />
                  ))}
                  <Button variant="outline-primary" onClick={() => setContactPerson([...contactPerson, ''])} className="w-100">
                    Agregar otra persona
                  </Button>
                </Form.Group>
                <Form.Group as={Col} xs={12} className="mt-3">
                  <Form.Label>Número de Contacto</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="+569xxxxxxxx"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                  />
                </Form.Group>
              </Row>
            </div>
          </div>
        </Col>

        {/* Columna derecha: Información del Personal, Periodo, Herramientas y Panel */}
        <Col xs={12} md={7} className="right-column">
          <div className="task-form-card">
            <div className="form-wrapper">
              {/* Información del Personal */}
              <h4 className="section-title">Información del Personal</h4>
              <Form.Group className="mb-3">
                <Form.Label>Seleccionar Técnicos de Soporte</Form.Label>
                {personnelList.map((person) => (
                  <Form.Check
                    key={person.id}
                    type="checkbox"
                    label={person.fullName}
                    value={person.id}
                    onChange={handlePersonnelChange}
                  />
                ))}
              </Form.Group>

              {/* Periodo de la Tarea */}
              <Form.Group className="mb-3">
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

              {/* Herramientas y Tipo de Mantenimiento */}
              <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6}>
                  <Form.Label>Herramientas</Form.Label>
                  {tools.map((tool, index) => (
                    <Form.Control
                      key={index}
                      type="text"
                      placeholder="Ingrese una herramienta"
                      value={tool}
                      onChange={(e) => {
                        const updated = [...tools];
                        updated[index] = e.target.value;
                        setTools(updated);
                      }}
                      required
                      className="mb-2"
                    />
                  ))}
                  <Button variant="outline-primary" onClick={() => setTools([...tools, ''])} className="w-100">
                    Agregar otra herramienta
                  </Button>
                </Form.Group>
                <Form.Group as={Col} xs={12} md={6}>
                  <Form.Label>Tipo de Mantenimiento</Form.Label>
                  <Form.Control
                    as="select"
                    value={maintenanceType}
                    onChange={(e) => setMaintenanceType(e.target.value)}
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

              {/* Información del Panel */}
              <h4 className="section-title">Información del Panel</h4>
              <Row className="mb-3">
                <Form.Group as={Col} xs={12} controlId="panelMarca">
                  <Form.Label>Marca del Panel</Form.Label>
                  <Form.Control
                    as="select"
                    value={panelMarca}
                    onChange={(e) => setPanelMarca(e.target.value)}
                  >
                    <option value="">Seleccione la Marca</option>
                    <option value="Notifire">Notifire</option>
                    <option value="Edwards">Edwards</option>
                    <option value="Mircom">Mircom</option>
                  </Form.Control>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6}>
                  <Form.Label>Número de Lazos</Form.Label>
                  <Form.Control
                    as="select"
                    value={lazos}
                    onChange={(e) => setLazos(parseInt(e.target.value))}
                  >
                    {[...Array(5)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group as={Col} xs={12} md={6}>
                  <Form.Label>Descripción del Sistema</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </Row>

              <Button type="submit" variant="primary" className="w-100" onClick={handleSubmit}>
                Crear Tarea
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Lista de Tareas */}
      <Row className="mt-4">
        <Col xs={12}>
          <div className="task-list-card">
            <ListGroup className="mt-4">
              {tasks.map((task) => (
                <ListGroup.Item
                  key={task.id}
                  className="d-flex align-items-center justify-content-between my-list-item"
                >
                  <div className="task-code me-2">
                    {task.taskCode}
                  </div>
                  <Dropdown align="end" className="three-dots-dropdown">
                    <Dropdown.Toggle variant="link" id="dropdown-basic" className="p-0 three-dots-btn">
                      <BsThreeDotsVertical size={20} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleShowDetails(task)}>
                        Ver Detalles
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleDeleteTask(task.id)}>
                        Borrar Tarea
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => handleEditTask(task)}>
                        Editar Tarea
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Col>
      </Row>

      {/* Modal de Detalles / Edición */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Tarea' : 'Detalles de la Tarea'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && !isEditing && (
            <>
              <h5>{selectedTask.taskCode}</h5>
              <p><strong>Negocio:</strong> {selectedTask.negocio}</p>
              <p><strong>Centro de Costo:</strong> {selectedTask.centroCosto}</p>
              <p><strong>Nombre de Tienda:</strong> {selectedTask.storeName}</p>
              <p><strong>OT:</strong> {selectedTask.ot}</p>
              <p><strong>Fecha de Mantenimiento:</strong> {selectedTask.maintenanceDate?.toString()}</p>
              <p><strong>Hora de Ingreso:</strong> {selectedTask.checkInTime}</p>
              <p><strong>Hora de Salida:</strong> {selectedTask.checkOutTime}</p>
              <p><strong>Contacto:</strong> {selectedTask.contactPerson?.join(', ')}</p>
              <p><strong>Número de Contacto:</strong> {selectedTask.contactNumber}</p>
              <p><strong>Personal Designado:</strong> {selectedTask.assignedPersonnel?.join(', ')}</p>
              <p><strong>Herramientas:</strong> {selectedTask.tools?.join(', ')}</p>
              <p><strong>Tipo de Mantenimiento:</strong> {selectedTask.maintenanceType}</p>
              <p><strong>Periodo de la Tarea:</strong> {selectedTask.taskPeriod ? `Del ${selectedTask.taskPeriod[0]?.toString()} al ${selectedTask.taskPeriod[1]?.toString()}` : 'No definido'}</p>
              <p><strong>Marca del Panel:</strong> {selectedTask.panelMarca}</p>
              <p><strong>Número de Lazos:</strong> {selectedTask.lazos}</p>
              <p><strong>Descripción del Sistema:</strong> {selectedTask.description}</p>
            </>
          )}
          {selectedTask && isEditing && (
            <>
              <p>Formulario de Edición no implementado aún</p>
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
            <Button variant="primary" onClick={() => handleEditTask(selectedTask!)}>
              Editar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateTaskForm;
