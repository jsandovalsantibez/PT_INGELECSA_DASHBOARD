import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from "firebase/firestore"; 

const CreateTaskCard: React.FC = () => {
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [tools, setTools] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');

  // Lista de lugares disponibles
  const places = [
    "Tottus Alameda", "Tottus Buin", "Tottus San Bernardo", "Tottus El Bosque",
    "HC Independencia", "HC Estación Central", "HC El Bosque",
    "Falabella Costanera", "Falabella Independencia", "Falabella Parque Arauco"
  ];

  // Lista de tipos de mantenimiento con sus colores
  const maintenanceTypes = [
    { value: 'mantencion_preventiva', label: 'Mantención Preventiva', color: 'green' },
    { value: 'mantencion_correctiva', label: 'Mantención Correctiva', color: 'orange' },
    { value: 'inspeccion', label: 'Inspección', color: 'blue' },
    { value: 'emergencia', label: 'Emergencia', color: 'red' },
  ];

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
        maintenanceType,
      });
      alert("Card creada con éxito!");
      setPlace('');
      setDate('');
      setCheckInTime('');
      setCheckOutTime('');
      setContactPerson('');
      setTools('');
      setMaintenanceType('');
    } catch (error) {
      console.error("Error al crear la card: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={place} onChange={e => setPlace(e.target.value)} required>
        <option value="" disabled>Seleccione un lugar</option>
        {places.map((placeOption) => (
          <option key={placeOption} value={placeOption}>{placeOption}</option>
        ))}
      </select>

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

      <select value={maintenanceType} onChange={e => setMaintenanceType(e.target.value)} required>
        <option value="" disabled>Seleccione un tipo de mantenimiento</option>
        {maintenanceTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      <button type="submit">Crear Card</button>
    </form>
  );
};

export default CreateTaskCard;
