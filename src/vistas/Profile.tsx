import { useEffect, useState } from 'react';
import { auth } from '../firebase'; 
import UploadProfileImage from '../components/UploadProfileImage'; 

const Profile = () => {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [confirmChangeImage, setConfirmChangeImage] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setPhotoURL(auth.currentUser.photoURL);
    }
  }, []);

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

  // Función para manejar la actualización de la imagen después de la subida
  const handleImageUploadComplete = (newPhotoURL: string) => {
    setPhotoURL(newPhotoURL); // Actualiza el estado de la imagen de perfil
    setShowUploadImage(false); // Oculta el formulario de subida después de completar
  };

  return (
    <div>
      <h1>Perfil de Usuario</h1>

      {/* Muestra la imagen de perfil en un círculo */}
      {photoURL ? (
        <img 
          src={photoURL} 
          alt="Imagen de perfil" 
          style={{ 
            width: '150px', 
            height: '150px', 
            borderRadius: '50%', 
            objectFit: 'cover' 
          }} 
        />
      ) : (
        <p>No hay imagen de perfil</p>
      )}
      
      <p>Nombre: {auth.currentUser?.displayName || 'Sin nombre'}</p>
      <p>Email: {auth.currentUser?.email}</p>

      {/* Botón de configuración */}
      <button onClick={handleSettingsClick}>
        Configuración
      </button>

      {/* Menú de configuración desplegable */}
      {showSettings && (
        <div>
          <button onClick={handleChangeImageClick}>Imagen de Perfil</button>
        </div>
      )}

      {/* Componente de subida de imagen solo visible tras confirmación */}
      {showUploadImage && confirmChangeImage && (
        <div>
          <h3>Subir nueva imagen de perfil</h3>
          <UploadProfileImage onUploadComplete={handleImageUploadComplete} />
        </div>
      )}
    </div>
  );
};

export default Profile;