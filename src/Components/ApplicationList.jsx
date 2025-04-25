import React from "react";
import ApplicationItem from "./ApplicationItem";

const ApplicationList = ({ applications, onSelect, onDelete }) => {
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