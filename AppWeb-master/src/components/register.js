import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../auth";
import { setDoc, doc } from "firebase/firestore";
import AuthForm from "./authForm";
import Loading from "./Loading";

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fechaDeInicio: null,
    fechaDeVencimiento: null,
    estado: "inactivo",
    localidad: "",
    marcaAuto: "",
    modeloAuto: "",
    dominioAuto: "",
    licencia: "",
    aliasBancario: "",
    aceptaTerminos: false,
    password: "",
    confirmPassword: "",
    aceptado:false
  });

  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touchedFields, setTouchedFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedProvincia, setSelectedProvincia] = useState("");
  const provinciasConLocalidades = {
    "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca", "Tandil"],
    "Catamarca": ["San Fernando del Valle de Catamarca", "Andalgalá", "Belén"],
    "Chaco": ["Resistencia", "Saenz Peña", "Villa Ángela"],
    "Chubut": ["Rawson", "Comodoro Rivadavia", "Puerto Madryn"],
    "Córdoba": ["Córdoba", "Villa María", "Río Cuarto", "San Francisco"],
    "Corrientes": ["Corrientes", "Goya", "Mercedes"],
    "Entre Ríos": ["Paraná", "Concordia", "Gualeguaychú"],
    "Formosa": ["Formosa", "Clorinda", "Pirané"],
    "Jujuy": ["San Salvador de Jujuy", "Palpalá", "Libertador General San Martín"],
    "La Pampa": ["Santa Rosa", "General Pico", "Toay"],
    "La Rioja": ["La Rioja", "Chilecito", "Chamical"],
    "Mendoza": ["Mendoza", "San Rafael", "Godoy Cruz"],
    "Misiones": ["Posadas", "Oberá", "Eldorado"],
    "Neuquén": ["Neuquén", "San Martín de los Andes", "Cutral Có"],
    "Río Negro": ["Viedma", "San Carlos de Bariloche", "General Roca"],
    "Salta": ["Salta", "San Ramón de la Nueva Orán", "Tartagal"],
    "San Juan": ["San Juan", "Rawson", "Chimbas"],
    "San Luis": ["San Luis", "Villa Mercedes", "Merlo"],
    "Santa Cruz": ["Río Gallegos", "Caleta Olivia", "El Calafate"],
    "Santa Fe": ["Santa Fe", "Rosario", "Rafaela"],
    "Santiago del Estero": ["Santiago del Estero", "La Banda", "Termas de Río Hondo"],
    "Tierra del Fuego": ["Ushuaia", "Río Grande", "Tolhuin"],
    "Tucumán": ["San Miguel de Tucumán", "Tafí Viejo", "Concepción"],
    "Ciudad Autónoma de Buenos Aires": ["Buenos Aires"]
  };
  
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "provincia") {
      setSelectedProvincia(value);
      setFormData({
        ...formData,
        provincia: value,
        localidad: "", // Reseteamos localidad al cambiar provincia
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });
  };
  
  const validateStepFields = () => {
    const fieldsToCheck = renderFields();
    for (let field of fieldsToCheck) {
      if (!formData[field.name] || (field.type === "select" && formData[field.name] === "")) {
        alert(`Debe completar todos los campos para continuar`);
        return false;
      }
    }
    return true;
  };
  
  const validatePassword = () => {
    const { password, confirmPassword } = formData;
    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 4 && !validatePassword()) {
      return;
    }
  
    try {
      setLoading(true); // Activamos el estado de carga
      const user = await registerUser(formData.email, formData.password);
      await setDoc(doc(db, "usuarios", user.uid), {
        ...formData,
        role: "user",
        timestamp: new Date(),
      });
      
      setLoading(false); // Desactivamos el estado de carga 
      alert("Registro exitoso.");
      navigate("/login");
    } catch (error) {
      setLoading(false); // Desactivamos el estado de carga
      console.error("Error en el registro:", error);
  
      if (error.code === "auth/email-already-in-use") {
        alert("El correo ya está en uso. Usa otro o intenta iniciar sesión.");
      } else if (error.code === "auth/weak-password") {
        alert("La contraseña es muy débil. Intenta con al menos 6 caracteres.");
      } else if (error.code === "auth/invalid-email") {
        alert("El formato del email es inválido. Revisa e intenta nuevamente.");
      } else if (error.code === "auth/network-request-failed") {
        alert("Error de conexión. Verifica tu internet e intenta otra vez.");
      } else {
        alert("Hubo un error inesperado. Intenta nuevamente más tarde.");
      }
      
      setMessage("Hubo un error al registrar. Inténtalo nuevamente.");
      setStep(6);
    }
  };

  const nextStep = () => {

    if (!validateStepFields()) {
      return;
    }

    if (step === 4 && !validatePassword()) {
      return;
    }
    
    // Evita que se avance automáticamente si el usuario aún no ha aceptado los términos
    if (step === 5 && !formData.aceptaTerminos) {
      alert("Debes aceptar los términos y condiciones.");
      return;
    }
  
    setStep(step + 1);
  };
  

  const prevStep = () => setStep(step - 1);

  const renderFields = () => {
    switch (step) {
      case 1:
        return [
          { name: "nombre", label: "Nombre", value: formData.nombre },
          { name: "apellido", label: "Apellido", value: formData.apellido },
          { name: "email", label: "Correo electrónico", type: "email", value: formData.email },
          { name: "telefono", label: "Teléfono", value: formData.telefono },
          { name: "provincia", label: "Provincia", type: "select", options: Object.keys(provinciasConLocalidades), value: selectedProvincia },
          { name: "localidad", label: "Localidad", type: "select", options: selectedProvincia ? provinciasConLocalidades[selectedProvincia] : [], value: formData.localidad }
        ];
      case 2:
        return [
          { name: "marcaAuto", label: "Marca del auto", value: formData.marcaAuto },
          { name: "modeloAuto", label: "Modelo del auto", value: formData.modeloAuto },
          { name: "dominioAuto", label: "Dominio del auto", value: formData.dominioAuto },
          { name: "licencia", label: "Número de licencia", value: formData.licencia },
        ];
      case 3:
        return [{ name: "aliasBancario", label: "Alias bancario", value: formData.aliasBancario }];
      case 4:
        return [
          { name: "password", label: "Contraseña", type: "password", value: formData.password },
          { name: "confirmPassword", label: "Confirmar contraseña", type: "password", value: formData.confirmPassword },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="register">
      {loading ? (
        <Loading/>// Muestra un mensaje de carga mientras se registra
      ) : (
      <AuthForm
        title="Registrar"
        handleSubmit={handleSubmit}
        fields={renderFields()}
        termsAccepted={step === 5 ? formData.aceptaTerminos : undefined}
        setTermsAccepted={step === 5 ? (checked) => setFormData({ ...formData, aceptaTerminos: checked }) : undefined}
        handleChange={handleChange}
        showSubmitButton={false} // No se mostrará el botón de submit
      >
        {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

        {/* Botones de navegación */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          {step > 1 && (
            <button type="button" onClick={prevStep} style={{ marginRight: "10px" }}>
              Anterior
            </button>
          )}
         {step === 6 ? (
            <button type="button" onClick={handleSubmit}>Registrar</button>
          ) : (
            <button type="button" onClick={nextStep}>
              {step === 5 ? "Confirmar" : "Siguiente"}
            </button>
          )}

        </div>

        {/* Paso 6: Confirmación */}
        {step === 6 && (
          <div>
            <h2>Confirmar Datos</h2>
            <p><strong>Nombre:</strong> {formData.nombre} {formData.apellido}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Teléfono:</strong> {formData.telefono}</p>
            <p><strong>Auto:</strong> {formData.marcaAuto} {formData.modeloAuto}</p>
            <p><strong>Dominio:</strong> {formData.dominioAuto}</p>
            <p><strong>Licencia:</strong> {formData.licencia}</p>
            <p><strong>Alias bancario:</strong> {formData.aliasBancario}</p>
          </div>
        )}

        {step === 7 && (
          <div>
            <h2>{message}</h2>
            <button type="button" onClick={() => setStep(1)}>Volver al inicio</button>
          </div>
        )}
      </AuthForm>
       )}
    </div>
  );
};

export default Register;
