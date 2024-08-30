import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Card, Image } from 'react-bootstrap';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const userDocs = await getDocs(usersCollection);
        const usersList = userDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Users fetched:", usersList);
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Card style={{ backgroundColor: '#1a2b4c', color: 'white', maxHeight: '300px', overflowY: 'auto' }}>
      <Card.Header>Lista de Usuarios</Card.Header>
      <Card.Body style={{ padding: '10px' }}>
        {users.map(user => (
          <div key={user.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <Image 
              src={user.photoURL || 'https://via.placeholder.com/150'} 
              roundedCircle 
              style={{ 
                width: '40px', 
                height: '40px', 
                objectFit: 'cover', 
                marginRight: '10px', 
                border: '2px solid white' 
              }} 
            />
            <span>{user.fullName || 'Usuario'}</span>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

export default UserList;
