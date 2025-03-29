import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../auth";
import { setDoc, doc, Timestamp } from "firebase/firestore";
import AuthForm from "./authForm";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fechaDeInicio: Timestamp.fromDate(new Date()),
    fechaDeVencimiento: Timestamp.fromDate(new Date()),
    estado:"inactivo",
    finalizado:true,
    localidad: "",
    marcaAuto: "",
    modeloAuto: "",
    dominioAuto: "",
    licencia: "",
    aliasBancario: "",
    aceptaTerminos: false,
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await registerUser(formData.email, formData.password);
      await setDoc(doc(db, "usuarios", user.uid), {
        ...formData,
        role: "user",
        timestamp: new Date(),
      });
      alert("Registro exitoso");
      navigate("/login");
    } catch (error) {
      setMessage("Hubo un error al registrar. Inténtalo nuevamente.");
      setStep(6);
    }
  };

  const renderFields = () => {
    switch (step) {
      case 1:
        return [
          { name: "nombre", label: "Nombre", value: formData.nombre },
          { name: "apellido", label: "Apellido", value: formData.apellido },
          { name: "email", label: "Correo electrónico", type: "email", value: formData.email },
          { name: "telefono", label: "Teléfono", value: formData.telefono },
          { name: "localidad", label: "Localidad", value: formData.localidad },
        ];
      case 2:
        return [
          { name: "marcaAuto", label: "Marca del auto", value: formData.marcaAuto },
          { name: "modeloAuto", label: "Modelo del auto", value: formData.modeloAuto },
          { name: "dominioAuto", label: "Dominio del auto", value: formData.dominioAuto },
          { name: "licencia", label: "Número de licencia", value: formData.licencia },
        ];
      case 3:
        return [
          { name: "aliasBancario", label: "Alias bancario", value: formData.aliasBancario },
        ];
      case 4:
        return [
          { name: "password", label: "Contraseña", type: "password", value: formData.password },
        ];
      default:
        return [];
    }
  };

  const handleButtonClick = (e) => {
  e.preventDefault(); // Evitar que se recargue la página
  if (step === 5) {
    handleSubmit(e); // Si es el paso 5, ejecuta el submit
  } else {
    nextStep(); // En los demás pasos, avanza al siguiente paso
  }
};

  return (
    <div className="register">
      <AuthForm
        title="Registrar"
        buttonText={step === 5 ? "Registrar" : "Siguiente"}
        handleSubmit={handleButtonClick} // Usamos la nueva función para el botón
        fields={renderFields()}
        termsAccepted={formData.aceptaTerminos}
        setTermsAccepted={(checked) => setFormData({ ...formData, aceptaTerminos: checked })}
        handleChange={handleChange}
      >
        {step === 5 && (
          <div>
            <h2>Confirmar Datos</h2>
            <p><strong>Nombre:</strong> {formData.nombre} {formData.apellido}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Teléfono:</strong> {formData.telefono}</p>
            <p><strong>Auto:</strong> {formData.marcaAuto} {formData.modeloAuto}</p>
            <p><strong>Dominio:</strong> {formData.dominioAuto}</p>
            <p><strong>Licencia:</strong> {formData.licencia}</p>
            <p><strong>Alias bancario:</strong> {formData.aliasBancario}</p>
            <p><strong>Aceptó términos:</strong> {formData.aceptaTerminos ? "Sí" : "No"}</p>
          </div>
        )}
        {step === 6 && (
          <div>
            <h2>{message}</h2>
            <button type="button" onClick={() => setStep(1)}>Volver al inicio</button>
          </div>
        )}
      </AuthForm>
    </div>
  );
};

export default Register;
