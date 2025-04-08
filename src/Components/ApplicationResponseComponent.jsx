import React from "react";

const ApplicationResponseComponent = ({ surveyData, surveyResponseByAppId }) => {
  if (!surveyResponseByAppId || surveyResponseByAppId.length === 0) {
    return <div className="p-6 text-gray-500 text-center text-lg">No responses found.</div>;
  }

  // Extract field names from surveyData
  const fieldNames = surveyData?.question_groups?.flatMap(({ questions }) =>
    questions.map(({ fieldName }) => fieldName)
  ) || [];

  return (
    <div className="w-full p-6 space-y-8">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Survey Responses</h1>
      
      {surveyResponseByAppId.map(({ userName, role, response }, index) => {
        const responseMap = response.reduce((acc, { fieldName, response }) => {
          acc[fieldName] = response;
          return acc;
        }, {});

        return (
          <div key={index} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            {/* User Info */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-700">{userName}</h2>
              <p className="text-gray-500">Roles: {role.join(", ")}</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-md">
                <thead className="bg-gray-200">
                  <tr>
                    {fieldNames.map((fieldName) => (
                      <th key={fieldName} className="border p-3 text-left text-gray-600">{fieldName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    {fieldNames.map((fieldName) => (
                      <td key={fieldName} className="border p-3 text-gray-700">
                        {responseMap[fieldName] || "N/A"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationResponseComponent;
