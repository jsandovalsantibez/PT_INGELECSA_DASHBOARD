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
        q = collection(db, "taskCards");  // Aquí se cambió "task" por "taskCards"
      } else {
        q = query(collection(db, "taskCards"), where("assignedTo", "==", auth.currentUser?.uid));  // Aquí también
      }

      try {
        const querySnapshot = await getDocs(q);
        const cards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Tarjetas cargadas:", cards);
        setTaskCards(cards);
      } catch (error) {
        console.error("Error al cargar las tarjetas:", error);
      }
    };

    fetchTaskCards();
  }, [userRole]);

  return (
    <div>
      {taskCards.map(card => (
        <div key={card.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <h2>{card.place}</h2>
          <p>{card.date}</p>
          <p>Ingreso: {card.checkInTime}</p>
          <p>Egreso: {card.checkOutTime}</p>
          <p>Contacto: {card.contactPerson}</p>
          <p>Herramientas: {card.tools}</p>
        </div>
      ))}
    </div>
  );
};

export default TaskCardsList;
