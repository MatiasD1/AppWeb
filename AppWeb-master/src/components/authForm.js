import React from "react";

const AuthForm = ({ title, buttonText, handleSubmit, fields = [], termsAccepted, setTermsAccepted, handleChange, children, showSubmitButton }) => {
  return (
    <div className="authContainer">
      <form className="formContainer" onSubmit={handleSubmit}>
        <h2>{title}</h2>

        {fields.length > 0 &&
          fields.map((field, index) => (
            <div key={index} className="inputContainer">
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={field.value}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {field.options?.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  value={field.value}
                  onChange={handleChange}
                  required
                />
              )}

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
        {showSubmitButton && (
          <button className="buttonForm" type="submit">{buttonText}</button>
        )}
        {children}
      </form>
    </div>
  );
};

export default AuthForm;
