import { useState } from 'react';
import { auth, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";

interface UploadProfileImageProps {
  onUploadComplete: (newPhotoURL: string) => void; // Callback para actualizar la URL de la imagen en Profile.tsx
}

const UploadProfileImage = ({ onUploadComplete }: UploadProfileImageProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !auth.currentUser) return;

    setUploading(true);

    const user = auth.currentUser;
    const storageRef = ref(storage, `profileImages/${user.uid}`);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, {
        photoURL: downloadURL,
      });

      setFile(null);
      onUploadComplete(downloadURL); // Llama al callback con la nueva URL de la imagen
      alert("Imagen de perfil actualizada con éxito");
    } catch (error) {
      console.error("Error al subir la imagen", error);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? "Subiendo..." : "Subir Imagen de Perfil"}
      </button>
    </div>
  );
};

export default UploadProfileImage;
