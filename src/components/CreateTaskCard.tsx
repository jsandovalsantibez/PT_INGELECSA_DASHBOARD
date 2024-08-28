import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { Form, Button, Col, Row} from 'react-bootstrap';

const CreateTaskCard: React.FC = () => {
  const [placeCategory, setPlaceCategory] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [tools, setTools] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');

  // Listas de lugares basadas en la categoría seleccionada
  const placesByCategory: { [key: string]: string[] } = {
    homecenter: ["Estación Central", "Independencia", "El Bosque"],
    falabella: ["Costanera", "Parque Arauco", "Independencia"],
    tottus: ["El Bosque", "Estación Central", "Buin"],
    ikea: ["Parque Arauco"],
  };

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
      setPlaceCategory('');
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
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col} md="6">
          <Form.Label>Categoría del Lugar</Form.Label>
          <Form.Control
            as="select"
            value={placeCategory}
            onChange={e => {
              setPlaceCategory(e.target.value);
              setPlace(''); // Resetear la selección de lugar cuando se cambie la categoría
            }}
            required
          >
            <option value="" disabled>Seleccione una categoría</option>
            <option value="homecenter">Homecenter</option>
            <option value="falabella">Falabella</option>
            <option value="tottus">Tottus</option>
            <option value="ikea">Ikea</option>
          </Form.Control>
        </Form.Group>

        <Form.Group as={Col} md="6">
          <Form.Label>Lugar</Form.Label>
          <Form.Control
            as="select"
            value={place}
            onChange={e => setPlace(e.target.value)}
            required
            disabled={!placeCategory} // Desactivar si no se ha seleccionado una categoría
          >
            <option value="" disabled>Seleccione un lugar</option>
            {placeCategory && placesByCategory[placeCategory]?.map((placeOption) => (
              <option key={placeOption} value={placeOption}>{placeOption}</option>
            ))}
          </Form.Control>
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} md="6">
          <Form.Label>Fecha</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group as={Col} md="3">
          <Form.Label>Hora de Ingreso</Form.Label>
          <Form.Control
            type="time"
            value={checkInTime}
            onChange={e => setCheckInTime(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group as={Col} md="3">
          <Form.Label>Hora de Egreso</Form.Label>
          <Form.Control
            type="time"
            value={checkOutTime}
            onChange={e => setCheckOutTime(e.target.value)}
            required
          />
        </Form.Group>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Persona de Contacto</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ingrese el nombre del contacto"
          value={contactPerson}
          onChange={e => setContactPerson(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Herramientas</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ingrese las herramientas necesarias"
          value={tools}
          onChange={e => setTools(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Tipo de Mantenimiento</Form.Label>
        <Form.Control
          as="select"
          value={maintenanceType}
          onChange={e => setMaintenanceType(e.target.value)}
          required
        >
          <option value="" disabled>Seleccione un tipo de mantenimiento</option>
          {maintenanceTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Button type="submit" variant="primary">Crear Card</Button>
    </Form>
  );
};

export default CreateTaskCard;