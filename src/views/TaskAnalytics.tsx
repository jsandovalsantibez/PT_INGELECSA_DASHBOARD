import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Form, Container, Row, Col } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/style_analytic.css';

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

const TaskAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [markerCoords, setMarkerCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        console.error('No hay usuario autenticado.');
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
      } catch (error) {
        console.error('Error al obtener las tareas:', error);
      }
    };

    fetchTasks();
  }, [user]);

  const handleTaskSelect = async (taskId: string) => {
    try {
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
      } else {
        console.error('No se encontró la tarea con el ID proporcionado.');
      }
    } catch (error) {
      console.error('Error al obtener la tarea:', error);
    }
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

  const combinedData = getCombinedDetectorsData();

  return (
    <Container fluid style={{ overflow: 'hidden', backgroundColor: '#1a2b4c', minHeight: '100vh', padding: '20px' }}>
      <Row>
        <Col md={12}>
          <h2 style={{ color: 'white', marginBottom: '10px' }}>Análisis de Tareas</h2>
          <hr style={{ borderTop: '3px solid white', marginBottom: '30px' }} />
        </Col>
      </Row>
      <Row style={{ height: 'calc(100vh - 150px)' }}>
        <Col md={6} style={{ padding: '10px' }}>
          <div className="quadrant-container">
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
            <div className="chart-container-1">
              <Pie
                data={{
                  labels: ['Hecho', 'No Hecho', 'Obstruido'],
                  datasets: [
                    {
                      data: [combinedData.hecho, combinedData.no_hecho, combinedData.obstruido],
                      backgroundColor: ['#FFA500', '#1A2B4C', '#A9A9A9'],
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </Col>
        <Col md={6} style={{ padding: '10px' }}>
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
    </Container>
  );
};

export default TaskAnalytics;
