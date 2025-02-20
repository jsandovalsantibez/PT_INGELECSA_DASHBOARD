import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Form, Button, Row, Col, Card, Modal } from 'react-bootstrap';
import { eachDayOfInterval, format } from 'date-fns';
import { useAuth } from '../components/AuthContext';
import '../styles/style_taskform.css';

interface Task {
  id: string;
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

  // Número total de lazos de la tarea seleccionada
  const [lazos, setLazos] = useState<number>(0);

  // Lazo seleccionado en la UI
  const [currentLazo, setCurrentLazo] = useState<number>(1);

  // Estructura de detectores (hasta 159 por lazo)
  const [detectorsByLazo, setDetectorsByLazo] = useState<{ [key: string]: string[] }>({});

  // Manejo de imágenes
  const [imagesInicio, setImagesInicio] = useState<(File | null)[]>([]);
  const [imagesTermino, setImagesTermino] = useState<(File | null)[]>([]);
  const [workDays, setWorkDays] = useState<Date[]>([]);
  const [uploadedDays, setUploadedDays] = useState<number>(0);

  // Para el modal de Vista Previa
  const [showPreview, setShowPreview] = useState(false);

  // -----------------------------
  // 1. Cargar tareas filtradas
  // -----------------------------
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        console.error('No hay usuario autenticado.');
        return;
      }
      try {
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

  // -----------------------------
  // 2. Al seleccionar una tarea
  // -----------------------------
  const handleTaskSelect = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setSelectedTask(task);
    setLazos(task.lazos || 0);
    setDetectorsByLazo(task.detectorsByLazo || {});
    setCurrentLazo(1);

    // Calcular días si hay periodo
    if (task.taskPeriod && task.taskPeriod.length === 2) {
      const [start, end] = task.taskPeriod;
      const days = eachDayOfInterval({
        start: new Date(start.seconds * 1000),
        end: new Date(end.seconds * 1000),
      });
      setWorkDays(days);
      await checkUploadedImages(task, days);
    }
  };

  // -----------------------------
  // 3. Verificar imágenes subidas
  // -----------------------------
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

  // -----------------------------
  // 4. Actualizar detectores
  // -----------------------------
  useEffect(() => {
    const updated: { [key: string]: string[] } = {};
    for (let i = 1; i <= lazos; i++) {
      const lazoKey = `L${i}`;
      // Hasta 159 detectores
      updated[lazoKey] = detectorsByLazo[lazoKey] || Array(159).fill('no_hecho');
    }
    setDetectorsByLazo(updated);
  }, [lazos]);

  // -----------------------------
  // 5. Renderizar detectores
  // -----------------------------
  const renderDetectorFields = () => {
    const lazoKey = `L${currentLazo}`;
    const detectors = detectorsByLazo[lazoKey] || Array(159).fill('no_hecho');

    return (
      <div className="detector-fields">
        <Card.Body>
          <Card.Title>Dispositivos del Lazo {currentLazo}</Card.Title>
          <Row>
            {/* Primera columna: índices 0..79 */}
            <Col xs={12} md={6}>
              {detectors.slice(0, 80).map((state, index) => (
                <div key={`${lazoKey}D${index + 1}`} className="detector-row">
                  <Form.Label className="detector-label">{`L${currentLazo}D${index + 1}`}</Form.Label>
                  <Button
                    variant={state === 'hecho' ? 'success' : 'outline-success'}
                    onClick={() => handleStateChange(lazoKey, index, 'hecho')}
                    size="sm"
                  >
                    Hecho
                  </Button>
                  <Button
                    variant={state === 'no_hecho' ? 'danger' : 'outline-danger'}
                    onClick={() => handleStateChange(lazoKey, index, 'no_hecho')}
                    size="sm"
                  >
                    No Hecho
                  </Button>
                </div>
              ))}
            </Col>

            {/* Segunda columna: índices 80..158 */}
            <Col xs={12} md={6}>
              {detectors.slice(80, 159).map((state, index) => {
                const realIndex = index + 80;
                return (
                  <div key={`${lazoKey}D${realIndex + 1}`} className="detector-row">
                    <Form.Label className="detector-label">{`L${currentLazo}D${realIndex + 1}`}</Form.Label>
                    <Button
                      variant={state === 'hecho' ? 'success' : 'outline-success'}
                      onClick={() => handleStateChange(lazoKey, realIndex, 'hecho')}
                      size="sm"
                    >
                      Hecho
                    </Button>
                    <Button
                      variant={state === 'no_hecho' ? 'danger' : 'outline-danger'}
                      onClick={() => handleStateChange(lazoKey, realIndex, 'no_hecho')}
                      size="sm"
                    >
                      No Hecho
                    </Button>
                  </div>
                );
              })}
            </Col>
          </Row>
        </Card.Body>
      </div>
    );
  };

  // -----------------------------
  // 6. Cambiar estado de detector
  // -----------------------------
  const handleStateChange = (lazo: string, index: number, state: string) => {
    setDetectorsByLazo(prev => ({
      ...prev,
      [lazo]: prev[lazo].map((det, i) => (i === index ? state : det)),
    }));
  };

  // -----------------------------
  // 7. Guardar cambios
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      const taskDocRef = doc(db, 'taskCards', selectedTask.id);
      await updateDoc(taskDocRef, {
        detectorsByLazo,
        active: true,
      });
      alert('Formulario guardado con éxito');
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
    }
  };

  // -----------------------------
  // 8. Manejo de imágenes
  // -----------------------------
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
    if (!selectedTask) return;
    const selectedDay = format(workDays[dayIndex], 'yyyyMMdd');
    const inicioImage = imagesInicio[dayIndex];
    const terminoImage = imagesTermino[dayIndex];

    if (!inicioImage || !terminoImage) {
      alert('Por favor, sube las imágenes de inicio y término para este día antes de guardar.');
      return;
    }

    try {
      const inicioImageUrl = await uploadImageToStorage(inicioImage!, selectedTask.taskCode, selectedDay, 'inicio');
      const terminoImageUrl = await uploadImageToStorage(terminoImage!, selectedTask.taskCode, selectedDay, 'termino');

      const taskDocRef = doc(db, 'taskCards', selectedTask.id);
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

  // -----------------------------
  // 9. Vista Previa (Modal)
  // -----------------------------
  const handleClosePreview = () => setShowPreview(false);

  // Contenido del modal
  const renderPreviewModalContent = () => {
    if (!selectedTask) {
      return <p>No hay tarea seleccionada.</p>;
    }

    return (
      <>
        <h5>Tarea: {selectedTask.taskCode}</h5>
        <p>Lugar: {selectedTask.place}</p>
        <p>Número de Lazos: {lazos}</p>
        <hr />

        {Object.keys(detectorsByLazo).map((lazoKey) => {
          const detectors = detectorsByLazo[lazoKey];
          return (
            <div key={lazoKey} className="mb-4">
              <h6 style={{ marginBottom: '10px' }}>{lazoKey}</h6>
              <table className="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Detector</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {detectors.map((state, idx) => (
                    <tr key={idx}>
                      <td>{`${lazoKey}D${idx + 1}`}</td>
                      <td>
                        {state === 'hecho' ? (
                          <span className="badge bg-success">Hecho</span>
                        ) : (
                          <span className="badge bg-danger">No Hecho</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </>
    );
  };

  // -----------------------------
  // Render principal
  // -----------------------------
  return (
    <div className="task-form-container">
      <h2 className="form-title">Formulario de trabajo</h2>
      <hr className="form-hr" />

      <div className="form-wrapper">
        <Form onSubmit={handleSubmit}>
          <Row className="task-row">
            {/* Cuadrante 1: Seleccionar Tarea */}
            <Col md={6} xs={12} className="mb-3">
              <Card className="task-card">
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
                </Card.Body>
              </Card>
            </Col>

            {/* Cuadrante 2: Subir imágenes */}
            <Col md={6} xs={12} className="mb-3">
              <Card className="task-card">
                <Card.Body>
                  <Form.Label>Subir Imágenes de Inicio y Término de Trabajo</Form.Label>
                  {workDays.map((day, index) => (
                    <div
                      key={index}
                      className="day-image-group"
                      style={{ display: index <= uploadedDays ? 'block' : 'none' }}
                    >
                      <Form.Label>{`Día: ${format(day, 'dd/MM/yyyy')}`}</Form.Label>
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
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="task-row">
            {/* Cuadrante 3: Seleccionar Lazo */}
            <Col md={6} xs={12} className="mb-3">
              <Card className="task-card">
                <Card.Body>
                  <Form.Group controlId="currentLazo">
                    <Form.Label>Seleccione Lazo</Form.Label>
                    <Form.Control
                      as="select"
                      value={currentLazo}
                      onChange={(e) => setCurrentLazo(parseInt(e.target.value))}
                      disabled={!selectedTask || lazos === 0}
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

            {/* Cuadrante 4: Dispositivos del lazo */}
            <Col md={6} xs={12} className="mb-3">
              <Card className="task-card detector-card">
                <Card.Body>{lazos > 0 && renderDetectorFields()}</Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Sección de botones al final */}
          <div className="text-center mt-4">
            {/* Botón Vista Previa */}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPreview(true)}
              disabled={!selectedTask}
            >
              Vista Previa
            </Button>

            {/* Botón Guardar Formulario */}
            {selectedTask && (
              <Button type="submit" variant="primary" className="ms-3">
                Guardar Formulario
              </Button>
            )}
          </div>
        </Form>
      </div>

      {/* Modal de Vista Previa con tablas */}
      <Modal show={showPreview} onHide={handleClosePreview} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista Previa del Avance</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderPreviewModalContent()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePreview}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskForm;
