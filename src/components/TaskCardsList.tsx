import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from "firebase/firestore"; 

const TaskCardsList: React.FC = () => {
  const [taskCards, setTaskCards] = useState<any[]>([]);

  useEffect(() => {
    const fetchTaskCards = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "taskCards"));
      const cards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTaskCards(cards);
    };

    fetchTaskCards();
  }, []);

  return (
    <div>
      {taskCards.map(card => (
        <div key={card.id} style={{border: '1px solid #ccc', padding: '10px', marginBottom: '10px'}}>
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
