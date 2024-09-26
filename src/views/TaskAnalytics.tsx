import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Form, Container, Row, Col, Image } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Registrar ícono de Leaflet para los marcadores
const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Task {
  id: string;
  detectorsByLazo?: { [key: string]: boolean[] };
  coordinates?: { lat: number; lng: number };
  assignedPersonnel?: string[]; // IDs de los técnicos asignados
  [key: string]: any;
}

interface User {
  id: string;
  fullName: string;
  photoURL: string;
}

const TaskAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedChart, setSelectedChart] = useState<string>('Gráfico General');
  const [loading, setLoading] = useState<boolean>(true);
  const [markerCoords, setMarkerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]); // Estado para técnicos asignados

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        console.error('No hay usuario autenticado.');
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const tasksCollection = collection(db, 'taskCards');
        const tasksQuery = query(
          tasksCollection, 
          where('assignedPersonnel', 'array-contains', user.uid),
          where('active', '==', true)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        
        const tasksData = tasksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        setTasks(tasksData);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener las tareas:', error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const fetchAssignedUsers = async (userIds: string[]) => {
    try {
      const db = getFirestore();
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => userIds.includes(user.id)) as User[];

      setAssignedUsers(usersData);
    } catch (error) {
      console.error('Error al obtener los detalles de los usuarios:', error);
    }
  };

  const handleTaskSelect = async (taskId: string) => {
    try {
      setLoading(true);
      const db = getFirestore();
      const taskDocRef = doc(db, 'taskCards', taskId);
      const taskDoc = await getDoc(taskDocRef);
  
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        setSelectedTask({ id: taskDoc.id, ...taskData });
  
        // Si existen coordenadas en la tarea, actualiza el marcador en el mapa
        if (taskData.coordinates) {
          setMarkerCoords(taskData.coordinates);
        } else {
          setMarkerCoords(null); // Si no hay coordenadas, quita el marcador
        }

        // Obtener técnicos asignados
        if (taskData.assignedPersonnel) {
          fetchAssignedUsers(taskData.assignedPersonnel);
        }
      } else {
        console.error('No se encontró la tarea con el ID proporcionado.');
      }
    } catch (error) {
      console.error('Error al obtener la tarea:', error);
    }
    setLoading(false);
  };

  const handleChartSelect = (chartType: string) => {
    setSelectedChart(chartType);
  };

  const getCombinedDetectorsData = () => {
    if (!selectedTask || !selectedTask.detectorsByLazo) return { true: 0, false: 0 };

    const detectors = Object.values(selectedTask.detectorsByLazo).flat();
    const trueCount = detectors.filter((det) => det).length;
    const falseCount = detectors.length - trueCount;

    return { true: trueCount, false: falseCount };
  };

  const getLazoDetectorsData = (lazoKey: string) => {
    if (!selectedTask || !selectedTask.detectorsByLazo || !selectedTask.detectorsByLazo[lazoKey]) {
      return { true: 0, false: 0 };
    }

    const lazoDetectors = selectedTask.detectorsByLazo[lazoKey];
    const trueCount = lazoDetectors.filter((det) => det).length;
    const falseCount = lazoDetectors.length - trueCount;

    return { true: trueCount, false: falseCount };
  };

  const combinedData = getCombinedDetectorsData();

  return (
    <Container fluid style={{ overflow: 'hidden', backgroundColor: '#1a2b4c', minHeight: '100vh', padding: '20px' }}>
      <Row>
        <Col md={12}>
          <h2 style={{ color: 'white', marginBottom: '10px' }}>Análisis de Tareas</h2>
          <hr style={{ borderTop: '3px solid white', marginBottom: '30px' }} />
        </Col>
      </Row>
      {/* Contenedor de cuadrantes */}
      <Row style={{ height: 'calc(100vh - 150px)' }}>
        {/* Primer cuadrante con dropdown y gráfico */}
        <Col md={6} style={{ padding: '10px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', height: '100%' }}>
            <Form.Group controlId="taskSelect" className="mb-3">
              <Form.Label>Selecciona una Tarea para Ver los Detectores</Form.Label>
              <Form.Control as="select" onChange={(e) => handleTaskSelect(e.target.value)}>
                <option value="">Seleccionar...</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.taskCode}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="chartSelect">
              <Form.Label>Selecciona el Gráfico</Form.Label>
              <Form.Control as="select" onChange={(e) => handleChartSelect(e.target.value)}>
                <option value="Gráfico General">Gráfico General</option>
                {selectedTask && selectedTask.detectorsByLazo && (
                  Object.keys(selectedTask.detectorsByLazo).map((lazoKey) => (
                    <option key={lazoKey} value={lazoKey}>
                      {lazoKey}
                    </option>
                  ))
                )}
              </Form.Control>
            </Form.Group>
            {/* Mostrar gráfico seleccionado */}
            <div style={{ height: '300px', marginTop: '20px' }}>
              {selectedChart === 'Gráfico General' ? (
                <Pie
                  data={{
                    labels: ['Completados', 'No Completados'],
                    datasets: [
                      {
                        data: [combinedData.true, combinedData.false],
                        backgroundColor: ['#1A2B4C', '#FFA500'],
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              ) : (
                <Pie
                  data={{
                    labels: ['Completados', 'No Completados'],
                    datasets: [
                      {
                        data: [
                          getLazoDetectorsData(selectedChart).true,
                          getLazoDetectorsData(selectedChart).false,
                        ],
                        backgroundColor: ['#1A2B4C', '#FFA500'],
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              )}
            </div>
          </div>
        </Col>
        {/* Segundo cuadrante con mapa */}
        <Col md={6} style={{ padding: '10px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', height: '100%' }}>
            <h5>Mapa de Santiago</h5>
            <MapContainer center={[-33.4489, -70.6693]} zoom={12} style={{ height: 'calc(100% - 40px)', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {/* Mostrar el marcador solo si existen coordenadas */}
              {markerCoords && (
                <Marker position={[markerCoords.lat, markerCoords.lng]} icon={markerIcon}>
                  <Popup>{selectedTask?.taskCode}</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </Col>
        {/* Tercer cuadrante con imágenes de perfil */}
        <Col md={6} style={{ padding: '10px' }}>
        <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            height: '100%', 
            overflowX: 'auto', 
            whiteSpace: 'nowrap' 
        }}>
          <h5>Técnicos Asignados</h5>
          <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
            {assignedUsers.map((user) => (
              <div key={user.id} style={{ textAlign: 'center', marginRight: '15px' }}>
                <img
                  src={user.photoURL}
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    objectFit: 'cover', 
                    borderRadius: '50%' 
                  }}
                  alt={user.fullName}
                />
                <p style={{ marginTop: '10px', fontSize: '14px' }}>{user.fullName}</p>
              </div>
            ))}
          </div>
        </div>
      </Col>
      </Row>
    </Container>
  );
};

export default TaskAnalytics;
