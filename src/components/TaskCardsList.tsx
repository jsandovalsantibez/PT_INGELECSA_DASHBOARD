import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"; 
import { auth } from '../firebase';

interface TaskCardsListProps {
  userRole: string;
}

const TaskCardsList: React.FC<TaskCardsListProps> = ({ userRole }) => {
  const [taskCards, setTaskCards] = useState<any[]>([]);

  useEffect(() => {
    const fetchTaskCards = async () => {
      const db = getFirestore();
      let q;

      if (userRole === 'gerente_operaciones') {
        q = collection(db, "taskCards");
      } else {
        q = query(collection(db, "taskCards"), where("assignedTo", "==", auth.currentUser?.uid));
      }

      try {
        const querySnapshot = await getDocs(q);
        const cards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTaskCards(cards);
      } catch (error) {
        console.error("Error al cargar las tarjetas:", error);
      }
    };

    fetchTaskCards();
  }, [userRole]);

  return (
    <div className="card-container">
      {taskCards.map(card => (
        <div key={card.id} className="card" style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '10px', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#333' }}>{card.place}</h2>
          <p style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#666' }}>{card.date}</p>
          <p style={{ margin: '0 0 5px 0' }}><strong>Ingreso:</strong> {card.checkInTime}</p>
          <p style={{ margin: '0 0 5px 0' }}><strong>Egreso:</strong> {card.checkOutTime}</p>
          <p style={{ margin: '0 0 5px 0' }}><strong>Contacto:</strong> {card.contactPerson}</p>
          <p style={{ margin: '0 0 5px 0' }}><strong>Herramientas:</strong> {card.tools}</p>
        </div>
      ))}
    </div>
  );
};

export default TaskCardsList;
