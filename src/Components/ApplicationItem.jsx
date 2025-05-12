import React from "react";
import { useGlobalContext } from "../Context/GlobalContext";
import { Trash2 } from 'lucide-react';
import SurveyStatus from "../Components/SurveyStatus";

const ApplicationItem = ({ application, onSelect, onDelete }) => {
  const { userData } = useGlobalContext();
  const userRole = userData?.role || "";
  
  return (
    <div className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 flex flex-col cursor-pointer transition-all duration-200" 
      onClick={() => onSelect(application)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {application.applicationName}
            </h3>
            <div className="ml-2">
              {userRole === "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f" && (
                <SurveyStatus application={application} />
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {application.applicationDescription}
          </p>
        </div>
        
        {userRole === "d1c8c9c4-b3d3-419f-bbdb-bdf571d2619f" && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(application.applicationId);
            }}
            className="ml-4 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Delete application"
            aria-label="Delete application"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Additional metadata row if needed */}
      <div className="mt-2 flex items-center text-xs text-gray-500">
        <span className="mr-3">{application.applicationDepartment}</span>
        <span>{application.businessUnit}</span>
      </div>
    </div>
  );
};

export default ApplicationItem;