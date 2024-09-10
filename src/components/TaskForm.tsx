import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { eachDayOfInterval, format } from 'date-fns';
import { useAuth } from '../components/AuthContext';

// Definir una interfaz para el objeto de tarea
interface Task {
  id: string;
  panelMarca?: string;
  lazos?: number;
  detectorsByLazo?: { [key: string]: boolean[] };
  assignedPersonnel: string[];
  taskPeriod?: { seconds: number }[];
  taskCode: string;
  place: string;
  date: string;
}

const TaskForm: React.FC = () => {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [panelMarca, setPanelMarca] = useState<string>('');
  const [lazos, setLazos] = useState<number>(0); // Cambiado a 0 para que no aparezca por defecto
  const [detectorsByLazo, setDetectorsByLazo] = useState<{ [key: string]: boolean[] }>({});
  const [imagesInicio, setImagesInicio] = useState<(File | null)[]>([]);
  const [imagesTermino, setImagesTermino] = useState<(File | null)[]>([]);
  const [workDays, setWorkDays] = useState<Date[]>([]);
  const [uploadedDays, setUploadedDays] = useState<number>(0);
  const [isFolderCreated, setIsFolderCreated] = useState<boolean>(false);

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
        const tasksList = taskDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        const filteredTasks = tasksList.filter(task =>
          role === 'gerente_operaciones' || task.assignedPersonnel.includes(user.uid)
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
    if (task) {
      setSelectedTask(task);
      setPanelMarca(task.panelMarca || '');
      setLazos(task.lazos || 0);
      setDetectorsByLazo(task.detectorsByLazo || {});
      if (task.taskPeriod && task.taskPeriod.length === 2) {
        const [start, end] = task.taskPeriod;
        const days = eachDayOfInterval({
          start: new Date(start.seconds * 1000),
          end: new Date(end.seconds * 1000),
        });
        setWorkDays(days);
        setUploadedDays(0);
        setIsFolderCreated(false);
      }
    }
  };

  // Crear campos de detectores en función de la cantidad de lazos seleccionada
  useEffect(() => {
    const updatedDetectorsByLazo: { [key: string]: boolean[] } = {};
    for (let i = 1; i <= lazos; i++) {
      const lazoKey = `L${i}`;
      updatedDetectorsByLazo[lazoKey] = detectorsByLazo[lazoKey] || Array(50).fill(false); // Inicializar con checkboxes
    }
    setDetectorsByLazo(updatedDetectorsByLazo);
  }, [lazos]);

  const renderDetectorFields = () => {
    const fields = [];
    for (let i = 1; i <= lazos; i++) {
      const lazoKey = `L${i}`;
      const detectors = detectorsByLazo[lazoKey] || Array(50).fill(false);
      fields.push(
        <Col key={i} md={4} className="mb-4"> {/* Columna con card */}
          <Card style={{ height: '300px', overflowY: 'scroll' }}>
            <Card.Body>
              <Card.Title>Lazo {i}</Card.Title>
              <Row>
                {detectors.map((checked, j) => (
                  <Col xs={6} sm={6} md={6} key={`${lazoKey}D${j + 1}`} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      id={`${lazoKey}D${j + 1}`}
                      label={`L${i}D${j + 1}`}
                      checked={checked}
                      onChange={() => handleCheckboxChange(lazoKey, j)}
                      style={{ transform: 'scale(1.5)' }} // Aumentar tamaño del checkbox
                    />
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      );
    }
    return fields;
  };

  // Manejador para cambiar el estado del checkbox del detector
  const handleCheckboxChange = (lazo: string, index: number) => {
    setDetectorsByLazo(prev => ({
      ...prev,
      [lazo]: prev[lazo].map((det, i) => (i === index ? !det : det)),
    }));
  };

  // Función para subir la imagen a Firebase Storage
  const uploadImageToStorage = async (file: File, taskCode: string, day: string, type: string) => {
    try {
      const storageRef = ref(storage, `forms/${taskCode}/${day}_${type}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      console.log('Imagen subida correctamente:', url);
      return url;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  };

  // Manejador para subir imágenes
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'inicio' | 'termino',
    dayIndex: number
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (type === 'inicio') {
        const newImages = [...imagesInicio];
        newImages[dayIndex] = files[0];
        setImagesInicio(newImages);
      } else {
        const newImages = [...imagesTermino];
        newImages[dayIndex] = files[0];
        setImagesTermino(newImages);
      }
    }
  };

  // Manejador para guardar las imágenes de un día específico
  const handleSaveDayImages = async (dayIndex: number) => {
    const selectedDay = format(workDays[dayIndex], 'yyyyMMdd');
    const inicioImage = imagesInicio[dayIndex];
    const terminoImage = imagesTermino[dayIndex];

    if (!inicioImage || !terminoImage) {
      alert('Por favor, sube las imágenes de inicio y término para este día antes de guardar.');
      return;
    }

    try {
      const inicioImageUrl = await uploadImageToStorage(inicioImage!, selectedTask!.taskCode, selectedDay, 'inicio');
      const terminoImageUrl = await uploadImageToStorage(terminoImage!, selectedTask!.taskCode, selectedDay, 'termino');

      const taskDocRef = doc(db, 'taskCards', selectedTask!.id);
      await updateDoc(taskDocRef, {
        [`images.${selectedDay}.inicio`]: inicioImageUrl,
        [`images.${selectedDay}.termino`]: terminoImageUrl,
      });

      alert(`Imágenes del día ${format(workDays[dayIndex], 'dd/MM/yyyy')} guardadas con éxito.`);
      setUploadedDays(dayIndex + 1);
    } catch (error) {
      console.error('Error al guardar las imágenes:', error);
    }
  };

  // Manejador para finalizar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTask) {
      const taskDocRef = doc(db, 'taskCards', selectedTask.id);
      await updateDoc(taskDocRef, {
        panelMarca,
        lazos,
        detectorsByLazo,
      });
      alert('Formulario guardado con éxito');
    }
  };

  return (
    <div className="container mt-4">
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
              <Form.Control as="select" value={lazos} onChange={(e) => setLazos(parseInt(e.target.value))}>
                {[...Array(5)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Form.Control>
            </Col>
          </Form.Group>

          <Row>{lazos > 0 && renderDetectorFields()}</Row> {/* Mostrar los checkboxes solo si hay lazos seleccionados */}

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
                <Button variant="success" className="mt-2" onClick={() => handleSaveDayImages(index)}>
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
