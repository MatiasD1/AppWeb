import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import NavBar from "./navBar";
import { Link, useLocation } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const UploadImage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [user, setUser] =useState(null);

  const location = useLocation();
  const id = location.state.id;

  useEffect(()=>{
    
    const fetchUser = async () =>{
        const userRef =doc(db,"usuarios", id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()){
            setUser(userSnap.data());
        }else{
            console.log("No existe el usuario");
        }
    };
    if (id){
        fetchUser();
    }}, [id]);


  // Cargar imagen del localStorage si ya existe
  useEffect(() => {
    const savedImage = localStorage.getItem(`uploadedImage_${user?.email}`);
    if (savedImage) {
      setPreview(savedImage);
    }
  }, [user?.email]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); // Ahora sí se guarda el archivo en el estado
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreview(base64String);
        localStorage.setItem(`uploadedImage_${user?.email}`, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Por favor, selecciona una imagen primero.");
      return;
    }

    const templateParams = {
      name: user?.nombre || "Usuario desconocido",
      email: user?.email || "Email no disponible",
      message: `El usuario ${user?.nombre} ha subido una nueva imagen.`,
    };

    console.log("Enviando:", templateParams);

    try {
      await emailjs.send(
        "service_e37h2uk",
        "template_7bmzhk7",
        templateParams,
        "-xDfPr5oEJOtCZnFF"
      );

      alert("Correo enviado al administrador.");
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      alert("Hubo un problema al enviar el correo.");
    }
  };

  const handleDelete = async () => {
    if (!preview) return; // No hacer nada si no hay imagen

    // Eliminar imagen de localStorage
    localStorage.removeItem(`uploadedImage_${user?.email}`);
    
    // Limpiar el estado
    setPreview(null);
    setSelectedFile(null);

    alert("Imagen eliminada.");
  }

  if (!user) return <p>Cargando usuario...</p>

  return (
    <>
    <div>
      <div><NavBar/><Link to={`/user`}>Volver</Link></div>
      <h2>Detalles del Usuario</h2>
      <div className="formContainer">
        <h3>Subir Imagen</h3>
        <p>Usuario: {user?.nombre}</p>
        <p>Email: {user?.email}</p>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="Vista previa" width="200" />}
        <button onClick={handleUpload}>Enviar mail</button>
        {preview && <button onClick={handleDelete}>Eliminar Imagen</button>}
      </div>
      
    </div>
    </>
  );
};

export default UploadImage;
