import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../components/AuthContext';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Row, Col, Table, Image, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/style_homepage.css';

// Importa las imágenes desde assets
import bienvenida1 from '../assets/bienvenida_1.png';
import bienvenida3 from '../assets/bienvenida_3.png';

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
  email: string;
  photoURL: string;
  contactNumber: string;
  role: string;
  rut: string;
  [key: string]: any;
}

moment.locale('es');
const localizer = momentLocalizer(moment);

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();

        // Fetch tasks
        const tasksCollection = collection(db, 'taskCards');
        const taskDocs = await getDocs(tasksCollection);
        const tasksList = taskDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        setTasks(tasksList);

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

        // Fetch users
        const usersCollection = collection(db, 'users');
        const userDocs = await getDocs(usersCollection);
        const userList = userDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(userList);

        if (user) {
          const loggedUserDocRef = doc(db, 'users', user.uid);
          const loggedUserDoc = await getDoc(loggedUserDocRef);
          if (loggedUserDoc.exists()) {
            setLoggedUser(loggedUserDoc.data() as User);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  // Selecciona la imagen de fondo según el rol del usuario
  const backgroundImage = loggedUser?.role === 'gerente_operaciones' ? bienvenida1 : bienvenida3;

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a2b4c', minHeight: '100vh' }}>
      <Row style={{ marginBottom: '20px' }}>
        <Col md={12}>
          <h2 style={{ color: 'white' }}>Página Inicial</h2>
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
      <Col md={6} xs={12} style={{ height: '100%' }}>
        <div
            style={{
              backgroundColor: '#1a2b4c',
              borderRadius: '15px',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {loggedUser && (
              <>
                {/* Contenedor de la imagen de fondo */}
                <div style={{ width: '100%', height: '40%', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={backgroundImage}
                    alt="Fondo de perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Contenedor del degradado y contenido */}
                <div
                  style={{
                    width: '100%',
                    height: '60%',
                    background: 'linear-gradient(to bottom, #344055, #3a416f)',
                    padding: '20px 20px 10px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Imagen circular del perfil del usuario */}
                  <div
                    style={{
                      width: '250px',
                      height: '250px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid white',
                      position: 'absolute',
                      top: '-125px',
                      left: '20%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <Image
                      src={loggedUser.photoURL || 'https://via.placeholder.com/150'}
                      alt={loggedUser.fullName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Información del usuario */}
                  <div style={{ marginTop: '60px' }}>
                    <h4 style={{ color: 'white' }}>{loggedUser.fullName}</h4>
                    <p style={{ color: '#b2b9bf' }}>{loggedUser.role}</p>
                    <Button
                      variant="outline-light"
                      style={{ marginTop: '5px', borderRadius: '20px', padding: '5px 15px', fontWeight: 'bold', color: '#ffffff', borderColor: '#ffffff' }}
                      onClick={() => handleViewProfile(loggedUser)}
                    >
                      Mostrar Información
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Col>

        {/* Listado de usuarios y tareas */}
        <Col md={6} xs={12} style={{ height: '100%' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', height: '100%', overflow: 'hidden' }}>
            <h4>Usuarios y Tareas</h4>
            <div style={{ maxHeight: 'calc(100% - 50px)', overflowY: 'auto' }}>
              <Table striped hover responsive borderless>
                <thead style={{ backgroundColor: '#f0f0f0' }}>
                  <tr>
                    <th style={{ textAlign: 'center' }}>Usuario</th>
                    <th>Tareas Asignadas</th>

                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      {/* Imagen y Nombre */}
                      <td style={{ display: 'flex', alignItems: 'center', padding: '15px' }}>
                        <Image
                          src={user.photoURL || 'https://via.placeholder.com/60'}
                          roundedCircle
                          style={{ width: '60px', height: '60px', marginRight: '10px' }}
                          alt={user.fullName || 'Usuario sin nombre'}
                        />
                        <div>
                          <strong>{user.fullName}</strong>
                          <p style={{ marginBottom: '0', fontSize: '0.8em', color: '#666' }}>{user.role}</p>
                        </div>
                      </td>
                      {/* Lista de Tareas */}
                      <td>
                        <ul style={{ paddingLeft: '15px', marginBottom: '0' }}>
                          {notifications
                            .filter(task => task.assignedPersonnel.includes(user.id))
                            .map(task => (
                              <li key={task.id}>{task.taskCode}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </Col>
      </Row>

      {/* Modal de información del usuario */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Información del Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p><strong>Nombre Completo:</strong> {selectedUser.fullName}</p>
              <p><strong>Correo Electrónico:</strong> {selectedUser.email}</p>
              <p><strong>Teléfono de Contacto:</strong> {selectedUser.contactNumber}</p>
              <p><strong>RUT:</strong> {selectedUser.rut}</p>
              <p><strong>Rol:</strong> {selectedUser.role}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HomePage;