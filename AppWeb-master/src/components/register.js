import React, { useState } from "react"; // Maneja los datos del formulario y la navegacion entre pasos
import { db } from "../firebaseConfig"; 
import { useNavigate } from "react-router-dom";
import { registerUser } from "../auth";
import { setDoc, doc } from "firebase/firestore";

const Register = () => {
  const [step, setStep] = useState(1); // Paso en el que va el usuario
  const [formData, setFormData] = useState({ // Almacena los datos que va ingresando el usuario
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    marcaAuto: "",
    modeloAuto: "",
    dominioAuto: "",
    licencia: "",
    aliasBancario: "",
    aceptaTerminos: false,
    password: "",
  });
  const [message, setMessage] = useState(""); // Almacena el mensaje de error para mostrar al final si el registro falla 
  const navigate = useNavigate();

  const handleChange = (e) => { // Se ejecuta cada vez que un usuario escribe en un input
    const { name, value, type, checked } = e.target; // "e" es el evento (e) que se crea automaticamente cuando ocurre una accion o evento en el DOM, y target sus valores, es decir, las 4 propiedades: nombre del input, valor ingresado, tipo de valor y true o false en caso de checkbox
    setFormData({ 
      ...formData, // Copia los datos actuales del formulario...
      [name]: type === "checkbox" ? checked : value, // ...true o false si es checkbox, si no el valor
    });
  };

  // Métodos para cambiar  el estado step 
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => { // Envia el formulario
    e.preventDefault(); // Evita que se envíe cuando ocurre un evento
    try {
      const user = await registerUser(formData.email, formData.password); // Registra usuario en Firebase Authentication
      
      // Guarda datos en Firestore con el rol asignado automáticamente
      await setDoc(doc(db, "usuarios", user.uid), {
        ...formData, // Guarda los datos almacenados
        role: "user",  // Asignación automática del rol "user"
        timestamp: new Date(),
      });
    
      console.log("✅ Registro exitoso");
      alert("Registro exitoso");
      navigate("/login"); // Redirige a /login
    } catch (error) {
      console.error("❌ Error al registrar:", error);
      setMessage("Hubo un error al registrar. Inténtalo nuevamente.");
      setStep(6); // Si hay un error lo muestra en el step 6 
    }
  };
  
  
  return (
    <div className="formContainer">
      <form onSubmit={handleSubmit}>
        <h1>Registrar</h1>

        {step === 1 && (
          <>
            <h2>Datos personales</h2>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required /> {/*value muestra el valor actual del campo (formData.nombre), es decir, los caracteres que se están ingresando en tiempo real, y handleChange agrega el valor al objeto formData */}
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" required />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Correo electrónico" required />
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" required />
            <button type="button" onClick={nextStep}>Siguiente</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Datos del vehículo</h2>
            <input type="text" name="marcaAuto" value={formData.marcaAuto} onChange={handleChange} placeholder="Marca del auto" required />
            <input type="text" name="modeloAuto" value={formData.modeloAuto} onChange={handleChange} placeholder="Modelo del auto" required />
            <input type="text" name="dominioAuto" value={formData.dominioAuto} onChange={handleChange} placeholder="Dominio del auto" required />
            <input type="text" name="licencia" value={formData.licencia} onChange={handleChange} placeholder="Número de licencia" required />
            <button type="button" onClick={prevStep}>Atrás</button>
            <button type="button" onClick={nextStep}>Siguiente</button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Datos bancarios</h2>
            <input type="text" name="aliasBancario" value={formData.aliasBancario} onChange={handleChange} placeholder="Alias bancario" required />
            <label>
              <input type="checkbox" name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} required />
              Acepto los términos y condiciones
            </label>
            <button type="button" onClick={prevStep}>Atrás</button>
            <button type="button" onClick={nextStep}>Siguiente</button>
          </>
        )}

        {step === 4 && (
          <>
            <h2>Crear contraseña</h2>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" required />
            <button type="button" onClick={prevStep}>Atrás</button>
            <button type="button" onClick={nextStep}>Siguiente</button>
          </>
        )}

        {step === 5 && (
          <>
            <h2>Confirmar Datos</h2>
            <p><strong>Nombre:</strong> {formData.nombre} {formData.apellido}</p>
            <p><strong>Email:</strong> {formData.email}</p> {/* Muestra la propiedad email del objeto formData */}
            <p><strong>Teléfono:</strong> {formData.telefono}</p>
            <p><strong>Auto:</strong> {formData.marcaAuto} {formData.modeloAuto}</p>
            <p><strong>Dominio:</strong> {formData.dominioAuto}</p>
            <p><strong>Licencia:</strong> {formData.licencia}</p>
            <p><strong>Alias bancario:</strong> {formData.aliasBancario}</p>
            <p><strong>Aceptó términos:</strong> {formData.aceptaTerminos ? "Sí" : "No"}</p>
            <button type="button" onClick={prevStep}>Atrás</button>
            <button type="submit">Registrar</button>
          </>
        )}

        {step === 6 && (
          <>
            <h2>{message}</h2>
            <button type="button" onClick={() => setStep(1)}>Volver al inicio</button>
          </>
        )}
      </form>
    </div>
  );
};

export default Register;
