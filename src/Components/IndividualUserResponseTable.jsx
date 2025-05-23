import React from "react";

const IndividualUserResponseTable = ({ userName, role, responseMap, evaluationParameters }) => {
  const excludedParameters = [
    "app_name",
    "app_description",
    "business_unit",
    "business_owner",
    "it_owner",
    "engineering_owner"
  ];

  // Filter out the excluded parameters
  const filteredParameters = evaluationParameters.filter(
    param => !excludedParameters.includes(param)
  );

  const formatResponse = (response) => {
    if (Array.isArray(response)) {
      return response.join(", ");
    }
    return response || "N/A";
  };
 
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-700">{userName}</h2>
        <p className="text-gray-500">Role: {role}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-md">
          <thead className="bg-gray-200">
            <tr>
              {filteredParameters.map((param) => (
                <th
                  key={param}
                  className="border p-3 text-left text-gray-600"
                >
                  {param}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50">
              {filteredParameters.map((param) => (
                <td
                  key={param}
                  className="border p-3 text-gray-700"
                >
                  {formatResponse(responseMap[param])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IndividualUserResponseTable;