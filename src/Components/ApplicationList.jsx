import React from "react";
import ApplicationItem from "./ApplicationItem";

const ApplicationList = ({ applications, onSelect, onDelete }) => {
  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No applications found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {applications.map((app) => (
        <ApplicationItem 
          key={app.applicationId} 
          application={app} 
          onSelect={onSelect} 
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ApplicationList;