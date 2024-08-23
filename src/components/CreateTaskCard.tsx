import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from "firebase/firestore"; 

const CreateTaskCard: React.FC = () => {
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [tools, setTools] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const db = getFirestore();

    try {
      await addDoc(collection(db, "taskCards"), {
        place,
        date,
        checkInTime,
        checkOutTime,
        contactPerson,
        tools,
      });
      alert("Card creada con éxito!");
      setPlace('');
      setDate('');
      setCheckInTime('');
      setCheckOutTime('');
      setContactPerson('');
      setTools('');
    } catch (error) {
      console.error("Error al crear la card: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Lugar" 
        value={place} 
        onChange={e => setPlace(e.target.value)} 
        required 
      />
      <input 
        type="date" 
        value={date} 
        onChange={e => setDate(e.target.value)} 
        required 
      />
      <input 
        type="time" 
        placeholder="Hora de Ingreso" 
        value={checkInTime} 
        onChange={e => setCheckInTime(e.target.value)} 
        required 
      />
      <input 
        type="time" 
        placeholder="Hora de Egreso" 
        value={checkOutTime} 
        onChange={e => setCheckOutTime(e.target.value)} 
        required 
      />
      <input 
        type="text" 
        placeholder="Personal de Contacto" 
        value={contactPerson} 
        onChange={e => setContactPerson(e.target.value)} 
        required 
      />
      <input 
        type="text" 
        placeholder="Herramientas" 
        value={tools} 
        onChange={e => setTools(e.target.value)} 
        required 
      />
      <button type="submit">Crear Card</button>
    </form>
  );
};

export default CreateTaskCard;

