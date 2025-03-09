import React from "react";

const AuthForm = ({ title, buttonText, handleSubmit, fields = [], termsAccepted, setTermsAccepted }) => {
  return (
    <div className="authContainer">
      <form className="formContainer" onSubmit={handleSubmit}>
        <h2>{title}</h2>

        {fields.length > 0 && fields.map((field, index) => (
          <div key={index} className="inputContainer">
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type={field.type || "text"}
              value={field.value}
              onChange={(e) => field.setValue(e.target.value)}
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
        <button type="submit">{buttonText}</button>
      </form>
    </div>
  );
};

export default AuthForm;