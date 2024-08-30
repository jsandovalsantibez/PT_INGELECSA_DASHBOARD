import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext'; 
import { firestore, storage } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import UploadProfileImage from '../components/UploadProfileImage';
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap';

const Profile: React.FC = () => {
  const { user } = useAuth(); 
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [rut, setRut] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [confirmChangeImage, setConfirmChangeImage] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFullName(userData?.fullName || '');
            setRut(userData?.rut || '');
            setContactNumber(userData?.contactNumber || '');
            setRole(userData?.role || '');

            // Obtener la URL de la imagen desde Firebase Storage
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

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const handleChangeImageClick = () => {
    const confirmChange = window.confirm("¿Deseas cambiar tu imagen de perfil?");
    if (confirmChange) {
      setConfirmChangeImage(true);
      setShowUploadImage(true);
    }
  };

  const handleImageUploadComplete = (newPhotoURL: string) => {
    setPhotoURL(newPhotoURL); 
    setShowUploadImage(false); 
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center">
            <Card.Header as="h5">Perfil de Usuario</Card.Header>
            <Card.Body>
              {photoURL ? (
                <img 
                  src={photoURL} 
                  alt="Imagen de perfil" 
                  className="rounded-circle mb-3"
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    objectFit: 'cover' 
                  }} 
                />
              ) : (
                <p>No hay imagen de perfil</p>
              )}

              <Card.Title>{fullName || 'Sin nombre'}</Card.Title>
              <Card.Text><strong>Email:</strong> {user?.email}</Card.Text>
              <Card.Text><strong>RUT:</strong> {rut || 'No disponible'}</Card.Text>
              <Card.Text><strong>Número de Contacto:</strong> {contactNumber || 'No disponible'}</Card.Text>
              <Card.Text><strong>Rol:</strong> {role || 'No asignado'}</Card.Text>

              <Button variant="secondary" onClick={handleSettingsClick} className="mt-2">
                Configuración
              </Button>

              {showSettings && (
                <div className="mt-3">
                  <Button variant="info" onClick={handleChangeImageClick}>
                    Cambiar Imagen de Perfil
                  </Button>
                </div>
              )}

              {showUploadImage && confirmChangeImage && (
                <div className="mt-4">
                  <h5>Subir nueva imagen de perfil</h5>
                  <UploadProfileImage onUploadComplete={handleImageUploadComplete} />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
