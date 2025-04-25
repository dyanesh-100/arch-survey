import React from "react";
import { useGlobalContext } from "../Context/GlobalContext";
import { Trash2 } from 'lucide-react';

const ApplicationItem = ({ application, onSelect, onDelete }) => {
  const { userData } = useGlobalContext();
  const userRole = userData?.role || "";
  
  return (
    <div className="p-4 bg-white shadow rounded hover:bg-gray-100 flex justify-between items-center cursor-pointer" 
      onClick={() => onSelect(application)}
    >
      <div className="flex-grow ">
        <h3 className="text-lg font-semibold">{application.applicationName}</h3>
        <p className="text-sm text-gray-600">{application.applicationDescription}</p>
      </div>
      {userRole === "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f" && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(application.applicationId);
          }}
          className="ml-4 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          title="Delete application"
          aria-label="Delete application"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ApplicationItem;