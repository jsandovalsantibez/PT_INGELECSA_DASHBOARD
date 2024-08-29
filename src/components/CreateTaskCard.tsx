import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { Form, Button, Col, Row, ListGroup, ButtonGroup } from 'react-bootstrap';

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

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("¿Está seguro que desea borrar esta tarea?")) {
      console.log(`Tarea con ID ${taskId} borrada`);
      // Aquí agregaremos la funcionalidad para eliminar la tarea
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Formulario con menos espacio entre parámetros */}
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

      {/* Lista de tareas existentes, deshabilitadas con botones */}
      <ListGroup className="mt-4">
        {tasks.map(task => (
          <ListGroup.Item key={task.id} disabled={!task.active} className="d-flex justify-content-between align-items-center">
            <div>
              {task.place} - {task.date}
            </div>
            <ButtonGroup>
              <Button 
                style={{ backgroundColor: '#003366', borderColor: '#003366' }} 
                disabled={!task.active}
              >
                Asignar Tareas
              </Button>
              <Button 
                style={{ backgroundColor: '#003366', borderColor: '#003366' }} 
                disabled={!task.active}
              >
                Ver Detalles
              </Button>
              <Button 
                style={{ backgroundColor: '#8B0000', borderColor: '#8B0000' }} 
                onClick={() => handleDeleteTask(task.id)}
              >
                Borrar Tarea
              </Button>
            </ButtonGroup>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default CreateTaskCard;
