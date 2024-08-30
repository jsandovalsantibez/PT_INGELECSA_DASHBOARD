import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TaskPlanProps {
  taskId?: string; // Declara la prop taskId como string opcional
}

const TaskPlan: React.FC<TaskPlanProps> = () => {
  const { taskId } = useParams<{ taskId: string }>(); // Obtén el ID de la tarea desde la URL
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [taskPeriod, setTaskPeriod] = useState<[Date | null, Date | null]>([null, null]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('role', '==', 'tecnico_soporte'));
      const userDocs = await getDocs(q);
      const userList = userDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskId) {
      console.error('Error: taskId is undefined');
      return;
    }

    if (!taskPeriod || !taskPeriod[0] || !taskPeriod[1]) {
      console.error('Error: taskPeriod is not defined correctly');
      return;
    }

    const db = getFirestore();

    try {
      await updateDoc(doc(db, 'taskCards', taskId), {
        assignedPersonnel: selectedUsers,
        taskPeriod: taskPeriod,
        active: true,
      });
      alert('Plan de tarea creado con éxito!');
      navigate('/dashboard'); // Redirige de vuelta al dashboard
    } catch (error) {
      console.error('Error al crear el plan de tarea:', error);
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedUsers(prevSelectedUsers =>
      checked ? [...prevSelectedUsers, value] : prevSelectedUsers.filter(user => user !== value)
    );
  };

  return (
    <Row className="justify-content-center">
      <Col md={6}>
        <h2>Crear Plan para Tarea</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Seleccionar Técnicos de Soporte</Form.Label>
            {users.map(user => (
              <Form.Check
                key={user.id}
                type="checkbox"
                label={user.fullName}
                value={user.fullName}
                onChange={handleUserChange}
              />
            ))}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Periodo de la Tarea</Form.Label>
            <DatePicker
                selectsRange
                startDate={taskPeriod[0] || undefined}
                endDate={taskPeriod[1] || undefined}
                onChange={(update: [Date | null, Date | null]) => setTaskPeriod(update)}
                isClearable={true}
                dateFormat="dd/MM/yyyy"
                className="form-control"
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Crear Plan
          </Button>
        </Form>
      </Col>
    </Row>
  );
};

export default TaskPlan;
