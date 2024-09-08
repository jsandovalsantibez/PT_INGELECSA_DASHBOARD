import React, { useEffect, useState } from 'react';
import { db } from '../firebase';  // Importamos 'db' en lugar de 'firestore'
import { collection, getDocs } from 'firebase/firestore';
import { Row, Col, Card } from 'react-bootstrap';

const UsersImg: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');  // Usamos 'db' en lugar de 'firestore'
        const userDocs = await getDocs(usersCollection);
        const usersList = userDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Users fetched:", usersList); // Verifica los usuarios obtenidos
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Row className="mt-5">
      {users.map(user => (
        <Col key={user.id} md={4} className="d-flex justify-content-center mb-4">
          <Card style={{ width: '150px', textAlign: 'center' }}>
            <Card.Img
              variant="top"
              src={user.photoURL || 'https://via.placeholder.com/150'}
              alt={user.fullName}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                margin: '20px auto',
              }}
            />
            <Card.Body>
              <Card.Title style={{ fontSize: '1rem' }}>{user.fullName || 'Usuario'}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default UsersImg;
