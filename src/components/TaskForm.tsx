import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { eachDayOfInterval, format } from 'date-fns';
import { useAuth } from '../components/AuthContext';
import '../styles/style_taskform.css';

// Definir una interfaz para el objeto de tarea
interface Task {
  id: string;
  panelMarca?: string;
  lazos?: number;
  detectorsByLazo?: { [key: string]: string[] };
  assignedPersonnel: string[];
  taskPeriod?: { seconds: number }[];
  taskCode: string;
  place: string;
  date: string;
  active?: boolean;
  images?: { [day: string]: { inicio?: string; termino?: string } };
}

const TaskForm: React.FC = () => {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [panelMarca, setPanelMarca] = useState<string>('');
  const [lazos, setLazos] = useState<number>(0);
  const [currentLazo, setCurrentLazo] = useState<number>(1);
  const [detectorsByLazo, setDetectorsByLazo] = useState<{ [key: string]: string[] }>({});
  const [description, setDescription] = useState<string>('');
  const [imagesInicio, setImagesInicio] = useState<(File | null)[]>([]);
  const [imagesTermino, setImagesTermino] = useState<(File | null)[]>([]);
  const [workDays, setWorkDays] = useState<Date[]>([]);
  const [uploadedDays, setUploadedDays] = useState<number>(0);

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

  const handleTaskSelect = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setPanelMarca(task.panelMarca || '');
      setLazos(task.lazos || 0);
      setDetectorsByLazo(task.detectorsByLazo || {});
      setDescription('');
      setCurrentLazo(1);

      if (task.taskPeriod && task.taskPeriod.length === 2) {
        const [start, end] = task.taskPeriod;
        const days = eachDayOfInterval({
          start: new Date(start.seconds * 1000),
          end: new Date(end.seconds * 1000),
        });
        setWorkDays(days);

        await checkUploadedImages(task, days);
      }
    }
  };

  const checkUploadedImages = async (task: Task, days: Date[]) => {
    try {
      const taskDocRef = doc(db, 'taskCards', task.id);
      const taskDoc = await getDoc(taskDocRef);
      const taskData = taskDoc.data() as Task;

      let count = 0;
      for (let i = 0; i < days.length; i++) {
        const dayKey = format(days[i], 'yyyyMMdd');
        if (taskData.images && taskData.images[dayKey]) {
          count++;
        }
      }
      setUploadedDays(count);
      setImagesInicio(Array(days.length).fill(null));
      setImagesTermino(Array(days.length).fill(null));
    } catch (error) {
      console.error('Error al verificar imágenes subidas:', error);
    }
  };

  useEffect(() => {
    const updatedDetectorsByLazo: { [key: string]: string[] } = {};
    for (let i = 1; i <= lazos; i++) {
      const lazoKey = `L${i}`;
      updatedDetectorsByLazo[lazoKey] = detectorsByLazo[lazoKey] || Array(50).fill('no_hecho');
    }
    setDetectorsByLazo(updatedDetectorsByLazo);
  }, [lazos]);

  const renderDetectorFields = () => {
    const lazoKey = `L${currentLazo}`;
    const detectors = detectorsByLazo[lazoKey] || Array(50).fill('no_hecho');

    return (
      <div style={{ height: '100%', overflowY: 'auto', padding: '10px', width: '100%' }}>
        <Card.Body>
          <Card.Title>Dispositivos del Lazo {currentLazo}</Card.Title>
          <Row>
            {/* Primera columna de detectores (1-25) */}
            <Col xs={6}>
              {detectors.slice(0, 25).map((state, index) => (
                <div key={`${lazoKey}D${index + 1}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <Form.Label style={{ marginRight: '10px' }}>{`L${currentLazo}D${index + 1}`}</Form.Label>
                  <Button
                    variant={state === 'hecho' ? 'success' : 'outline-success'}
                    onClick={() => handleStateChange(lazoKey, index, 'hecho')}
                    className="mr-2"
                    size="sm"
                  >
                    Hecho
                  </Button>
                  <Button
                    variant={state === 'no_hecho' ? 'danger' : 'outline-danger'}
                    onClick={() => handleStateChange(lazoKey, index, 'no_hecho')}
                    className="mr-2"
                    size="sm"
                  >
                    No Hecho
                  </Button>
                  <Button
                    variant={state === 'obstruido' ? 'warning' : 'outline-warning'}
                    onClick={() => handleStateChange(lazoKey, index, 'obstruido')}
                    size="sm"
                  >
                    Obstruido
                  </Button>
                </div>
              ))}
            </Col>
            {/* Segunda columna de detectores (26-50) */}
            <Col xs={6}>
              {detectors.slice(25, 50).map((state, index) => (
                <div key={`${lazoKey}D${index + 26}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <Form.Label style={{ marginRight: '10px' }}>{`L${currentLazo}D${index + 26}`}</Form.Label>
                  <Button
                    variant={state === 'hecho' ? 'success' : 'outline-success'}
                    onClick={() => handleStateChange(lazoKey, index + 25, 'hecho')}
                    className="mr-2"
                    size="sm"
                  >
                    Hecho
                  </Button>
                  <Button
                    variant={state === 'no_hecho' ? 'danger' : 'outline-danger'}
                    onClick={() => handleStateChange(lazoKey, index + 25, 'no_hecho')}
                    className="mr-2"
                    size="sm"
                  >
                    No Hecho
                  </Button>
                  <Button
                    variant={state === 'obstruido' ? 'warning' : 'outline-warning'}
                    onClick={() => handleStateChange(lazoKey, index + 25, 'obstruido')}
                    size="sm"
                  >
                    Obstruido
                  </Button>
                </div>
              ))}
            </Col>
          </Row>
        </Card.Body>
      </div>
    );
  };

  const handleStateChange = (lazo: string, index: number, state: string) => {
    setDetectorsByLazo(prev => ({
      ...prev,
      [lazo]: prev[lazo].map((det, i) => (i === index ? state : det)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTask) {
      try {
        const taskDocRef = doc(db, 'taskCards', selectedTask.id);
        await updateDoc(taskDocRef, {
          panelMarca,
          lazos,
          detectorsByLazo,
          description,
          active: true,
        });

        alert('Formulario guardado con éxito');
      } catch (error) {
        console.error('Error al guardar la tarea:', error);
      }
    }
  };

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

  const uploadImageToStorage = async (file: File, taskCode: string, day: string, type: 'inicio' | 'termino') => {
    const storageRef = ref(storage, `taskImages/${taskCode}/${day}/${type}-${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

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
        active: true,
      });

      alert(`Imágenes del día ${format(workDays[dayIndex], 'dd/MM/yyyy')} guardadas con éxito.`);
      setUploadedDays(dayIndex + 1);
    } catch (error) {
      console.error('Error al guardar las imágenes:', error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a2b4c', minHeight: '100vh', overflow: 'hidden' }}>
      <h2 style={{ color: 'white', marginBottom: '10px' }}>Formulario de trabajo</h2>
      <hr style={{ borderTop: '3px solid white', marginBottom: '30px' }} />

      <Form onSubmit={handleSubmit}>
      <Row className="task-container">
        {/* Cuadrante 1 */}
        <Col md={6} className="task-card">
          <Card className="task-form">
            <Card.Body>
              <Form.Group controlId="taskSelect">
                <Form.Label>Seleccionar Tarea</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedTask?.id || ''}
                  onChange={(e) => handleTaskSelect(e.target.value)}
                >
                  <option value="">Seleccione una tarea</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.taskCode}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="description">
                <Form.Label>Descripción del Sistema</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>
              {selectedTask && (
        <Button type="submit" variant="primary" className="mt-3">
          Guardar Formulario
        </Button>
      )}
            </Card.Body>
          </Card>
        </Col>

        {/* Cuadrante 2 */}
        <Col md={6} className="task-card">
          <Card className="task-form">
            <Card.Body>
              <Form.Group>
                <Form.Label>Subir Imágenes de Inicio y Término de Trabajo</Form.Label>
                {workDays.map((day, index) => (
                  <div key={index} style={{ display: index <= uploadedDays ? 'block' : 'none' }}>
                    <Form.Label>{`Día: ${format(day, 'dd/MM/yyyy')}`}</Form.Label>
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="task-container">
        {/* Cuadrante 3 */}
        <Col md={6} className="task-card">
          <Card className="task-form">
            <Card.Body>
              <Form.Group controlId="panelMarca">
                <Form.Label>Marca del Panel</Form.Label>
                <Form.Control as="select" value={panelMarca} onChange={(e) => setPanelMarca(e.target.value)}>
                  <option value="">Seleccione la Marca</option>
                  <option value="Notifire">Notifire</option>
                  <option value="Edwards">Edwards</option>
                  <option value="Mircom">Mircom</option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="lazos">
                <Form.Label>Número de Lazos</Form.Label>
                <Form.Control as="select" value={lazos} onChange={(e) => setLazos(parseInt(e.target.value))}>
                  {[...Array(5)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="currentLazo">
                <Form.Label>Lazo</Form.Label>
                <Form.Control
                  as="select"
                  value={currentLazo}
                  onChange={(e) => setCurrentLazo(parseInt(e.target.value))}
                  disabled={lazos === 0}
                >
                  {[...Array(lazos)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Cuadrante 4 con scroll interno */}
        <Col md={6} className="task-card">
          <Card className="task-form detector-card">
            <Card.Body>
              {lazos > 0 && renderDetectorFields()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </Form>
    </div>
  );
};

export default TaskForm;
