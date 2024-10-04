import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Form, Container, Row, Col } from 'react-bootstrap';
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
  detectorsByLazo?: { [key: string]: string[] };
  coordinates?: { lat: number; lng: number };
  assignedPersonnel?: string[];
  images?: { [key: string]: { inicio: string; termino: string } };
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
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);

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
          setMarkerCoords(null);
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

  // Obtener datos combinados de los detectores (hecho, no hecho, obstruido)
  const getCombinedDetectorsData = () => {
    if (!selectedTask || !selectedTask.detectorsByLazo) return { hecho: 0, no_hecho: 0, obstruido: 0 };

    const detectors = Object.values(selectedTask.detectorsByLazo).flat();
    const hechoCount = detectors.filter((det) => det === 'hecho').length;
    const noHechoCount = detectors.filter((det) => det === 'no_hecho').length;
    const obstruidoCount = detectors.filter((det) => det === 'obstruido').length;

    return { hecho: hechoCount, no_hecho: noHechoCount, obstruido: obstruidoCount };
  };

  // Obtener datos de detectores por lazo (hecho, no hecho, obstruido)
  const getLazoDetectorsData = (lazoKey: string) => {
    if (!selectedTask || !selectedTask.detectorsByLazo || !selectedTask.detectorsByLazo[lazoKey]) {
      return { hecho: 0, no_hecho: 0, obstruido: 0 };
    }

    const lazoDetectors = selectedTask.detectorsByLazo[lazoKey];
    const hechoCount = lazoDetectors.filter((det) => det === 'hecho').length;
    const noHechoCount = lazoDetectors.filter((det) => det === 'no_hecho').length;
    const obstruidoCount = lazoDetectors.filter((det) => det === 'obstruido').length;

    return { hecho: hechoCount, no_hecho: noHechoCount, obstruido: obstruidoCount };
  };

  const combinedData = getCombinedDetectorsData();

  const renderChartDetails = (data: { hecho: number; no_hecho: number; obstruido: number }) => {
    const total = data.hecho + data.no_hecho + data.obstruido;

    return (
      <div style={{ marginLeft: '20px', fontSize: '1.2em' }}>
        <h5>Detalles del Gráfico</h5>
        <div style={{ color: '#FFA500' }}>
          Hecho: {data.hecho} detectores ({((data.hecho / total) * 100).toFixed(2)}%)
        </div>
        <div style={{ color: '#1A2B4C' }}>
          No Hecho: {data.no_hecho} detectores ({((data.no_hecho / total) * 100).toFixed(2)}%)
        </div>
        <div style={{ color: '#A9A9A9' }}>
          Obstruido: {data.obstruido} detectores ({((data.obstruido / total) * 100).toFixed(2)}%)
        </div>
      </div>
    );
  };

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
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
              <div style={{ height: '400px', width: '400px' }}>
                {selectedChart === 'Gráfico General' ? (
                  <Pie
                    data={{
                      labels: ['Hecho', 'No Hecho', 'Obstruido'],
                      datasets: [
                        {
                          data: [combinedData.hecho, combinedData.no_hecho, combinedData.obstruido],
                          backgroundColor: ['#FFA500', '#1A2B4C', '#A9A9A9'], // Colores: naranja, azul marino, gris
                        },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                ) : (
                  <Pie
                    data={{
                      labels: ['Hecho', 'No Hecho', 'Obstruido'],
                      datasets: [
                        {
                          data: [
                            getLazoDetectorsData(selectedChart).hecho,
                            getLazoDetectorsData(selectedChart).no_hecho,
                            getLazoDetectorsData(selectedChart).obstruido,
                          ],
                          backgroundColor: ['#FFA500', '#1A2B4C', '#A9A9A9'], // Colores: naranja, azul marino, gris
                        },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                )}
              </div>
              {/* Detalles del gráfico */}
              <div style={{ marginLeft: '30px' }}>
                {selectedChart === 'Gráfico General'
                  ? renderChartDetails(combinedData)
                  : renderChartDetails(getLazoDetectorsData(selectedChart))}
              </div>
            </div>
          </div>
        </Col>
        {/* Segundo y Tercer cuadrantes con mapa y otro contenido adicional */}
        <Col md={6} style={{ padding: '10px' }}>
          <Row style={{ height: '50%', marginBottom: '10px' }}>
            <Col md={12}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', height: '100%' }}>
                <h5>Mapa de Santiago</h5>
                <div style={{ height: 'calc(100% - 30px)', overflow: 'hidden', borderRadius: '8px' }}>
                  <MapContainer center={[-33.4489, -70.6693]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {markerCoords && (
                      <Marker position={[markerCoords.lat, markerCoords.lng]} icon={markerIcon}>
                        <Popup>{selectedTask?.taskCode}</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>
            </Col>
          </Row>
          <Row style={{ height: '50%' }}>
            <Col md={12}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', height: '100%' }}>
                <h5>Contenido Adicional</h5>
                <p>Aquí puedes agregar otro contenido relacionado con la tarea seleccionada.</p>
              </div>
            </Col>
          </Row>
        </Col>

      </Row>
    </Container>
  );
};

export default TaskAnalytics;
