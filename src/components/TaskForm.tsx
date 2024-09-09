import React, { useEffect, useState } from 'react';
import { db } from '../firebase';  // Importamos 'db'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { eachDayOfInterval, format } from 'date-fns';  // Para obtener todos los días dentro del rango
import { useAuth } from '../components/AuthContext';  // Asumiendo que tienes un AuthContext para manejar el usuario

// Definir una interfaz para el objeto de tarea
interface Task {
  id: string;
  panelMarca?: string;
  lazos?: number;
  detectorsByLazo?: number[];
  assignedPersonnel: string[]; // El personal asignado es una lista de IDs de usuario
  taskPeriod?: { seconds: number }[]; // Asegúrate de que el tipo sea correcto
  taskCode: string;
  place: string;
  date: string;
}

const TaskForm: React.FC = () => {
  const { user, role } = useAuth();  // Obtener la información del usuario autenticado
  const [tasks, setTasks] = useState<Task[]>([]);  // Almacena las tareas disponibles
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);  // Almacena la tarea seleccionada
  const [panelMarca, setPanelMarca] = useState<string>('');
  const [lazos, setLazos] = useState<number>(1);
  const [detectorsByLazo, setDetectorsByLazo] = useState<number[]>([0]);
  const [imagesInicio, setImagesInicio] = useState<(File | null)[]>([]);
  const [imagesTermino, setImagesTermino] = useState<(File | null)[]>([]);
  const [workDays, setWorkDays] = useState<Date[]>([]);  // Array para almacenar los días del periodo de trabajo
  const [uploadedDays, setUploadedDays] = useState<number>(0);  // Contador de días guardados

  // Función para obtener las tareas desde Firestore
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!user) {
          console.error('No hay usuario autenticado.');
          return;
        }

        const tasksCollection = collection(db, 'taskCards');
        const taskDocs = await getDocs(tasksCollection);
        const tasksList = taskDocs.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[];  // Decimos a TypeScript que estos son objetos tipo Task
          
        const filteredTasks = tasksList.filter(task => 
          role === 'gerente_operaciones' || task.assignedPersonnel.includes(user.uid)  // Filtrar por usuario asignado o rol de gerente
        );
        setTasks(filteredTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [user, role]);

  // Manejador de cambio para la tarea seleccionada
  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.assignedPersonnel) {
      setSelectedTask(task);  // Asignar la tarea seleccionada
      setPanelMarca(task.panelMarca || '');  // Cargar los valores de la tarea seleccionada
      setLazos(task.lazos || 1);
      setDetectorsByLazo(task.detectorsByLazo || [0]);

      // Calcular los días del periodo de trabajo basado en taskPeriod
      if (task.taskPeriod && task.taskPeriod.length === 2) {
        const [start, end] = task.taskPeriod;
        const days = eachDayOfInterval({
          start: new Date(start.seconds * 1000),  // Convierte la marca de tiempo de Firestore a Date
          end: new Date(end.seconds * 1000),
        });
        setWorkDays(days);  // Actualizamos los días de trabajo
        setUploadedDays(0); // Reiniciar el contador de días guardados
      }
    } else {
      console.error("La tarea seleccionada no tiene la propiedad 'assignedPersonnel'.");
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

  // Manejador para guardar las imágenes de un día específico
  const handleSaveDayImages = async (dayIndex: number) => {
    const selectedDay = format(workDays[dayIndex], 'yyyyMMdd'); // Formato seguro para Firestore
    const inicioImage = imagesInicio[dayIndex];
    const terminoImage = imagesTermino[dayIndex];

    if (!inicioImage || !terminoImage) {
      alert('Por favor, sube las imágenes de inicio y término para este día antes de guardar.');
      return;
    }

    try {
      const taskDocRef = doc(db, 'taskCards', selectedTask!.id);
      await updateDoc(taskDocRef, {
        [`images.${selectedDay}.inicio`]: inicioImage.name,  // Guardar nombre del archivo (o su URL si lo subes)
        [`images.${selectedDay}.termino`]: terminoImage.name,
      });

      alert(`Imágenes del día ${format(workDays[dayIndex], 'dd/MM/yyyy')} guardadas con éxito.`);
      setUploadedDays(dayIndex + 1);  // Avanzar al siguiente día
    } catch (error) {
      console.error('Error al guardar las imágenes:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              <div key={index} style={{ display: index <= uploadedDays ? 'block' : 'none' }}>
                <Form.Label>{format(day, 'dd/MM/yyyy')}</Form.Label>
                <Row>
                  <Col sm={6}>
                    <input type="file" onChange={(e) => handleImageChange(e, 'inicio', index)} />
                  </Col>
                  <Col sm={6}>
                    <input type="file" onChange={(e) => handleImageChange(e, 'termino', index)} />
                  </Col>
                </Row>
                <Button
                  variant="success"
                  className="mt-2"
                  onClick={() => handleSaveDayImages(index)}
                >
                  Guardar Imágenes del Día {format(day, 'dd/MM/yyyy')}
                </Button>
              </div>
            ))}
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-3">Finalizar Formulario</Button>
        </Form>
      )}
    </div>
  );
};

export default TaskForm;
