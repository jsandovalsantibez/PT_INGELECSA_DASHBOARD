import React, { useEffect, useState } from 'react';
import { db } from '../firebase';  // Importamos 'db'
import { collection, getDocs } from 'firebase/firestore';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { eachDayOfInterval, format } from 'date-fns';  // Para obtener todos los días dentro del rango

const TaskForm: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);  // Almacena las tareas disponibles
  const [selectedTask, setSelectedTask] = useState<any>(null);  // Almacena la tarea seleccionada
  const [panelMarca, setPanelMarca] = useState<string>('');
  const [lazos, setLazos] = useState<number>(1);
  const [detectorsByLazo, setDetectorsByLazo] = useState<number[]>([0]);
  const [imagesInicio, setImagesInicio] = useState<File[]>([]);
  const [imagesTermino, setImagesTermino] = useState<File[]>([]);
  const [workDays, setWorkDays] = useState<Date[]>([]);  // Array para almacenar los días del periodo de trabajo

  // Función para obtener las tareas desde Firestore
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksCollection = collection(db, 'taskCards');
        const taskDocs = await getDocs(tasksCollection);
        const tasksList = taskDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(tasksList);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  // Manejador de cambio para la tarea seleccionada
  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setSelectedTask(task);  // Asignar la tarea seleccionada
    setPanelMarca(task?.panelMarca || '');  // Cargar los valores de la tarea seleccionada
    setLazos(task?.lazos || 1);
    setDetectorsByLazo(task?.detectorsByLazo || [0]);

    // Calcular los días del periodo de trabajo basado en taskPeriod
    if (task.taskPeriod && task.taskPeriod.length === 2) {
      const [start, end] = task.taskPeriod;
      const days = eachDayOfInterval({
        start: new Date(start.seconds * 1000),  // Convierte la marca de tiempo de Firestore a Date
        end: new Date(end.seconds * 1000),
      });
      setWorkDays(days);  // Actualizamos los días de trabajo
    }
  };

  // Manejador de cambio para las imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: string, dayIndex: number) => {
    const files = e.target.files;
    if (files) {
      const newImages = type === 'inicio' ? [...imagesInicio] : [...imagesTermino];
      newImages[dayIndex] = files[0];
      type === 'inicio' ? setImagesInicio(newImages) : setImagesTermino(newImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para guardar la tarea (no cambia)
    alert('Formulario guardado con éxito');
  };

  return (
    <div className="container mt-4">
      {/* Mostrar la lista de tareas si no se ha seleccionado ninguna */}
      {!selectedTask && (
        <div>
          <h2>Selecciona una tarea</h2>
          <Row>
            {tasks.map(task => (
              <Col key={task.id} md={4} className="d-flex justify-content-center mb-4">
                <Card onClick={() => handleTaskSelect(task.id)} style={{ cursor: 'pointer' }}>
                  <Card.Body>
                    <Card.Title>{task.place}</Card.Title>
                    <Card.Text>{task.date}</Card.Text>
                    <Card.Text><strong>Task Code:</strong> {task.taskCode}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Mostrar el formulario solo si se ha seleccionado una tarea */}
      {selectedTask && (
        <Form onSubmit={handleSubmit}>
          <h2>Formulario de Mantención de Tarea - {selectedTask.taskCode}</h2>

          <Form.Group as={Row} controlId="panelMarca">
            <Form.Label column sm={2}>Marca del Panel</Form.Label>
            <Col sm={10}>
              <Form.Control as="select" value={panelMarca} onChange={(e) => setPanelMarca(e.target.value)}>
                <option value="">Seleccione la Marca</option>
                <option value="Notifire">Notifire</option>
                <option value="Edwards">Edwards</option>
                <option value="Mircom">Mircom</option>
              </Form.Control>
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="lazos">
            <Form.Label column sm={2}>Número de Lazos</Form.Label>
            <Col sm={10}>
              <Form.Control
                as="select"
                value={lazos}
                onChange={(e) => setLazos(parseInt(e.target.value))}
              >
                {[...Array(5)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Form.Control>
            </Col>
          </Form.Group>

          {/* Mostrar los campos de imágenes basados en los días seleccionados */}
          <Form.Group>
            <Form.Label>Subir Imágenes de Inicio y Término de Trabajo</Form.Label>
            {workDays.map((day, index) => (
              <div key={index}>
                <Form.Label> {format(day, 'dd/MM/yyyy')}</Form.Label>
                <input type="file" onChange={(e) => handleImageChange(e, 'inicio', index)} />
                <input type="file" onChange={(e) => handleImageChange(e, 'termino', index)} />
              </div>
            ))}
          </Form.Group>

          <Button type="submit">Guardar</Button>
        </Form>
      )}
    </div>
  );
};

export default TaskForm;
