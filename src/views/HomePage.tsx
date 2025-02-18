import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../components/AuthContext';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Row, Col, Table, Image, Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/style_homepage.css';

// Imágenes de fondo
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
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { user } = useAuth();

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

        const calendarEvents = tasksList
          .map(task => {
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
          })
          .filter(event => event !== null);

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

  // Seleccionar imagen de fondo según rol
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
    <div className="homepage-container">
      {/* Encabezado */}
      <Row className="mb-3">
        <Col xs={12}>
          <h2 className="text-white">Página Inicial</h2>
          <hr className="white-hr" />
        </Col>
      </Row>

      {/* Cuadrantes superiores */}
      <Row className="g-3 homepage-upper">
        <Col md={6} xs={12} className="h-100">
          <div className="calendar-card h-100">
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
                showMore: (count) => `+ Ver más (${count})`,
              }}
            />
          </div>
        </Col>

        <Col md={6} xs={12} className="h-100">
          <div className="notification-card h-100">
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

      {/* Cuadrantes inferiores */}
      <Row className="g-3 homepage-lower mt-3">
        <Col md={6} xs={12} className="h-100">
          <div className="profile-card h-100">
            {loggedUser && (
              <>
                {/* Imagen de fondo */}
                <div className="profile-bg">
                  <img src={backgroundImage} alt="Fondo de perfil" />
                </div>
                {/* Información del usuario */}
                <div className="profile-info">
                  <div className="profile-image">
                    <Image
                      src={loggedUser.photoURL || 'https://via.placeholder.com/150'}
                      alt={loggedUser.fullName}
                      roundedCircle
                    />
                  </div>
                  <div className="profile-details">
                    <h4>{loggedUser.fullName}</h4>
                    <p>{loggedUser.role}</p>
                    <Button
                      variant="outline-light"
                      className="profile-btn"
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

        <Col md={6} xs={12} className="h-100">
          <div className="user-task-card h-100">
            <h4>Usuarios y Tareas</h4>
            <div className="user-task-table">
              <Table striped hover responsive borderless>
                <thead className="table-head">
                  <tr>
                    <th className="text-center">Usuario</th>
                    <th>Tareas Asignadas</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="table-row">
                      <td className="d-flex align-items-center p-2">
                        <Image
                          src={user.photoURL || 'https://via.placeholder.com/60'}
                          roundedCircle
                          className="user-img"
                          alt={user.fullName || 'Usuario sin nombre'}
                        />
                        <div className="ms-2">
                          <strong>{user.fullName}</strong>
                          <p className="mb-0 small text-muted">{user.role}</p>
                        </div>
                      </td>
                      <td>
                        <ul className="mb-0 ps-3">
                          {notifications
                            .filter((task) => task.assignedPersonnel.includes(user.id))
                            .map((task) => (
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
              <p>
                <strong>Nombre Completo:</strong> {selectedUser.fullName}
              </p>
              <p>
                <strong>Correo Electrónico:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Teléfono de Contacto:</strong> {selectedUser.contactNumber}
              </p>
              <p>
                <strong>RUT:</strong> {selectedUser.rut}
              </p>
              <p>
                <strong>Rol:</strong> {selectedUser.role}
              </p>
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
