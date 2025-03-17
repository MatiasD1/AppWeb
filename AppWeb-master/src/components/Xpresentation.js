import React from "react";

const Presentation = ({ title, description, icon: Icon, actions }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center w-full max-w-md">
      {Icon && <Icon className="text-blue-500 w-12 h-12 mb-4" />}
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <p className="text-gray-600 mt-2">{description}</p>
      <div className="mt-4 flex gap-4">
        {actions?.map((action, index) => (
          <button
            key={index}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Presentation;