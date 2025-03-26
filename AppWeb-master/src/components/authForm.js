import React from "react";

const AuthForm = ({ title, buttonText, handleSubmit, fields = [], termsAccepted, setTermsAccepted }) => { // Recibe las props del login
  return (
    <div className="authContainer">
      <form className="formContainer" onSubmit={handleSubmit}> {/* Al enviar el formulario se ejecutará handleSubmit */}
        <h2>{title}</h2>

        {fields.length > 0 && fields.map((field, index) => ( // Si fields tiene elementos recorre el array generando un input por cada campo
          <div key={index} className="inputContainer">
            <label htmlFor={field.name}>{field.label}</label> 
            <input
              id={field.name}
              name={field.name}
              type={field.type || "text"}
              value={field.value}
              onChange={(e) => field.setValue(e.target.value)} // Cuando el usuario escribe, setValue actualiza el estado del campo 
              required
            />
          </div>
        ))}

        {setTermsAccepted && (
          <div className="termsContainer">
            <input 
              id="terms" 
              type="checkbox" 
              checked={termsAccepted} 
              onChange={(e) => setTermsAccepted(e.target.checked)} 
            />
            <label htmlFor="terms">Acepto los términos y condiciones</label>
          </div>
        )}
        <button className="buttonForm" type="submit">{buttonText}</button>
      </form>
    </div>
  );
};

export default AuthForm;