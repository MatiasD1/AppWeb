import React from "react";
import logo from "../img/wolfLogoPNG.png"
const Loading = () => {
  return (
    <div className="loading-container">
        <img src={logo} alt="Company Logo" className="logoLoading"/>
        <div className="spinner"></div>
    </div>
  );
};

export default Loading;
