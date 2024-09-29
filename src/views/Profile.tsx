import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext'; 
import { db, storage } from '../firebase';  
import { doc, getDoc, updateDoc } from 'firebase/firestore';  
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';  
import { Button, Form, Spinner } from 'react-bootstrap';
import '../styles/style_profile.css'; 

interface ProfileProps {
  handleLogout?: () => void; 
}

const Profile: React.FC<ProfileProps> = ({ handleLogout }) => { 
  const { user } = useAuth();
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [rut, setRut] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [newPhoto, setNewPhoto] = useState<File | null>(null); 
  const [newContactNumber, setNewContactNumber] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false); // Para controlar la visibilidad de los campos

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFullName(userData?.fullName || '');
            setRut(userData?.rut || '');
            setContactNumber(userData?.contactNumber || '');
            setRole(userData?.role || '');
            setNewContactNumber(userData?.contactNumber || ''); 

            if (userData?.photoURL) {
              const imageRef = ref(storage, `profileImages/${user.uid}`);
              const url = await getDownloadURL(imageRef);
              setPhotoURL(url);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPhoto(e.target.files[0]);
    }
  };

  const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewContactNumber(e.target.value);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);

      // Subir la nueva imagen si se ha seleccionado una
      if (newPhoto) {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, newPhoto);
        
        uploadTask.on('state_changed', 
          () => {}, 
          (error) => {
            console.error('Error al subir la imagen:', error);
          }, 
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateDoc(userDocRef, { photoURL: downloadURL });
            setPhotoURL(downloadURL); 
          }
        );
      }

      // Actualizar el número de contacto
      if (newContactNumber !== contactNumber) {
        await updateDoc(userDocRef, { contactNumber: newContactNumber });
        setContactNumber(newContactNumber);
      }

      setUpdating(false);
      setEditMode(false); // Ocultar los campos después de actualizar
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setUpdating(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        {photoURL ? (
          <img src={photoURL} alt="Imagen de perfil" className="profile-image" />
        ) : (
          <div className="profile-image-placeholder" />
        )}
      </div>
      <div className="profile-info">
        <h2>{fullName}</h2>
        <p>{user?.email}</p>
        <p>{rut}</p>
        <p>{contactNumber}</p>
        <p><strong>Rol:</strong> {role}</p>
      </div>

      {/* Botón de actualizar debajo del perfil */}
      <div className="button-container">
        <Button 
          variant="primary" 
          className="update-profile-btn" 
          onClick={() => setEditMode(!editMode)} 
          style={{ marginBottom: '10px', width: '100%' }} // Mismo tamaño que cerrar sesión
        >
          Editar Perfil
        </Button>
        <Button 
          variant="secondary" 
          className="logout-btn" 
          onClick={handleLogout} 
          style={{ width: '100%' }}
        >
          Cerrar Sesión
        </Button>
      </div>

      {/* Solo mostrar los campos si está en modo de edición */}
      {editMode && (
        <Form>
          <Form.Group>
            <Form.Label>Actualizar imagen de perfil</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Actualizar número de contacto</Form.Label>
            <Form.Control
              type="text"
              value={newContactNumber}
              onChange={handleContactNumberChange}
            />
          </Form.Group>

          <div className="button-container">
            <Button variant="primary" onClick={handleUpdateProfile} disabled={updating}>
              {updating ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default Profile;
