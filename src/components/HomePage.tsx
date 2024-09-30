import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Row, Col, Table, ListGroup, Image, Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/style_homepage.css';

interface Task {
  id: string;
  taskCode: string;
  taskPeriod: { seconds: number }[];
  place: string;
  placeCategory: string;
  assignedPersonnel: string[];
  assignedBy: string;
  images?: { [key: string]: { inicio: string; termino: string } };
  active: boolean;
  [key: string]: any;
}

interface User {
  id: string;
  fullName: string;
  photoURL: string;
  [key: string]: any;
}

// Configurar el localizador de fechas para el calendario y el idioma
moment.locale('es');
const localizer = momentLocalizer(moment);

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentImageTask, setCurrentImageTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();
        
        // Obtener tareas
        const tasksCollection = collection(db, 'taskCards');
        const taskDocs = await getDocs(tasksCollection);
        const tasksList = taskDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        setTasks(tasksList);

        // Crear eventos para el calendario
        const calendarEvents = tasksList.map(task => {
          if (task.taskPeriod && task.taskPeriod.length === 2) {
            const [start, end] = task.taskPeriod.map(p => new Date(p.seconds * 1000));
            return {
              id: task.id,
              title: `${task.place} - ${task.taskCode}`,
              start,
              end,
            };
          }
          return null;
        }).filter(event => event !== null);

        setEvents(calendarEvents);
        setNotifications(tasksList);

        // Obtener usuarios
        const usersCollection = collection(db, 'users');
        const userDocs = await getDocs(usersCollection);
        const userList = userDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(userList);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Función para renderizar el carrusel de imágenes
  const renderImageCarousel = () => {
    // Filtrar solo tareas activas y con imágenes
    const activeTasksWithImages = tasks.filter(task => task.active && task.images);

    // Recopilar todas las imágenes con su tarea asociada
    const allImages = activeTasksWithImages.flatMap(task =>
      Object.values(task.images || {}).flat().map(imageSet => ({
        url: imageSet.inicio || imageSet.termino,
        task,
      }))
    ).filter((image) => image.url);

    if (allImages.length === 0) {
      return <p>No hay imágenes disponibles para mostrar.</p>;
    }

    return (
      <Carousel 
        onSlide={(index) => setCurrentImageTask(allImages[index]?.task)}
        interval={3000}
        fade
      >
        {allImages.map(({ url, task }, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100"
              src={url}
              alt={`Imagen ${index + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    );
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a2b4c', minHeight: '100vh' }}>
      <Row style={{ marginBottom: '20px' }}>
        <Col md={12}>
          <h2 style={{ color: 'white' }}>HomePage</h2>
          <hr style={{ borderTop: '3px solid white' }} />
        </Col>
      </Row>

      {/* Cuadrantes superiores (grandes) */}
      <Row className="g-3" style={{ height: '45vh' }}>
        <Col md={6} xs={12} style={{ height: '100%' }}>
          <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', height: '100%', overflow: 'hidden' }}>
            <h4>Calendario de Tareas</h4>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={['month']}
              style={{ height: 'calc(100% - 50px)', minHeight: '300px' }}
              eventPropGetter={() => ({
                style: {
                  backgroundColor: '#ff5722',
                  color: 'white',
                  borderRadius: '5px',
                  padding: '2px',
                },
              })}
              messages={{
                today: 'Hoy',
                previous: 'Atrás',
                next: 'Siguiente',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda',
                date: 'Fecha',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'No hay eventos en este rango',
                showMore: (count) => `+ Ver más (${count})`
              }}
            />
          </div>
        </Col>

        {/* Tabla de notificaciones */}
        <Col md={6} xs={12} style={{ height: '100%' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', height: '100%', overflowY: 'auto' }}>
            <h4>Notificaciones de Tareas</h4>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Tarea</th>
                  <th>Asignada Por</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((task) => (
                  <tr key={task.id}>
                    <td>{task.taskCode}</td>
                    <td>{task.assignedBy}</td>
                    <td>{new Date(task.taskPeriod[0].seconds * 1000).toLocaleDateString('es-ES')}</td>
                    <td>{new Date(task.taskPeriod[1].seconds * 1000).toLocaleDateString('es-ES')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>

      {/* Cuadrantes inferiores (pequeños) */}
      <Row className="g-3" style={{ height: '40vh', marginTop: '20px' }}>
        {/* Listado de usuarios y tareas */}
        <Col md={4} xs={12} style={{ height: '100%' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', height: '100%', overflow: 'hidden' }}>
            <h4>Usuarios y Tareas</h4>
            <div style={{ maxHeight: 'calc(100% - 50px)', overflowY: 'auto' }}>
              <ListGroup variant="flush">
                {users.map(user => (
                  <ListGroup.Item key={user.id} style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                      src={user.photoURL || 'https://via.placeholder.com/80'}
                      roundedCircle
                      style={{ width: '80px', height: '80px', marginRight: '10px' }}
                      alt={user.fullName || 'Usuario sin nombre'}
                    />
                    <div>
                      <strong>{user.fullName || 'Nombre no disponible'}</strong>
                      <ul>
                        {notifications
                          .filter(task => task.assignedPersonnel.includes(user.id))
                          .map(task => (
                            <li key={task.id}>{task.taskCode}</li>
                        ))}
                      </ul>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        </Col>

        {/* Cuadrante medio con carrusel de imágenes */}
        <Col md={4} xs={12} style={{ height: '100%' }}>
          <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', height: '100%', overflow: 'hidden' }}>
            {/* Mostrar título dinámico de la tarea */}
            {currentImageTask && (
              <h5 style={{ textAlign: 'center', marginBottom: '10px' }}>
                {currentImageTask.place} - {currentImageTask.placeCategory}
              </h5>
            )}
            {renderImageCarousel()}
          </div>
        </Col>

        {/* Tercer cuadrante pequeño */}
        <Col md={4} xs={12} style={{ height: '100%' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', height: '100%' }}>
            {/* Aquí irá contenido del tercer cuadrante pequeño */}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
