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
  active?: boolean;
}

const TaskForm: React.FC = () => {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [panelMarca, setPanelMarca] = useState<string>('');
  const [lazos, setLazos] = useState<number>(0);
  const [currentLazo, setCurrentLazo] = useState<number>(1); // Nuevo estado para seleccionar el lazo actual
  const [detectorsByLazo, setDetectorsByLazo] = useState<{ [key: string]: boolean[] }>({});
  const [description, setDescription] = useState<string>(''); // Nueva descripción del sistema
  const [imagesInicio, setImagesInicio] = useState<(File | null)[]>([]);
  const [imagesTermino, setImagesTermino] = useState<(File | null)[]>([]);
  const [workDays, setWorkDays] = useState<Date[]>([]);
  const [uploadedDays, setUploadedDays] = useState<number>(0);

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

  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setPanelMarca(task.panelMarca || '');
      setLazos(task.lazos || 0);
      setDetectorsByLazo(task.detectorsByLazo || {});
      setDescription(''); // Reiniciar descripción al cambiar tarea
      setCurrentLazo(1); // Reiniciar el lazo actual a 1
      // Cargar días de trabajo
      if (task.taskPeriod && task.taskPeriod.length === 2) {
        const [start, end] = task.taskPeriod;
        const days = eachDayOfInterval({
          start: new Date(start.seconds * 1000),
          end: new Date(end.seconds * 1000),
        });
        setWorkDays(days);
        setUploadedDays(0);
      }
    }
  };

  // Crear campos de detectores en función de la cantidad de lazos seleccionada
  useEffect(() => {
    const updatedDetectorsByLazo: { [key: string]: boolean[] } = {};
    for (let i = 1; i <= lazos; i++) {
      const lazoKey = `L${i}`;
      updatedDetectorsByLazo[lazoKey] = detectorsByLazo[lazoKey] || Array(50).fill(false);
    }
    setDetectorsByLazo(updatedDetectorsByLazo);
  }, [lazos]);

  const renderDetectorFields = () => {
    const lazoKey = `L${currentLazo}`;
    const detectors = detectorsByLazo[lazoKey] || Array(50).fill(false);

    return (
      <Card style={{ height: '400px', overflowY: 'scroll', padding: '10px' }}>
        <Card.Body>
          <Card.Title>Dispositivos del Lazo {currentLazo}</Card.Title>
          <Row>
            <Col xs={6}>
              {detectors.slice(0, 25).map((checked, j) => (
                <div key={`${lazoKey}D${j + 1}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <Form.Check
                    type="checkbox"
                    id={`${lazoKey}D${j + 1}`}
                    checked={checked}
                    onChange={() => handleCheckboxChange(lazoKey, j)}
                    style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                  />
                  <Form.Label htmlFor={`${lazoKey}D${j + 1}`}>{`L${currentLazo}D${j + 1}`}</Form.Label>
                </div>
              ))}
            </Col>
            <Col xs={6}>
              {detectors.slice(25, 50).map((checked, j) => (
                <div key={`${lazoKey}D${j + 26}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <Form.Check
                    type="checkbox"
                    id={`${lazoKey}D${j + 26}`}
                    checked={checked}
                    onChange={() => handleCheckboxChange(lazoKey, j + 25)}
                    style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                  />
                  <Form.Label htmlFor={`${lazoKey}D${j + 26}`}>{`L${currentLazo}D${j + 26}`}</Form.Label>
                </div>
              ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const handleCheckboxChange = (lazo: string, index: number) => {
    setDetectorsByLazo(prev => ({
      ...prev,
      [lazo]: prev[lazo].map((det, i) => (i === index ? !det : det)),
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
          description, // Guardar la descripción en la base de datos
        });

        alert('Formulario guardado con éxito');
      } catch (error) {
        console.error('Error al guardar la tarea:', error);
      }
    }
  };

  // Función para subir las imágenes
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
      });

      alert(`Imágenes del día ${format(workDays[dayIndex], 'dd/MM/yyyy')} guardadas con éxito.`);
      setUploadedDays(dayIndex + 1);
    } catch (error) {
      console.error('Error al guardar las imágenes:', error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a2b4c', minHeight: '100vh' }}>
      <h2 style={{ color: 'white', marginBottom: '10px' }}>Formulario de trabajo</h2>
      <hr style={{ borderTop: '3px solid white', marginBottom: '30px' }} />

      <Form onSubmit={handleSubmit}>
        {/* Dropdown para seleccionar tarea */}
        <Form.Group as={Row} controlId="taskSelect">
          <Form.Label column sm={2} style={{ color: 'white' }}>Seleccionar Tarea</Form.Label>
          <Col sm={10}>
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
          </Col>
        </Form.Group>

        {selectedTask && (
          <Row>
            {/* Primer cuadrante: Detalles de la tarea */}
            <Col md={4}>
              <Card className="mb-3">
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

              {/* Segundo cuadrante: Descripción del sistema */}
              <Card className="mb-3">
                <Card.Body>
                  <Form.Group controlId="description">
                    <Form.Label>Descripción del Sistema</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Cuadrante adicional: Subir imágenes */}
              <Card>
                <Card.Body>
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
                </Card.Body>
              </Card>
            </Col>

            {/* Tercer cuadrante: Lista de detectores */}
            <Col md={8}>
              {lazos > 0 && renderDetectorFields()}
            </Col>
          </Row>
        )}

        {selectedTask && (
          <Button type="submit" variant="primary" className="mt-3">
            Guardar Formulario
          </Button>
        )}
      </Form>
    </div>
  );
};

export default TaskForm;
