import React from "react";
import { useGlobalContext } from "../Context/GlobalContext";

const ApplicationItem = ({ application, onSelect }) => {
  const { userData } = useGlobalContext();
  const userRole = userData?.role || "";
  
  return (
    <tr 
      className="hover:bg-orange-50 transition-colors duration-150 cursor-pointer"
      onClick={() => onSelect(application)}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {application.applicationId}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">
        {application.applicationName}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
        {application.applicationDescription}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {application.applicationDepartment}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {application.businessUnit}
      </td>
    </tr>
  );
};

export default ApplicationItem;