import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import NavBar from "./navBar";
import { useLocation } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Loading from "./Loading"; // importado

const UploadImage = () => {
  const [preview, setPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // estado para mostrar Loading

  const location = useLocation();
  const id = location.state.id;
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, "usuarios", id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data());
        } else {
          console.log("No existe el usuario");
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      } finally {
        setLoading(false); // terminamos la carga
      }
    };
    if (id) fetchUser();
  }, [id]);

  useEffect(() => {
    const savedImage = localStorage.getItem(`uploadedImage_${user?.email}`);
    if (savedImage) {
      setPreview(savedImage);
    }
  }, [user?.email]);

  const uploadToCloudinary = async (imageBase64) => {
    const formData = new FormData();
    formData.append("file", imageBase64);
    formData.append("upload_preset", "Wolf publicidad");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dmtb1chtk/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  };

  const sendEmailToAdmin = async ({ message, image_url }) => {
    const templateParams = {
      name: user?.nombre || "Usuario desconocido",
      email: user?.email || "Email no disponible",
      message: message,
      image_url: image_url || "Sin imagen disponible",
    };

    try {
      await emailjs.send(
        "service_e37h2uk",
        "template_7bmzhk7",
        templateParams,
        "-xDfPr5oEJOtCZnFF"
      );
      console.log("Correo enviado al administrador.");
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      alert("Hubo un problema al enviar el correo.");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setPreview(base64String);
        localStorage.setItem(`uploadedImage_${user?.email}`, base64String);

        const imageUrl = await uploadToCloudinary(base64String);
        await sendEmailToAdmin({
          message: `El usuario ${user?.nombre} ha subido una nueva imagen.`,
          image_url: imageUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async () => {
    if (!preview) return;

    localStorage.removeItem(`uploadedImage_${user?.email}`);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }

    alert("Imagen eliminada.");

    await sendEmailToAdmin({
      message: `El usuario ${user?.nombre} ha eliminado su imagen.`,
      image_url: null,
    });
  };

  if (loading) return <Loading />;

  return (
    <>
      <NavBar />
      <div className="upload-imageContainer">
        <div className="upload-image">
          <h3>Subir Imagen</h3>
          <p>Usuario: {user?.nombre}</p>
          <p>Email: {user?.email}</p>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            ref={fileInputRef}
          />
          {preview && <img src={preview} alt="Vista previa" width="200" />}
          {preview && <button onClick={handleDelete}>Eliminar Imagen</button>}
        </div>
      </div>
    </>
  );
};

export default UploadImage;
