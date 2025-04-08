import React from "react";

const ApplicationMetaDataComponent = ({ application, responseScores }) => {

  if (!application) return null; 
  
  return (
    <div className="bg-white p-6 mb-4 rounded shadow border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {application.applicationName}
      </h2>

      <div className="grid grid-cols-2 gap-4 text-gray-700">
        <div>
          <p className="text-sm text-gray-500">Application ID</p>
          <p className="font-medium">{application.applicationId}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Department</p>
          <p className="font-medium">{application.applicationDepartment}</p>
        </div>

          <div>
            <p className="text-sm text-gray-500">IT Owner</p>
            <p className="font-medium">{application.itOwner}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Business Unit</p>
            <p className="font-medium">{application.businessUnit}</p>
          </div>
      </div>

        <>
          <hr className="my-4 border-gray-300" />
          <p className="text-gray-600">{application.applicationDescription}</p>
        </>
      

    </div>
  );
};

export default ApplicationMetaDataComponent;
