import React from "react";

const ApplicationItem = ({ application, onSelect }) => {
  return (
    <div 
      className="p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-100"
      onClick={() => onSelect(application)}
    >
      <h3 className="text-lg font-semibold">{application.applicationName}</h3>
      <p className="text-sm text-gray-600">{application.applicationDescription}</p>
    </div>
  );
};

export default ApplicationItem;
